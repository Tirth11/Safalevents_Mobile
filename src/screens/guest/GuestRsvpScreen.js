import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Row, Divider, ScreenHeader } from '../../components/ui';
import { events, getEvent, GUEST, meetsAge, calcAge, createGuestRsvp } from '../../data/mock';

// Controlled text input matching the app's field styling.
function LInput({ label, value, onChangeText, placeholder, keyboardType, required }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.xs, color: colors.text }]}>
          {label} {required ? <Text style={{ color: colors.red }}>*</Text> : null}
        </Text>
      ) : null}
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

const RESPONSES = [
  { key: 'going', label: "I'm Going", icon: 'checkmark-circle', color: colors.accent },
  { key: 'maybe', label: 'Maybe', icon: 'help-circle', color: colors.amber },
  { key: 'no', label: "Can't Go", icon: 'close-circle', color: colors.red },
];

export default function GuestRsvpScreen({ navigation, route }) {
  const event = getEvent(route.params?.eventId) || events[0];
  const restricted = !!event.ageRestricted;
  const minAge = event.minimumAge || 18;

  const [response, setResponse] = useState('going');
  const [name, setName] = useState(GUEST.name);
  const [email, setEmail] = useState(GUEST.email);
  const [phone, setPhone] = useState(GUEST.phone);
  const [guestCount, setGuestCount] = useState(1);
  const [dob, setDob] = useState('');
  const [answers, setAnswers] = useState({}); // { [question]: value }
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(null); // result of createGuestRsvp

  // Additional guests are a headcount only — no names or details collected.
  const setCount = (n) => setGuestCount(Math.max(1, Math.min(10, n)));

  const onSubmit = () => {
    setErrorMsg('');

    // Maybe / Can't-go: just record the response, no full RSVP.
    if (response !== 'going') {
      setSubmitted({ response });
      return;
    }

    if (restricted) {
      if (!dob) return setErrorMsg('Please enter your date of birth — this is an age-restricted event.');
      if (!meetsAge(dob, minAge)) return setErrorMsg(`You must be at least ${minAge} to attend this event.`);
    }

    const res = createGuestRsvp(event.id, {
      name, email, phone, guestCount, dob,
      additionalGuests: [],
      answers,
    });
    setSubmitted({ ...res, response: 'going' });
  };

  // ─── SUCCESS / CONFIRMATION VIEW ───────────────────────────────────────────
  if (submitted) {
    const declined = submitted.response === 'no';
    const maybe = submitted.response === 'maybe';
    const pending = submitted.pending;
    const waitlisted = submitted.waitlisted;

    const tone = declined ? colors.textMuted : maybe ? colors.amber : pending ? colors.amber : waitlisted ? colors.blue : colors.accent;
    const icon = declined ? 'close-circle' : maybe ? 'help-circle' : pending ? 'time' : waitlisted ? 'people' : 'checkmark-circle';
    const title = declined
      ? "Thanks for letting us know"
      : maybe
      ? "We'll keep you posted"
      : pending
      ? 'Request submitted'
      : waitlisted
      ? "You're on the waitlist"
      : "You're confirmed!";
    const sub = declined
      ? `We've told the host you can't make ${event.title}.`
      : maybe
      ? `We've noted you might attend ${event.title}. RSVP anytime to lock your spot.`
      : pending
      ? 'The host will review your request — you\'ll get an email once approved.'
      : waitlisted
      ? "We'll notify you the moment a spot opens up."
      : `Your pass for ${event.title} is ready in My Tickets.`;

    return (
      <Screen>
        <ScreenHeader title="RSVP" subtitle={event.title} onBack={() => navigation.goBack()} />
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <View style={[styles.successRing, { backgroundColor: tone + '18' }]}>
            <Ionicons name={icon} size={56} color={tone} />
          </View>
          <Text style={[font.h1, { marginTop: spacing.lg, textAlign: 'center' }]}>{title}</Text>
          <Text style={[font.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg, lineHeight: 21 }]}>{sub}</Text>
        </View>

        {!declined && !maybe ? (
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={{ marginBottom: spacing.md }}>
              <Image source={{ uri: event.cover }} style={styles.summaryCover} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[font.h3]} numberOfLines={2}>{event.title}</Text>
                <Row style={{ marginTop: 4 }}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                  <Text style={[font.small, { marginLeft: 4 }]}>{event.date} • {event.time}</Text>
                </Row>
                <Row style={{ marginTop: 2 }}>
                  <Ionicons name="people-outline" size={13} color={colors.textMuted} />
                  <Text style={[font.small, { marginLeft: 4 }]}>{guestCount} attendee{guestCount > 1 ? 's' : ''}</Text>
                </Row>
              </View>
            </Row>
            <Divider />
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={font.small}>Status</Text>
              <Badge tone={pending ? 'amber' : waitlisted ? 'blue' : 'green'} dot label={pending ? 'Pending approval' : waitlisted ? 'Waitlisted' : 'Confirmed'} />
            </Row>
          </Card>
        ) : null}

        {!declined && !maybe && !pending && !waitlisted && (event.eventMode === 'Virtual' || event.eventMode === 'Hybrid') ? (
          <Card style={{ marginBottom: spacing.lg, borderColor: colors.accent, backgroundColor: colors.accent + '08' }}>
            <Text style={[font.h3, { marginBottom: spacing.xs }]}>Virtual Access Unlocked</Text>
            <Text style={[font.small, { marginBottom: spacing.md, color: colors.textMuted }]}>
              You are confirmed! Tap below to join the virtual meeting.
            </Text>
            <Button
              label={`Join on ${event.meetingPlatform || 'Zoom'}`}
              variant="primary"
              icon="videocam-outline"
              style={{ marginBottom: spacing.md }}
              onPress={() => {
                if (event.meetingLink) {
                  Linking.openURL(event.meetingLink).catch(() =>
                    Alert.alert('Error', 'Could not open meeting link.')
                  );
                }
              }}
            />
            {event.meetingId ? (
              <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={font.small}>Meeting ID</Text>
                <Text style={[font.small, { fontWeight: '700' }]}>{event.meetingId}</Text>
              </Row>
            ) : null}
            {event.meetingPasscode ? (
              <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={font.small}>Passcode</Text>
                <Text style={[font.small, { fontWeight: '700', color: colors.primary }]}>{event.meetingPasscode}</Text>
              </Row>
            ) : null}
            {event.meetingInstructions ? (
              <View style={{ marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.primary + '0a' }}>
                <Text style={[font.tiny, { fontWeight: '700', color: colors.textMuted }]}>INSTRUCTIONS</Text>
                <Text style={font.tiny}>{event.meetingInstructions}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {!declined && !maybe && !pending && !waitlisted ? (
          <Button label="View My Pass" variant="primary" icon="qr-code-outline" onPress={() => navigation.navigate('GuestTicketPass', { eventId: event.id })} style={{ marginBottom: spacing.md }} />
        ) : null}
        <Button label="Go to My Tickets" variant={declined || maybe ? 'primary' : 'outline'} icon="ticket-outline" onPress={() => navigation.navigate('GuestTabs', { screen: 'Tickets' })} />
        <Button label="Back to event" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
      </Screen>
    );
  }

  // ─── RSVP FORM ─────────────────────────────────────────────────────────────
  const goingFlow = response === 'going';

  return (
    <Screen>
      <ScreenHeader title="RSVP" subtitle={event.title} onBack={() => navigation.goBack()} />

      <Card style={{ marginBottom: spacing.md }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Badge tone="primary" label={event.eventType === 'Other' ? (event.customEventType || 'Special Event') : event.eventType} />
          <Badge tone="blue" label={event.eventMode || 'Onsite'} />
        </Row>
        <Text style={[font.h3, { marginTop: spacing.xs }]}>{event.title}</Text>
        
        {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && event.venueName ? (
          <Row style={{ marginTop: spacing.sm }}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[font.small, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
              {event.venueName} · {event.venueCity}, {event.venueState}
            </Text>
          </Row>
        ) : null}
      </Card>

      {/* Response selector — Going / Maybe / Can't go */}
      <SectionTitle>Will you attend?</SectionTitle>
      <Row style={{ gap: 8, marginBottom: spacing.lg }}>
        {RESPONSES.map((r) => {
          const on = response === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              activeOpacity={0.85}
              onPress={() => setResponse(r.key)}
              style={[styles.respBtn, on && { borderColor: r.color, backgroundColor: r.color + '14' }]}
            >
              <Ionicons name={r.icon} size={22} color={on ? r.color : colors.textMuted} />
              <Text numberOfLines={1} style={{ marginTop: spacing.xs, fontWeight: '700', fontSize: 12.5, color: on ? r.color : colors.textMuted }}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Row>

      {restricted && goingFlow ? (
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.redTint, borderColor: colors.red }}>
          <Row>
            <Ionicons name="lock-closed" size={18} color={colors.red} />
            <Text style={[font.small, { marginLeft: spacing.sm, flex: 1, color: colors.text, fontWeight: '700' }]}>
              This is a {minAge}+ event. Your date of birth is required; accompanying guests' ages are verified at the door.
            </Text>
          </Row>
        </Card>
      ) : null}

      {event.approvalRequired && goingFlow ? (
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.amberTint, borderColor: colors.amber }}>
          <Row>
            <Ionicons name="time-outline" size={18} color={colors.amber} />
            <Text style={[font.small, { marginLeft: spacing.sm, flex: 1, color: colors.text }]}>
              This event requires organizer approval — your request will be reviewed.
            </Text>
          </Row>
        </Card>
      ) : null}

      {event.dressCode && event.dressCode !== 'No Dress Code' && goingFlow ? (
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.primary + '0a', borderColor: colors.primary }}>
          <Row style={{ alignItems: 'flex-start' }}>
            <Ionicons name="shirt-outline" size={18} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[font.small, { color: colors.text, fontWeight: '700' }]}>
                Dress Code: {event.dressCode === 'Other' ? (event.customDressCode || 'Custom attire') : event.dressCode}
              </Text>
              {event.dressCodeAvoid ? (
                <Text style={[font.tiny, { color: colors.red, marginTop: 4, fontWeight: '600' }]}>
                  🚫 Please avoid: {event.dressCodeAvoid}
                </Text>
              ) : null}
            </View>
          </Row>
        </Card>
      ) : null}

      {/* Your details — always shown */}
      <SectionTitle>Your details</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <LInput label="Full name" value={name} onChangeText={setName} placeholder="Your name" required />
        <LInput label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" required />
        <LInput label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        {restricted && goingFlow ? (
          <>
            <LInput label={`Date of birth (${minAge}+ event)`} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" required />
            {dob ? (
              <Badge
                tone={meetsAge(dob, minAge) ? 'green' : 'red'}
                label={meetsAge(dob, minAge) ? `✓ Age ${calcAge(dob)} — eligible` : `✕ Under ${minAge}`}
              />
            ) : null}
          </>
        ) : null}
      </Card>

      {goingFlow ? (
        <>
          {/* Attendance count + additional guests */}
          <SectionTitle>How many attending?</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Number of guests (including you)</Text>
            <Row>
              <TouchableOpacity onPress={() => setCount(guestCount - 1)} style={styles.stepBtn} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ width: 44, textAlign: 'center', fontWeight: '800', fontSize: 16, color: colors.text }}>{guestCount}</Text>
              <TouchableOpacity onPress={() => setCount(guestCount + 1)} style={styles.stepBtn} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </Row>
            {guestCount > 1 ? (
              <Text style={[font.tiny, { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 }]}>
                Bringing {guestCount - 1} additional guest{guestCount - 1 > 1 ? 's' : ''} — just the count, no names needed.
              </Text>
            ) : null}
          </Card>

          {/* Host questions */}
          {event.questions && event.questions.length > 0 ? (
            <>
              <SectionTitle>Host questions</SectionTitle>
              <Card style={{ marginBottom: spacing.lg }}>
                {event.questions.map((q, idx) => (
                  <LInput key={idx} label={q} value={answers[q] || ''} onChangeText={(v) => setAnswers((a) => ({ ...a, [q]: v }))} placeholder="Your answer" />
                ))}
              </Card>
            </>
          ) : null}

          {/* Payment */}
          {event.enablePayments ? (
            <>
              <SectionTitle>Payment</SectionTitle>
              <Card style={{ marginBottom: spacing.lg }}>
                <Row style={[styles.between, { marginBottom: spacing.md }]}>
                  <Text style={[font.body, { fontWeight: '700' }]}>Ticket price</Text>
                  <Text style={[font.h3, { color: colors.primary }]}>${event.ticketPrice}</Text>
                </Row>
                <LInput label="Card number" placeholder="1234 5678 9012 3456" keyboardType="numeric" />
                <Row style={{ gap: 12 }}>
                  <View style={{ flex: 1 }}><LInput label="Expiry" placeholder="MM/YY" keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><LInput label="CVC" placeholder="123" keyboardType="numeric" /></View>
                </Row>
              </Card>
            </>
          ) : null}
        </>
      ) : (
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[font.small, { color: colors.text, lineHeight: 18 }]}>
            {response === 'maybe'
              ? "We'll let the host know you might attend. You can come back and confirm anytime before the event."
              : "We'll let the host know you can't make it this time. No pass will be issued."}
          </Text>
        </Card>
      )}

      {errorMsg ? (
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.redTint, borderColor: colors.red }}>
          <Row>
            <Ionicons name="alert-circle" size={18} color={colors.red} />
            <Text style={[font.small, { marginLeft: 8, flex: 1, color: colors.red, fontWeight: '700' }]}>{errorMsg}</Text>
          </Row>
        </Card>
      ) : null}

      <Button
        label={response === 'no' ? "Send response" : response === 'maybe' ? 'Save as Maybe' : event.approvalRequired ? 'Submit request' : 'Confirm RSVP'}
        variant="primary"
        icon={response === 'going' ? 'checkmark-circle' : undefined}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  respBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  successRing: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  summaryCover: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceHover },
});
