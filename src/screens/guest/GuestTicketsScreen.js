import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
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
import { myRsvps, GUEST } from '../../data/mock';

export default function GuestTicketsScreen({ navigation, route }) {
  const actionCount = myRsvps.filter(
    (r) => r.approvalState === 'UNDER_APPROVAL' || r.status === 'waitlist'
  ).length;

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

        return (
          <Card key={rsvp.id} padded={false} style={styles.ticketCard}>
            <Row style={{ alignItems: 'stretch' }}>
              <Image source={{ uri: event.cover }} style={styles.ticketCover} />
              <View style={{ flex: 1, padding: spacing.md }}>
                <Text style={[font.h3, { marginBottom: 4 }]} numberOfLines={2}>
                  {event.title}
                </Text>
                <Row>
                  <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                  <Text style={[font.small, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                    {event.date} • {event.location}
                  </Text>
                </Row>
                <Row style={{ marginTop: 8 }}>
                  <Avatar seed={event.hostName} size={22} />
                  <Text style={[font.small, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>
                    Hosted by {event.hostName}
                  </Text>
                </Row>
                <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                  <ApprovalBadge rsvp={rsvp} />
                </View>
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

      <SectionTitle>Event History &amp; Records</SectionTitle>
      <Card>
        <Row style={styles.between}>
          <Row style={{ flex: 1 }}>
            <View style={styles.histIcon}>
              <Ionicons name="ticket-outline" size={16} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
              <Text style={[font.body, { fontWeight: '700' }]} numberOfLines={1}>
                Spring Networking Brunch
              </Text>
              <Text style={font.small}>Attended • 2026-04-12</Text>
            </View>
          </Row>
          <Badge tone="gray" label="Past" />
        </Row>
      </Card>
    </Screen>
  );
}

export { GuestTicketsScreen };

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  ticketCard: { marginBottom: spacing.md, overflow: 'hidden' },
  ticketCover: { width: 90, height: '100%', minHeight: 120, backgroundColor: colors.surfaceHover },
  histIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
