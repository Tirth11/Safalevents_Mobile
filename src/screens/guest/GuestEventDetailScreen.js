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
} from '../../components/ui';
import { events, getEvent } from '../../data/mock';
import { useAuth, gateAction } from '../../auth/AuthContext';

export default function GuestEventDetailScreen({ navigation, route }) {
  const auth = useAuth();
  const event = getEvent(route.params?.eventId) || events[0];

  return (
    <Screen contentStyle={{ padding: 0 }}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: event.cover }} style={styles.cover} />
        <View style={styles.coverOverlay} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.coverText}>
          <Badge tone="primary" label={event.eventType} />
          <Text style={[font.h1, { color: colors.white, marginTop: 6 }]}>{event.title}</Text>
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <Card style={{ marginBottom: spacing.lg }}>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[font.body, { marginLeft: spacing.md }]}>
              {event.date} • {event.time}
            </Text>
          </Row>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={[font.body, { marginLeft: spacing.md, flex: 1 }]}>{event.location}</Text>
          </Row>
          <Row style={{ marginBottom: spacing.sm }}>
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={[font.body, { marginLeft: spacing.md }]}>
              Capacity {event.capacity}
            </Text>
          </Row>
          <Divider />
          <Row>
            <Avatar seed={event.hostName} size={36} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={[font.body, { fontWeight: '700' }]}>{event.hostName}</Text>
              <Text style={font.small}>Host</Text>
            </View>
          </Row>
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[font.body, { lineHeight: 21 }]}>{event.description}</Text>
        </Card>

        {event.questions.length > 0 ? (
          <>
            <SectionTitle>What the host asks</SectionTitle>
            <Card style={{ marginBottom: spacing.lg }}>
              {event.questions.map((q, idx) => (
                <Row key={idx} style={{ marginBottom: idx < event.questions.length - 1 ? spacing.sm : 0 }}>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  <Text style={[font.body, { marginLeft: spacing.sm, flex: 1 }]}>{q}</Text>
                </Row>
              ))}
            </Card>
          </>
        ) : null}

        <Card style={{ marginBottom: spacing.lg, borderColor: colors.primary }}>
          <Text style={font.h2}>
            {event.approvalRequired ? 'Request your spot' : 'Reserve your spot'}
          </Text>
          <Text style={[font.small, { marginTop: 4 }]}>
            {event.approvalRequired
              ? 'This event requires organizer approval.'
              : 'RSVP now — capacity is limited.'}
          </Text>

          {event.enablePayments ? (
            <Row style={{ marginTop: spacing.md }}>
              <Ionicons name="ticket-outline" size={18} color={colors.primary} />
              <Text style={[font.h3, { marginLeft: spacing.sm }]}>
                Ticket: ${event.ticketPrice}
              </Text>
            </Row>
          ) : null}

          <Button
            label={event.approvalRequired ? 'Request to Join' : 'RSVP Now'}
            variant="primary"
            style={{ marginTop: spacing.lg }}
            onPress={() => gateAction(auth, navigation, { nav: 'GuestRsvp', params: { eventId: event.id }, role: 'guest' })}
          />

          {event.messagingEnabled ? (
            <Button
              label="Message Host"
              variant="outline"
              icon="chatbubbles-outline"
              style={{ marginTop: spacing.sm }}
              onPress={() => gateAction(auth, navigation, { nav: 'GuestChat', params: { eventId: event.id } })}
            />
          ) : null}

          {!auth.isAuthed ? (
            <Text style={[font.tiny, { textAlign: 'center', marginTop: 10 }]}>
              You're browsing as a guest — we'll ask you to sign in when you RSVP.
            </Text>
          ) : null}
        </Card>
      </View>
    </Screen>
  );
}

export { GuestEventDetailScreen };

const styles = StyleSheet.create({
  coverWrap: { width: '100%', height: 210, backgroundColor: colors.surfaceHover },
  cover: { width: '100%', height: '100%' },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
