import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, TextInput, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  Row,
  Divider,
  ScreenHeader,
} from '../../components/ui';
import { events, getEvent, GUEST, myRsvps, meetsAge, useStore, updateRsvpStatus, updateRsvpDetails } from '../../data/mock';

/* ─── QR Code Mock ─────────────────────────────────────────────────────────────
   A grid-based faux QR code built from nested Views. Renders three 7x7 finder
   patterns (top-left, top-right, bottom-left) plus pseudo-random data modules
   so it reads like a real QR at a glance. Deterministic per eventId.           */

const QR_SIZE = 160;
const QR_MODULES = 25; // 25x25 grid (QR Version 2)
const CELL = QR_SIZE / QR_MODULES;

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

function buildFinderPattern() {
  // 7x7 finder: outer ring dark, inner ring white, center 3x3 dark
  const p = Array.from({ length: 7 }, () => Array(7).fill(false));
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const inCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      p[r][c] = onBorder || inCenter;
    }
  }
  return p;
}

function generateQRGrid(seed) {
  const grid = Array.from({ length: QR_MODULES }, () => Array(QR_MODULES).fill(false));
  const finder = buildFinderPattern();
  const rand = seededRandom(seed);

  // Place finder patterns at the three canonical corners
  const origins = [
    [0, 0],                          // top-left
    [0, QR_MODULES - 7],             // top-right
    [QR_MODULES - 7, 0],             // bottom-left
  ];

  // Mark finder zones (including 1-cell separator) so data dots don't overlap
  const reserved = Array.from({ length: QR_MODULES }, () => Array(QR_MODULES).fill(false));

  origins.forEach(([or, oc]) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        grid[or + r][oc + c] = finder[r][c];
      }
    }
    // Reserve the finder + 1-cell quiet zone around it
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const gr = or + r;
        const gc = oc + c;
        if (gr >= 0 && gr < QR_MODULES && gc >= 0 && gc < QR_MODULES) {
          reserved[gr][gc] = true;
        }
      }
    }
  });

  // Timing patterns (row 6 and col 6 — alternating dark/light)
  for (let i = 8; i < QR_MODULES - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Fill remaining cells with pseudo-random data dots
  for (let r = 0; r < QR_MODULES; r++) {
    for (let c = 0; c < QR_MODULES; c++) {
      if (!reserved[r][c]) {
        grid[r][c] = rand() > 0.55;
      }
    }
  }

  return grid;
}

function QRCodeMock({ eventId }) {
  const grid = useMemo(() => generateQRGrid(eventId || '1'), [eventId]);

  return (
    <View style={qrStyles.container}>
      <View style={qrStyles.grid}>
        {grid.map((row, ri) => (
          <View key={ri} style={qrStyles.row}>
            {row.map((filled, ci) => (
              <View
                key={ci}
                style={[
                  qrStyles.cell,
                  { backgroundColor: filled ? colors.text : colors.white },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const qrStyles = StyleSheet.create({
  container: {
    width: QR_SIZE + 16,
    height: QR_SIZE + 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  grid: {
    width: QR_SIZE,
    height: QR_SIZE,
  },
  row: {
    flexDirection: 'row',
    height: CELL,
  },
  cell: {
    width: CELL,
    height: CELL,
  },
});

/* ─── Screen ───────────────────────────────────────────────────────────────── */

export default function GuestTicketPassScreen({ navigation, route }) {
  useStore();
  const event = getEvent(route.params?.eventId) || events[0];
  const myRsvp = myRsvps.find((r) => r.eventId === event.id);
  const ageVerified = myRsvp
    ? (myRsvp.dob ? meetsAge(myRsvp.dob, event.minimumAge || 18) : !!myRsvp.ageVerified)
    : true;

  const guestCount = myRsvp?.guestCount || 1;
  const additionalGuests = myRsvp?.additionalGuests || [];
  const referenceId = myRsvp ? myRsvp.id.toUpperCase() : 'RSVP-' + event.id;

  const handleAddToCalendar = (calendarName) => {
    let msg = `Added "${event.title}" to your ${calendarName}.\n\nDate: ${event.date} • ${event.time}\nVenue: ${event.location}`;
    if (event.dressCode && event.dressCode !== 'No Dress Code') {
      const dcName = event.dressCode === 'Other' ? (event.customDressCode || 'Custom attire') : event.dressCode;
      msg += `\n\nDress Code: ${dcName}`;
      if (event.dressCodeAvoid) {
        msg += `\n(Avoid: ${event.dressCodeAvoid})`;
      }
    }
    Alert.alert('Calendar Invite Created', msg);
  };

  return (
    <Screen>
      <ScreenHeader title="Event Pass" onBack={() => navigation.goBack()} />

      <Card padded={false} style={styles.passCard}>
        {/* ── Cover section ─────────────────────────────────────────────── */}
        <View style={styles.passTop}>
          <Image source={{ uri: event.cover }} style={styles.cover} />
          <View style={styles.coverOverlay} />
          <Text style={styles.passLabel}>EVENT PASS</Text>
          {guestCount > 1 && (
            <View style={styles.guestCountBadge}>
              <Ionicons name="people" size={12} color={colors.white} />
              <Text style={styles.guestCountText}>{guestCount} guests</Text>
            </View>
          )}
        </View>

        {/* ── Tear line ─────────────────────────────────────────────────── */}
        <View style={styles.tearLineContainer}>
          <View style={styles.tearNotchLeft} />
          <View style={styles.tearDashed} />
          <View style={styles.tearNotchRight} />
        </View>

        {/* ── QR & booking section ──────────────────────────────────────── */}
        <View style={{ padding: spacing.lg, alignItems: 'center' }}>
          <QRCodeMock eventId={event.id} />

          <Text style={[font.small, { marginTop: spacing.md }]}>Reference ID</Text>
          <Text style={styles.referenceId}>{referenceId}</Text>

          <Text style={[font.small, { marginTop: spacing.xs }]}>Booking ID</Text>
          <Text style={[font.h3, { color: colors.primary }]}>{'RSVP-' + event.id}</Text>

          {event.ageRestricted ? (
            <View style={{ marginTop: spacing.md }}>
              <Badge
                tone={ageVerified ? 'green' : 'amber'}
                label={ageVerified ? `\u{1F512} Age Verified: ${event.minimumAge}+` : '\u{26A0}️ Age Unverified – Check ID'}
              />
            </View>
          ) : null}

          <Divider />

          <Text style={[font.small, { alignSelf: 'flex-start' }]}>Guest</Text>
          <Text style={[font.body, { fontWeight: '700', alignSelf: 'flex-start' }]} numberOfLines={1}>
            {GUEST.name}
          </Text>

          {/* ── Party Members (additional guests) ─────────────────────── */}
          {additionalGuests.length > 0 && (
            <View style={styles.partySection}>
              <Row style={{ alignItems: 'center', marginBottom: spacing.sm }}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
                <Text style={[font.h3, { marginLeft: spacing.sm }]}>
                  Party Members ({guestCount})
                </Text>
              </Row>

              {additionalGuests.map((guest, idx) => (
                <View key={idx} style={styles.partyMember}>
                  <View style={styles.partyAvatar}>
                    <Text style={styles.partyAvatarText}>
                      {(guest.firstName || '?')[0]}{(guest.lastName || '?')[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[font.body, { fontWeight: '600' }]} numberOfLines={1}>
                      {guest.firstName} {guest.lastName}
                    </Text>
                    <Text style={font.small}>Additional Guest</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                </View>
              ))}
            </View>
          )}

          <Text style={[font.small, { alignSelf: 'flex-start', marginTop: spacing.sm }]}>Event</Text>
          <Text style={[font.body, { fontWeight: '700', alignSelf: 'stretch' }]} numberOfLines={2}>
            {event.title}
          </Text>

          <Row style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[font.small, { marginLeft: spacing.xs }]}>
              {event.date} • {event.time}
            </Text>
          </Row>
          {/* Mode-specific Ticket details */}
          {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && event.venueName ? (
            <View style={{ alignSelf: 'stretch', marginTop: spacing.xs }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: spacing.xs }}>
                  <Text style={[font.small, { fontWeight: '700' }]}>{event.venueName}</Text>
                  <Text style={font.tiny}>{event.venueAddressLine1}{event.venueAddressLine2 ? ` ${event.venueAddressLine2}` : ''}</Text>
                  <Text style={font.tiny}>{event.venueCity}, {event.venueState} {event.venuePostalCode}</Text>
                  {event.venueMapLink ? (
                    <TouchableOpacity onPress={() => Linking.openURL(event.venueMapLink)}>
                      <Text style={[font.tiny, { color: colors.primary, fontWeight: '700', marginTop: 2 }]}>View on Map</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </Row>
            </View>
          ) : (event.eventMode !== 'Virtual' && event.eventMode !== 'Hybrid') ? (
            <Row style={{ marginTop: spacing.xs, alignSelf: 'stretch' }}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={[font.small, { marginLeft: spacing.xs, flex: 1 }]} numberOfLines={2}>{event.location}</Text>
            </Row>
          ) : null}

          {(event.eventMode === 'Virtual' || event.eventMode === 'Hybrid') ? (
            <View style={{ alignSelf: 'stretch', marginTop: spacing.xs }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <Ionicons name="videocam-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: spacing.xs }}>
                  <Text style={[font.small, { fontWeight: '700' }]}>Virtual Meeting ({event.meetingPlatform || 'Zoom'})</Text>
                  {event.meetingLink ? (
                    <TouchableOpacity onPress={() => Linking.openURL(event.meetingLink)}>
                      <Text style={[font.tiny, { color: colors.primary, fontWeight: '700', marginTop: 2 }]} numberOfLines={1}>Join Meeting</Text>
                    </TouchableOpacity>
                  ) : null}
                  {event.meetingId ? <Text style={font.tiny}>ID: {event.meetingId}</Text> : null}
                  {event.meetingPasscode ? <Text style={font.tiny}>Passcode: {event.meetingPasscode}</Text> : null}
                </View>
              </Row>
            </View>
          ) : null}
          {event.dressCode && event.dressCode !== 'No Dress Code' && (
            <Row style={{ marginTop: spacing.xs, alignSelf: 'stretch' }}>
              <Ionicons name="shirt-outline" size={14} color={colors.textMuted} />
              <Text style={[font.small, { marginLeft: spacing.xs, flex: 1, fontWeight: '700', color: colors.primary }]} numberOfLines={1}>
                Dress Code: {event.dressCode === 'Other' ? (event.customDressCode || 'Custom attire') : event.dressCode}
              </Text>
            </Row>
          )}

          <Divider />

          <Text style={[font.small, { alignSelf: 'flex-start' }]}>Check-In Status</Text>
          <Row style={{ alignSelf: 'flex-start', marginTop: spacing.xs, alignItems: 'center' }}>
            <Ionicons
              name={myRsvp?.checkedIn ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={myRsvp?.checkedIn ? colors.accent : colors.textMuted}
            />
            <Text style={[font.body, { fontWeight: '700', color: myRsvp?.checkedIn ? colors.accent : colors.textMuted, marginLeft: spacing.xs }]}>
              {myRsvp?.checkedIn ? 'Checked In' : 'Not Checked In Yet'}
            </Text>
          </Row>

          {myRsvp && (
            <View style={{ alignSelf: 'stretch', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[font.small, { marginBottom: spacing.sm }]}>Your RSVP Details {event.allowSelfEdit ? '(Editable)' : ''}</Text>
              
              {/* Guest Count Edit */}
              <View style={{ marginBottom: spacing.md }}>
                <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.xs }]}>Number of Guests</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(myRsvp.guestCount || 1)}
                  editable={!!event.allowSelfEdit}
                  onChangeText={(t) => {
                    const count = Math.max(1, parseInt(t) || 1);
                    updateRsvpDetails(myRsvp.id, { guestCount: count });
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 6,
                    color: colors.text,
                    backgroundColor: event.allowSelfEdit ? colors.white : colors.surfaceHover,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Custom Answers Edit */}
              {event.questions && event.questions.map((q) => {
                const currentAns = myRsvp.answers?.[q] || '';
                return (
                  <View key={q} style={{ marginBottom: spacing.md }}>
                    <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.xs }]} numberOfLines={1}>{q}</Text>
                    <TextInput
                      value={currentAns}
                      editable={!!event.allowSelfEdit}
                      placeholder="Type answer..."
                      onChangeText={(t) => {
                        const updatedAnswers = { ...(myRsvp.answers || {}), [q]: t };
                        updateRsvpDetails(myRsvp.id, { answers: updatedAnswers });
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 6,
                        color: colors.text,
                        backgroundColor: event.allowSelfEdit ? colors.white : colors.surfaceHover,
                        fontSize: 14,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {myRsvp && (
            <View style={{ alignSelf: 'stretch', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[font.small, { marginBottom: spacing.sm }]}>Change Attendance RSVP</Text>
              <Row style={{ gap: 8 }}>
                {[
                  { key: 'going', label: 'Yes (Going)', color: '#16a34a', bg: '#16a34a12' },
                  { key: 'maybe', label: 'Maybe', color: '#d97706', bg: '#d9770612' },
                  { key: 'declined', label: 'No (Declined)', color: '#dc2626', bg: '#dc262612' }
                ].map((opt) => {
                  const isActive = myRsvp.status === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.85}
                      onPress={() => {
                        updateRsvpStatus(myRsvp.id, opt.key);
                        Alert.alert('RSVP Updated', `Your status is now: ${opt.label}`);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.xs,
                        minHeight: 44,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: isActive ? opt.color : colors.border,
                        backgroundColor: isActive ? opt.bg : colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text numberOfLines={1} style={{ color: isActive ? opt.color : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Row>
            </View>
          )}
        </View>
      </Card>

      {/* ── Download / Save QR Pass ───────────────────────────────────── */}
      <Button
        label="Download QR Pass"
        variant="primary"
        icon="download-outline"
        style={{ marginTop: spacing.lg }}
        onPress={async () => {
          try {
            await Share.share({
              title: `SafalEvents Pass — ${event.title}`,
              message:
                `🎟️ SafalEvents Event Pass\n\n` +
                `${event.title}\n${event.date} • ${event.time}\n${event.location}\n\n` +
                `Guest: ${GUEST.name}${guestCount > 1 ? ` (+${guestCount - 1})` : ''}\n` +
                `Reference ID: ${referenceId}\n` +
                `Booking ID: RSVP-${event.id}\n\n` +
                `Present this QR pass at the entrance to check in.`,
            });
          } catch (e) {
            Alert.alert('Download Pass', `Saved pass reference ${referenceId} to your device.`);
          }
        }}
      />

      <Button
        label="Share Pass Link"
        variant="outline"
        icon="share-social-outline"
        style={{ marginTop: spacing.md }}
        onPress={() => Alert.alert('Share Pass', `Pass link copied to clipboard!\nhttps://safalevents.com/pass/${referenceId.toLowerCase()}`)}
      />

      <Row style={{ marginTop: spacing.md }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Button
            label="Google Calendar"
            variant="outline"
            icon="calendar"
            small
            onPress={() => handleAddToCalendar('Google Calendar')}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Button
            label="Apple Calendar"
            variant="outline"
            icon="calendar"
            small
            onPress={() => handleAddToCalendar('Apple Calendar')}
          />
        </View>
      </Row>

      {event.messagingEnabled ? (
        <Button
          label="Message the Host"
          variant="outline"
          icon="chatbubbles-outline"
          style={{ marginTop: spacing.md }}
          onPress={() => navigation.navigate('GuestChat', { eventId: event.id })}
        />
      ) : null}

      <Button
        label="Give event feedback"
        variant="outline"
        icon="chatbox-ellipses-outline"
        style={{ marginTop: spacing.md }}
        onPress={() => navigation.navigate('GuestFeedback', { eventId: event.id })}
      />

      <Button
        label="Back to My Tickets"
        variant="ghost"
        icon="chevron-back"
        style={{ marginTop: spacing.md }}
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}

export { GuestTicketPassScreen };

const styles = StyleSheet.create({
  passCard: { overflow: 'hidden' },
  passTop: { width: '100%', height: 120, backgroundColor: colors.surfaceHover },
  cover: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  passLabel: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  guestCountBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  guestCountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  /* Tear line */
  tearLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    overflow: 'visible',
  },
  tearNotchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.bg,
    marginLeft: -7,
  },
  tearNotchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.bg,
    marginRight: -7,
  },
  tearDashed: {
    flex: 1,
    borderBottomWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },

  /* Reference ID */
  referenceId: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: spacing.xs,
  },

  /* Party members */
  partySection: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partyMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  partyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  partyAvatarText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
