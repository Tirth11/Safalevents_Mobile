import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  SectionTitle,
  Avatar,
  Row,
  Divider,
  EmptyState,
  ApprovalBadge,
} from '../../components/ui';
import {
  myRsvps,
  GUEST,
  useStore,
  getCheckinState,
  getCheckedInCount,
  getGuestHistorySummary,
} from '../../data/mock';

export default function GuestTicketsScreen({ navigation, route }) {
  useStore();

  const actionCount = myRsvps.filter(
    (r) => r.approvalState === 'UNDER_APPROVAL' || r.status === 'waitlist'
  ).length;

  const summary = getGuestHistorySummary(GUEST.email);
  const accuracyColor =
    summary.accuracy >= 80 ? colors.success || '#16a34a'
      : summary.accuracy >= 50 ? '#d97706'
      : '#dc2626';

  return (
    <Screen>
      <Row style={styles.between}>
        <Text style={font.h1}>My Tickets</Text>
        <Avatar seed={GUEST.avatarSeed} size={42} />
      </Row>

      {actionCount > 0 ? (
        <Badge
          tone="amber"
          dot
          label={`${actionCount} Action Required`}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}

      <SectionTitle>Upcoming &amp; Pending</SectionTitle>

      {myRsvps.map((rsvp) => {
        const event = rsvp.event;
        const isWaitlist = rsvp.status === 'waitlist';
        const isPending = rsvp.approvalState === 'UNDER_APPROVAL';
        const isRejected = rsvp.approvalState === 'REJECTED';
        const showMessageHost = event.messagingEnabled && !isRejected;
        const isConfirmed = rsvp.status === 'going' && rsvp.approvalState === 'APPROVED';
        const checkin = isConfirmed ? getCheckinState(rsvp) : null;

        return (
          <Card key={rsvp.id} padded={false} style={styles.ticketCard}>
            <Row style={{ alignItems: 'stretch' }}>
              <Image source={{ uri: event.cover }} style={styles.ticketCover} />
              <View style={{ flex: 1, padding: spacing.md }}>
                <Text style={[font.h3, { marginBottom: spacing.xs }]} numberOfLines={2}>
                  {event.title}
                </Text>
                <Row>
                  <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                  <Text style={[font.small, { marginLeft: spacing.xs, flex: 1 }]} numberOfLines={1}>
                    {event.date} • {event.location}
                  </Text>
                </Row>
                <Row style={{ marginTop: spacing.sm }}>
                  <Avatar seed={event.hostName} size={22} />
                  <Text style={[font.small, { marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>
                    Hosted by {event.hostName}
                  </Text>
                </Row>
                <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }}>
                  <View style={{ alignSelf: 'flex-start', marginRight: spacing.sm }}>
                    <ApprovalBadge rsvp={rsvp} />
                  </View>
                  {checkin ? (
                    <View style={[styles.checkinBadge, { backgroundColor: checkin.bg }]}>
                      <Text style={[styles.checkinText, { color: checkin.color }]}>
                        {checkin.label}
                      </Text>
                    </View>
                  ) : null}
                </Row>
              </View>
            </Row>

            <Divider style={{ marginVertical: 0 }} />

            <View style={{ padding: spacing.md }}>
              {isWaitlist ? (
                <Button label="Waitlisted" variant="outline" disabled />
              ) : isPending ? (
                <Button label="Awaiting Approval" variant="outline" disabled />
              ) : isRejected ? (
                <Button label="Not Approved" variant="outline" disabled />
              ) : (
                <Button
                  label="View Pass"
                  variant="primary"
                  icon="qr-code-outline"
                  onPress={() => navigation.navigate('GuestTicketPass', { eventId: rsvp.eventId })}
                />
              )}

              {showMessageHost ? (
                <Button
                  label="Message Host"
                  variant="outline"
                  icon="chatbubbles-outline"
                  style={{ marginTop: spacing.sm }}
                  onPress={() => navigation.navigate('GuestChat', { eventId: rsvp.eventId })}
                />
              ) : null}
            </View>
          </Card>
        );
      })}

      <Row style={[styles.between, { alignItems: 'center', marginTop: spacing.md }]}>
        <SectionTitle style={{ marginTop: 0 }}>Check-in History</SectionTitle>
        {summary.found && summary.recent.length > 0 ? (
          <TouchableOpacity
            hitSlop={8}
            activeOpacity={0.7}
            onPress={async () => {
              const lines = summary.recent
                .map((h) => `• ${h.event} (${h.date}) — checked in ${h.actual}/${h.rsvpCount}`)
                .join('\n');
              const msg =
                `📋 My SafalEvents Activity & Check-in History\n\n` +
                `Events attended: ${summary.totalEventsRsvpd}\n` +
                `Attendance accuracy: ${summary.accuracy}%\n` +
                `No-shows: ${summary.noShow}\n\n${lines}`;
              try {
                await Share.share({ title: 'My SafalEvents Activity', message: msg });
              } catch (e) {
                Alert.alert('Download Activity', 'Your activity history has been saved to your device.');
              }
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="download-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13, marginLeft: 4 }}>Download</Text>
          </TouchableOpacity>
        ) : null}
      </Row>

      {summary.found && summary.recent.length > 0 ? (
        <>
          <Card style={{ marginBottom: spacing.md }}>
            <Row style={styles.between}>
              <View style={styles.statTile}>
                <Text style={[font.h2, { textAlign: 'center' }]}>
                  {summary.totalEventsRsvpd}
                </Text>
                <Text style={[font.small, { textAlign: 'center' }]}>Events Attended</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={[font.h2, { textAlign: 'center', color: accuracyColor }]}>
                  {`${summary.accuracy}%`}
                </Text>
                <Text style={[font.small, { textAlign: 'center' }]}>Accuracy</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={[font.h2, { textAlign: 'center' }]}>{summary.noShow}</Text>
                <Text style={[font.small, { textAlign: 'center' }]}>No-Shows</Text>
              </View>
            </Row>
          </Card>

          {summary.recent.map((h, i) => {
            const status =
              h.actual >= h.rsvpCount
                ? { tone: 'green', label: 'Fully Attended' }
                : h.actual > 0
                ? { tone: 'amber', label: 'Partial' }
                : { tone: 'red', label: 'No Show' };
            return (
              <Card key={`${h.event}-${i}`} style={{ marginBottom: spacing.sm }}>
                <Row style={styles.between}>
                  <Row style={{ flex: 1 }}>
                    <View style={styles.histIcon}>
                      <Ionicons name="ticket-outline" size={16} color={colors.textMuted} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
                      <Text style={[font.body, { fontWeight: '700' }]} numberOfLines={1}>
                        {h.event}
                      </Text>
                      <Text style={[font.small, { marginTop: spacing.xs }]} numberOfLines={1}>
                        {h.date} • Checked in {h.actual}/{h.rsvpCount}
                      </Text>
                    </View>
                  </Row>
                  <Badge tone={status.tone} label={status.label} style={{ marginLeft: spacing.sm }} />
                </Row>
              </Card>
            );
          })}
        </>
      ) : (
        <Card>
          <EmptyState
            icon="ticket-outline"
            title="No attendance history yet"
            subtitle="Your past events will appear here."
          />
        </Card>
      )}
    </Screen>
  );
}

export { GuestTicketsScreen };

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  ticketCard: { marginBottom: spacing.lg, overflow: 'hidden' },
  ticketCover: { width: 96, alignSelf: 'stretch', minHeight: 124, backgroundColor: colors.surfaceHover },
  checkinBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm || 6,
    alignSelf: 'flex-start',
  },
  checkinText: { fontSize: 11, fontWeight: '700' },
  statTile: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  histIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
