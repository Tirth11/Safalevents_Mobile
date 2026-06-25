import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, ApprovalBadge, EmptyState } from '../../components/ui';
import {
  useStore, getCurrentStaff, getEvent, getRsvps, validateScan, checkInGuest, staffCan, calcAge, meetsAge,
  MOCK_GUESTS, getTrustBadge, getEventStatus, getPartyMembers,
} from '../../data/mock';

export default function StaffCheckinScreen() {
  useStore();
  const staff = getCurrentStaff();
  const event = getEvent(staff?.eventId) || getEvent('1');
  const eventRsvps = getRsvps(event.id);

  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);
  const [arrivalCount, setArrivalCount] = useState(1);

  const goingApproved = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const arrived = goingApproved.filter((r) => r.checkedIn);
  const canCheckin = staffCan('checkin');

  // Attendee-level counts (sum of guestCount across RSVPs)
  const totalAttendees = goingApproved.reduce((n, r) => n + (r.guestCount || 1), 0);
  const arrivedAttendees = arrived.reduce((n, r) => n + (r.checkedInCount || r.guestCount || 1), 0);

  const handleScan = (passId) => {
    if (!passId) return;
    const scanResult = validateScan(event.id, passId);
    setResult(scanResult);
    setScanning(false);
    // Reset arrival count: default to remaining party members
    if (scanResult.ok && scanResult.rsvp) {
      const already = scanResult.rsvp.checkedInCount || 0;
      const remaining = (scanResult.rsvp.guestCount || 1) - already;
      setArrivalCount(Math.max(1, remaining));
    } else {
      setArrivalCount(1);
    }
  };

  const confirmArrival = (rsvp, count) => {
    const total = rsvp.guestCount || 1;
    const alreadyIn = rsvp.checkedInCount || 0;
    const arriving = count || arrivalCount;
    const newCount = Math.min(alreadyIn + arriving, total);
    const scannerName = `${staff?.name || 'Gate Staff'} (Staff)`;

    // Update partial check-in fields on the rsvp
    rsvp.checkedInCount = newCount;
    if (!rsvp.checkInLog) rsvp.checkInLog = [];
    rsvp.checkInLog.push({
      count: arriving,
      at: new Date().toISOString(),
      by: scannerName,
    });

    // Mark fully checked in only when entire party has arrived
    if (newCount >= total) {
      checkInGuest(rsvp.id, scannerName);
    }

    setResult(null);
    setManualId('');
    const isPartial = newCount < total;
    Alert.alert(
      isPartial ? `Partial Check-in (${newCount}/${total})` : 'Full Check-in',
      isPartial
        ? `${arriving} of ${rsvp.name}'s party checked in (${newCount}/${total} total).\n${total - newCount} still pending.`
        : `${rsvp.name}'s full party of ${total} is now checked in.\nA confirmation email was sent and the host dashboard is updated.`,
    );
  };

  const toneFor = (code) => (code === 'valid' ? colors.accent : code === 'duplicate' || code === 'pending' ? colors.amber : colors.red);

  return (
    <Screen contentStyle={{ paddingBottom: 28 }}>
      <SectionTitle>Gate Check-in</SectionTitle>
      <Text style={[font.small, { marginTop: -4, marginBottom: spacing.md }]}>{event.title} · {event.date}</Text>

      {/* Live arrivals — attendee-level counts */}
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={font.small}>Attendees checked in</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>
              {arrivedAttendees}<Text style={{ fontSize: 16, color: colors.textMuted }}> / {totalAttendees}</Text>
            </Text>
          </View>
          <View style={[styles.bigIcon, { backgroundColor: colors.accentTint }]}>
            <Ionicons name="people" size={28} color={colors.accent} />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: totalAttendees ? `${Math.round((arrivedAttendees / totalAttendees) * 100)}%` : '0%' }]} />
          </View>
          <Text style={[font.tiny, { marginTop: 4, color: colors.textMuted }]}>
            {arrived.length} of {goingApproved.length} RSVPs arrived{' '}
            ({totalAttendees > 0 ? Math.round((arrivedAttendees / totalAttendees) * 100) : 0}% of attendees)
          </Text>
        </View>
      </Card>

      {/* Big scan CTA */}
      <Button label={scanning ? 'Scanning…' : 'Scan guest QR'} icon="qr-code-outline" onPress={() => { setScanning(true); setResult(null); }} style={{ marginBottom: spacing.lg, paddingVertical: 16 }} />

      {/* Scanner */}
      {scanning ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.viewfinder}>
            <Ionicons name="qr-code-outline" size={88} color={colors.primary} />
            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
          </View>
          <Text style={[font.small, { textAlign: 'center', marginTop: 10 }]}>Point the camera at the guest's QR pass</Text>

          <Row style={{ marginTop: spacing.md, gap: 8 }}>
            <TextInput value={manualId} onChangeText={setManualId} placeholder="…or type pass ID (e.g. r1)" placeholderTextColor={colors.textMuted} autoCapitalize="none" style={styles.input} />
            <Button label="Verify" small onPress={() => handleScan(manualId)} />
          </Row>

          <Text style={[font.tiny, { marginTop: spacing.md, marginBottom: 6, fontWeight: '700', color: colors.text }]}>
            Demo (no camera): tap a guest to simulate scanning their QR
          </Text>
          {eventRsvps.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => handleScan(r.id)} style={styles.passRow} activeOpacity={0.8}>
              <Avatar seed={r.name} size={32} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                <Text style={font.tiny}>Pass {r.id} · {r.checkedIn ? 'checked in' : 'not arrived'}</Text>
              </View>
              <Ionicons name="scan-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setScanning(false)} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Close scanner</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {/* Scan result — full guest details, then check in */}
      {result ? (
        <Card style={{ marginBottom: spacing.lg, borderColor: toneFor(result.code), borderWidth: 1.5 }}>
          <Row style={{ marginBottom: 12 }}>
            <Ionicons
              name={result.ok ? 'checkmark-circle' : result.code === 'duplicate' || result.code === 'pending' ? 'alert-circle' : 'close-circle'}
              size={24}
              color={toneFor(result.code)}
            />
            <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 15, color: colors.text, flex: 1 }}>{result.message}</Text>
          </Row>

          {result.rsvp ? (
            <View style={styles.detailCard}>
              <Row>
                <Avatar seed={result.rsvp.name} size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '800', fontSize: 17, color: colors.text }}>{result.rsvp.name}</Text>
                  <ApprovalBadge rsvp={result.rsvp} />
                </View>
              </Row>

              <View style={styles.detailRows}>
                <DetailRow icon="mail-outline" label="Email" value={result.rsvp.email} />
                {result.rsvp.phone ? <DetailRow icon="call-outline" label="Phone" value={result.rsvp.phone} /> : null}
                <DetailRow icon="people-outline" label="Party size" value={`${result.rsvp.guestCount || 1} attendee${(result.rsvp.guestCount || 1) > 1 ? 's' : ''}`} />
                <DetailRow icon="ticket-outline" label="Pass ID" value={result.rsvp.id} />
                <DetailRow icon="calendar-outline" label="Event" value={event.title} />
              </View>

              {event.ageRestricted ? (() => {
                const verified = result.rsvp.dob ? meetsAge(result.rsvp.dob, event.minimumAge) : !!result.rsvp.ageVerified;
                const yrs = calcAge(result.rsvp.dob);
                return (
                  <View style={{ marginTop: 10, padding: 10, borderRadius: radius.md, backgroundColor: verified ? colors.accentTint : colors.amberTint }}>
                    <Text style={{ fontWeight: '800', fontSize: 13.5, color: verified ? colors.accent : colors.amber }}>
                      {verified
                        ? `🔒 Age Verified: ${event.minimumAge}+${yrs != null ? ` (${yrs} yrs)` : ''}`
                        : '⚠️ Age Unverified — check physical ID'}
                    </Text>
                  </View>
                );
              })() : null}

              {Object.keys(result.rsvp.answers || {}).length > 0 ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 2 }]}>Responses</Text>
                  {Object.entries(result.rsvp.answers).map(([q, a]) => (
                    <Text key={q} style={font.tiny}><Text style={{ fontWeight: '700' }}>{q} </Text>{a}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Partial check-in controls ── */}
          {result.ok && canCheckin ? (() => {
            const rsvp = result.rsvp;
            const total = rsvp.guestCount || 1;
            const alreadyIn = rsvp.checkedInCount || 0;
            const remaining = total - alreadyIn;
            const partyMembers = getPartyMembers(rsvp.name, total);
            const guestIntel = MOCK_GUESTS.find((g) => g.email === rsvp.email);
            const pct = total > 0 ? Math.round((alreadyIn / total) * 100) : 0;

            return (
              <View style={{ marginTop: spacing.md }}>
                {/* Party members list */}
                {total > 1 ? (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={[font.small, { fontWeight: '800', color: colors.text, marginBottom: 6 }]}>
                      Party Members ({alreadyIn}/{total})
                    </Text>
                    {partyMembers.map((member, i) => {
                      const isIn = i < alreadyIn;
                      return (
                        <Row key={i} style={{ paddingVertical: 6 }}>
                          <View style={[styles.statusDot, { backgroundColor: isIn ? colors.accent : colors.border }]} />
                          <Text style={{ flex: 1, fontSize: 13.5, color: colors.text, marginLeft: 8 }}>{member}</Text>
                          <Badge tone={isIn ? 'green' : 'neutral'} label={isIn ? 'IN' : 'PENDING'} dot />
                        </Row>
                      );
                    })}
                  </View>
                ) : null}

                {/* Attendance progress (for parties > 1) */}
                {total > 1 ? (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 4 }]}>
                      Attendance Progress
                    </Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={[font.tiny, { marginTop: 3, color: colors.textMuted }]}>
                      {alreadyIn} of {total} checked in ({pct}%) -- {remaining} remaining
                    </Text>
                  </View>
                ) : null}

                {/* Arrival stepper */}
                {remaining > 0 ? (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 6 }]}>
                      How many arriving now?
                    </Text>
                    <Row style={{ alignItems: 'center', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => setArrivalCount((c) => Math.max(1, c - 1))}
                        style={[styles.stepperBtn, arrivalCount <= 1 && { opacity: 0.35 }]}
                        disabled={arrivalCount <= 1}
                      >
                        <Ionicons name="remove" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, minWidth: 36, textAlign: 'center' }}>
                        {arrivalCount}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setArrivalCount((c) => Math.min(remaining, c + 1))}
                        style={[styles.stepperBtn, arrivalCount >= remaining && { opacity: 0.35 }]}
                        disabled={arrivalCount >= remaining}
                      >
                        <Ionicons name="add" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={[font.tiny, { color: colors.textMuted, marginLeft: 4 }]}>
                        of {remaining} remaining
                      </Text>
                    </Row>
                  </View>
                ) : null}

                {/* Check-in action buttons */}
                {remaining > 0 ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button
                      label={`Check In ${arrivalCount}`}
                      icon="checkmark-done"
                      variant="accent"
                      onPress={() => confirmArrival(rsvp, arrivalCount)}
                      style={{ flex: 1, paddingVertical: 15 }}
                    />
                    {remaining > 1 && arrivalCount < remaining ? (
                      <Button
                        label={`All ${remaining}`}
                        icon="people"
                        variant="outline"
                        onPress={() => confirmArrival(rsvp, remaining)}
                        style={{ paddingVertical: 15, paddingHorizontal: 16 }}
                      />
                    ) : null}
                  </View>
                ) : (
                  <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: colors.accentTint, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', color: colors.accent, fontSize: 14 }}>
                      Entire party checked in ({total}/{total})
                    </Text>
                  </View>
                )}

                {/* Historical Guest Intelligence */}
                {guestIntel ? (() => {
                  const badge = getTrustBadge(guestIntel.trustScore);
                  const accuracy = guestIntel.totalAttendees > 0
                    ? Math.round((guestIntel.actualAttendees / guestIntel.totalAttendees) * 100) : 0;
                  const noShows = (guestIntel.history || []).filter((h) => h.actual === 0).length;
                  const partials = (guestIntel.history || []).filter((h) => h.actual > 0 && h.actual < h.rsvpCount).length;

                  return (
                    <View style={[styles.intelCard, { marginTop: spacing.md }]}>
                      <Row style={{ marginBottom: 8 }}>
                        <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                        <Text style={{ marginLeft: 6, fontWeight: '800', fontSize: 13, color: colors.text }}>
                          Guest Intelligence
                        </Text>
                      </Row>

                      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <View style={[styles.intelChip, { backgroundColor: badge.bg }]}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: badge.color }}>
                            Trust: {guestIntel.trustScore}% ({badge.text})
                          </Text>
                        </View>
                        <View style={[styles.intelChip, { backgroundColor: colors.surfaceHover }]}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                            Accuracy: {accuracy}%
                          </Text>
                        </View>
                      </Row>

                      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                        <Text style={[font.tiny, { color: colors.textMuted }]}>
                          {guestIntel.eventsRsvpd} events
                        </Text>
                        <Text style={[font.tiny, { color: colors.textMuted }]}>|</Text>
                        <Text style={[font.tiny, { color: noShows > 0 ? colors.red : colors.textMuted }]}>
                          {noShows} no-show{noShows !== 1 ? 's' : ''}
                        </Text>
                        <Text style={[font.tiny, { color: colors.textMuted }]}>|</Text>
                        <Text style={[font.tiny, { color: partials > 0 ? colors.amber : colors.textMuted }]}>
                          {partials} partial{partials !== 1 ? 's' : ''}
                        </Text>
                      </Row>

                      {guestIntel.pattern ? (
                        <Text style={[font.tiny, { color: colors.textMuted }]}>
                          Pattern: {guestIntel.pattern}
                        </Text>
                      ) : null}

                      {/* Recent history (last 3 events) */}
                      {(guestIntel.history || []).length > 0 ? (
                        <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 }}>
                          {guestIntel.history.slice(0, 3).map((h, i) => {
                            const st = getEventStatus(h.rsvpCount, h.actual);
                            return (
                              <Row key={i} style={{ paddingVertical: 3 }}>
                                <Text style={{ fontSize: 11, color: st.color, width: 14 }}>{st.icon}</Text>
                                <Text style={{ flex: 1, fontSize: 11.5, color: colors.text }}>{h.event}</Text>
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                  {h.actual}/{h.rsvpCount}
                                </Text>
                              </Row>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })() : null}
              </View>
            );
          })() : null}
          {result.ok && !canCheckin ? (
            <Text style={[font.small, { marginTop: 12 }]}>Your role can view this guest but not check them in.</Text>
          ) : null}
          {!result.ok ? (
            <Button label="Scan again" variant="outline" icon="qr-code-outline" onPress={() => { setResult(null); setScanning(true); }} style={{ marginTop: spacing.lg }} />
          ) : null}
        </Card>
      ) : null}

      {/* Recent arrivals */}
      <SectionTitle>Recent arrivals</SectionTitle>
      {arrived.length === 0 ? (
        <EmptyState icon="time-outline" title="No arrivals yet" subtitle="Scanned guests appear here." />
      ) : (
        <Card padded={false} style={{ padding: 6 }}>
          {arrived.map((r) => (
            <Row key={r.id} style={{ padding: 10 }}>
              <Avatar seed={r.name} size={32} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                <Text style={font.tiny}>{r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'arrived'}</Text>
              </View>
              <Badge tone="green" dot label="Arrived" />
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Row style={{ marginTop: 8 }}>
      <Ionicons name={icon} size={15} color={colors.textMuted} style={{ width: 20 }} />
      <Text style={{ width: 78, fontSize: 12.5, color: colors.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13.5, color: colors.text }}>{value}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  bigIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { height: 184, borderRadius: radius.md, backgroundColor: '#0f0f14', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.primary },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  passRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  detailCard: { backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 14 },
  detailRows: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 },
  // Partial check-in styles
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  stepperBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  intelCard: { backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 12 },
  intelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
