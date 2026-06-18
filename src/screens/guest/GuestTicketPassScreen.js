import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
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
import { events, getEvent, GUEST } from '../../data/mock';

export default function GuestTicketPassScreen({ navigation, route }) {
  const event = getEvent(route.params?.eventId) || events[0];

  return (
    <Screen>
      <ScreenHeader title="Event Pass" onBack={() => navigation.goBack()} />

      <Card padded={false} style={styles.passCard}>
        <View style={styles.passTop}>
          <Image source={{ uri: event.cover }} style={styles.cover} />
          <View style={styles.coverOverlay} />
          <Text style={styles.passLabel}>EVENT PASS</Text>
        </View>

        <View style={styles.dashed} />

        <View style={{ padding: spacing.lg, alignItems: 'center' }}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={110} color={colors.text} />
          </View>

          <Text style={[font.small, { marginTop: spacing.md }]}>Booking ID</Text>
          <Text style={[font.h3, { color: colors.primary }]}>{'RSVP-' + event.id}</Text>

          <Divider />

          <Text style={[font.small, { alignSelf: 'flex-start' }]}>Guest</Text>
          <Text style={[font.body, { fontWeight: '700', alignSelf: 'flex-start' }]}>
            {GUEST.name}
          </Text>

          <Text style={[font.small, { alignSelf: 'flex-start', marginTop: spacing.sm }]}>Event</Text>
          <Text style={[font.body, { fontWeight: '700', alignSelf: 'flex-start' }]}>
            {event.title}
          </Text>

          <Row style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[font.small, { marginLeft: 4 }]}>
              {event.date} • {event.time}
            </Text>
          </Row>
          <Row style={{ marginTop: 4, alignSelf: 'flex-start' }}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[font.small, { marginLeft: 4, flex: 1 }]}>{event.location}</Text>
          </Row>
        </View>
      </Card>

      <Row style={{ marginTop: spacing.lg }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Button
            label="Google Calendar"
            variant="outline"
            icon="calendar"
            small
            onPress={() => Alert.alert('Add to Calendar', 'Prototype — not wired')}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Button
            label="Apple Calendar"
            variant="outline"
            icon="calendar"
            small
            onPress={() => Alert.alert('Add to Calendar', 'Prototype — not wired')}
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
  dashed: {
    borderBottomWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginHorizontal: spacing.lg,
  },
  qrBox: {
    width: 150,
    height: 150,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
