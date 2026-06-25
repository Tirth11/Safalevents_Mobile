import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, StyleSheet } from 'react-native';
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
import { events, getEvent, GUEST, meetsAge, createGuestRsvp } from '../../data/mock';

// Small controlled input that matches the shared Field styling.
function LInput({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={[font.small, { fontWeight: '700', marginBottom: 4, color: colors.text }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function GuestRsvpScreen({ navigation, route }) {
  const event = getEvent(route.params?.eventId) || events[0];
  const restricted = !!event.ageRestricted;
  const minAge = event.minimumAge || 18;

  const [guestCount, setGuestCount] = useState(1);
  const [dob, setDob] = useState('');
  const [extras, setExtras] = useState([]); // [{ firstName, lastName, dob }]

  const setCount = (n) => {
    const c = Math.max(1, Math.min(10, n));
    setGuestCount(c);
    setExtras((prev) => {
      const arr = [...prev];
      while (arr.length < c - 1) arr.push({ firstName: '', lastName: '', dob: '' });
      arr.length = c - 1;
      return arr;
    });
  };
  const updateExtra = (i, field, v) =>
    setExtras((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: v } : g)));

  const onSubmit = () => {
    if (restricted) {
      if (!dob) return Alert.alert('Date of birth required', 'Please enter your date of birth to verify your age.');
      if (!meetsAge(dob, minAge))
        return Alert.alert('Age requirement not met', `Sorry, you must be at least ${minAge} years old to attend this event.`);
    }
    for (let i = 0; i < extras.length; i++) {
      const g = extras[i];
      if (!g.firstName.trim() || !g.lastName.trim())
        return Alert.alert('Guest details needed', `Please enter the first and last name for Guest ${i + 2}.`);
      if (restricted) {
        if (!g.dob) return Alert.alert('Date of birth required', `Please enter the date of birth for Guest ${i + 2}.`);
        if (!meetsAge(g.dob, minAge))
          return Alert.alert('Age requirement not met', `Guest ${i + 2} doesn't meet the ${minAge}+ requirement. Correct the date of birth or reduce your guest count.`);
      }
    }
    const data = {
      name: GUEST.name,
      email: GUEST.email,
      phone: GUEST.phone,
      guestCount,
      dob,
      additionalGuests: extras,
      answers: [],
    };
    const res = createGuestRsvp(event.id, data);

    const message = res.pending
      ? 'Request submitted — pending host approval.'
      : res.waitlisted
      ? "You're on the waitlist — we'll notify you if a spot opens."
      : 'RSVP confirmed! Your pass is ready in My Tickets.';

    Alert.alert(
      res.pending ? 'Request submitted' : res.waitlisted ? 'Waitlisted' : 'Success',
      message,
      [
        {
          text: 'OK',
          onPress: () => {
            try {
              navigation.navigate('GuestTabs', { screen: 'Tickets' });
            } catch (e) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScreenHeader title="RSVP" subtitle={event.title} onBack={() => navigation.goBack()} />

      {restricted ? (
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.redTint, borderColor: colors.red }}>
          <Row>
            <Ionicons name="lock-closed" size={18} color={colors.red} />
            <Text style={[font.small, { marginLeft: spacing.sm, flex: 1, color: colors.text, fontWeight: '700' }]}>
              This is a {minAge}+ event. A date of birth is required for every attendee.
            </Text>
          </Row>
        </Card>
      ) : null}

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
        {restricted ? (
          <LInput label={`Date of birth * (${minAge}+ event)`} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />
        ) : null}
      </Card>

      <SectionTitle>Attendance</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={[font.small, { fontWeight: '700', marginBottom: 6, color: colors.text }]}>
          Number of guests (including you)
        </Text>
        <Row style={{ marginBottom: extras.length ? spacing.md : 0 }}>
          <TouchableOpacity onPress={() => setCount(guestCount - 1)} style={styles.stepBtn} activeOpacity={0.8}>
            <Ionicons name="remove" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ width: 44, textAlign: 'center', fontWeight: '800', fontSize: 16, color: colors.text }}>{guestCount}</Text>
          <TouchableOpacity onPress={() => setCount(guestCount + 1)} style={styles.stepBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color={colors.text} />
          </TouchableOpacity>
        </Row>

        {extras.map((g, i) => (
          <View key={i} style={styles.extraBox}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: colors.text, marginBottom: 8 }}>
              Guest {i + 2} <Text style={{ color: colors.textMuted, fontWeight: '500' }}>(+{i + 1})</Text>
            </Text>
            <Row style={{ gap: 8 }}>
              <View style={{ flex: 1 }}>
                <LInput label="First name" value={g.firstName} onChangeText={(v) => updateExtra(i, 'firstName', v)} placeholder="Jane" />
              </View>
              <View style={{ flex: 1 }}>
                <LInput label="Last name" value={g.lastName} onChangeText={(v) => updateExtra(i, 'lastName', v)} placeholder="Doe" />
              </View>
            </Row>
            {restricted ? (
              <LInput label="Date of birth *" value={g.dob} onChangeText={(v) => updateExtra(i, 'dob', v)} placeholder="YYYY-MM-DD" />
            ) : null}
          </View>
        ))}
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBox: {
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 10,
  },
});
