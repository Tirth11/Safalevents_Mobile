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
  Row,
  Divider,
  Field,
  ScreenHeader,
} from '../../components/ui';
import { events, getEvent, GUEST } from '../../data/mock';

export default function GuestRsvpScreen({ navigation, route }) {
  const event = getEvent(route.params?.eventId) || events[0];

  const onSubmit = () => {
    Alert.alert(
      event.approvalRequired ? 'Request submitted' : 'Success',
      event.approvalRequired ? 'Request submitted — pending approval' : 'RSVP confirmed!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <Screen>
      <ScreenHeader title="RSVP" subtitle={event.title} onBack={() => navigation.goBack()} />

      {event.approvalRequired ? (
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.amberTint, borderColor: colors.amber }}>
          <Row>
            <Ionicons name="time-outline" size={18} color={colors.amber} />
            <Text style={[font.small, { marginLeft: spacing.sm, flex: 1, color: colors.text }]}>
              This event requires organizer approval — your request will be reviewed.
            </Text>
          </Row>
        </Card>
      ) : null}

      <SectionTitle>Your details</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Field label="Full name" value={GUEST.name} />
        <Field label="Email" value={GUEST.email} keyboardType="email-address" />
        <Field label="Phone" value={GUEST.phone} keyboardType="phone-pad" />
      </Card>

      <SectionTitle>Attendance</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Field label="Number of guests" value="1" keyboardType="numeric" />
      </Card>

      {event.questions.length > 0 ? (
        <>
          <SectionTitle>Host questions</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            {event.questions.map((q, idx) => (
              <Field key={idx} label={q} placeholder="Your answer" />
            ))}
          </Card>
        </>
      ) : null}

      {event.enablePayments ? (
        <>
          <SectionTitle>Payment</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={[styles.between, { marginBottom: spacing.md }]}>
              <Text style={[font.body, { fontWeight: '700' }]}>Ticket price</Text>
              <Text style={[font.h3, { color: colors.primary }]}>${event.ticketPrice}</Text>
            </Row>
            <Field label="Card number" placeholder="1234 5678 9012 3456" keyboardType="numeric" />
            <Row>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Field label="Expiry" placeholder="MM/YY" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Field label="CVC" placeholder="123" keyboardType="numeric" />
              </View>
            </Row>
          </Card>
        </>
      ) : null}

      <Button
        label={event.approvalRequired ? 'Submit request' : 'Confirm RSVP'}
        variant="primary"
        onPress={onSubmit}
      />
    </Screen>
  );
}

export { GuestRsvpScreen };

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
});
