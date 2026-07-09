import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Button, ScreenHeader } from '../../components/ui';
import { useStore, getEvent, getFeedbackForm, submitFeedbackResponse, GUEST } from '../../data/mock';

export default function GuestFeedbackScreen({ navigation, route }) {
  useStore();
  const eventId = route.params?.eventId;
  const event = getEvent(eventId);
  const form = getFeedbackForm(eventId);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (id, v) => setAnswers((p) => ({ ...p, [id]: v }));
  const toggle = (id, o) => setAnswers((p) => {
    const cur = Array.isArray(p[id]) ? p[id] : [];
    return { ...p, [id]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] };
  });

  const submit = () => {
    for (const q of form.questions) {
      if (!q.required) continue;
      const v = answers[q.id];
      const empty = v === undefined || v === '' || v === 0 || (Array.isArray(v) && v.length === 0);
      if (empty) { setError(`Please answer: ${q.text}`); return; }
    }
    submitFeedbackResponse(eventId, { name: GUEST?.name, email: GUEST?.email, answers });
    setDone(true);
  };

  if (done) {
    return (
      <Screen>
        <ScreenHeader title="Feedback" onBack={() => navigation.goBack()} />
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
          <Text style={[font.h2, { marginTop: spacing.md, textAlign: 'center' }]}>Thanks — your feedback is in!</Text>
          <Text style={[font.small, { textAlign: 'center', marginTop: spacing.sm, color: colors.textMuted }]}>
            Your response for {event?.title} was recorded. It goes straight to the host.
          </Text>
          <Button label="Done" variant="primary" style={{ marginTop: spacing.lg }} onPress={() => navigation.goBack()} />
        </Card>
      </Screen>
    );
  }

  if (form.status === 'Closed') {
    return (
      <Screen>
        <ScreenHeader title="Feedback" onBack={() => navigation.goBack()} />
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.textMuted} />
          <Text style={[font.h3, { marginTop: spacing.md }]}>Feedback is closed</Text>
          <Text style={[font.small, { textAlign: 'center', marginTop: 4, color: colors.textMuted }]}>The host has closed feedback for this event.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Share your feedback" onBack={() => navigation.goBack()} />
      <Text style={[font.h3, { marginBottom: 4 }]}>How was {event?.title}?</Text>
      <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.md }]}>
        {form.questions.length} quick question{form.questions.length === 1 ? '' : 's'} · no account needed
      </Text>

      {error ? (
        <View style={styles.err}><Ionicons name="alert-circle" size={16} color={colors.red} /><Text style={{ color: colors.red, marginLeft: 8, flex: 1, fontSize: 13 }}>{error}</Text></View>
      ) : null}

      {form.questions.map((q, i) => (
        <Card key={q.id} style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: spacing.sm }}>
            {i + 1}. {q.text} {q.required ? <Text style={{ color: colors.red }}>*</Text> : null}
          </Text>

          {q.type === 'rating' && (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => set(q.id, s)} hitSlop={6}>
                  <Ionicons name={s <= (answers[q.id] || 0) ? 'star' : 'star-outline'} size={34} color={s <= (answers[q.id] || 0) ? '#f59e0b' : colors.border} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {q.type === 'single' && (q.options || []).map((o) => (
            <TouchableOpacity key={o} onPress={() => set(q.id, o)} style={[styles.opt, answers[q.id] === o && styles.optOn]}>
              <Ionicons name={answers[q.id] === o ? 'radio-button-on' : 'radio-button-off'} size={18} color={answers[q.id] === o ? colors.primary : colors.textMuted} />
              <Text style={{ marginLeft: 10, color: colors.text }}>{o}</Text>
            </TouchableOpacity>
          ))}

          {q.type === 'multi' && (q.options || []).map((o) => {
            const on = Array.isArray(answers[q.id]) && answers[q.id].includes(o);
            return (
              <TouchableOpacity key={o} onPress={() => toggle(q.id, o)} style={[styles.opt, on && styles.optOn]}>
                <Ionicons name={on ? 'checkbox' : 'square-outline'} size={18} color={on ? colors.primary : colors.textMuted} />
                <Text style={{ marginLeft: 10, color: colors.text }}>{o}</Text>
              </TouchableOpacity>
            );
          })}

          {q.type === 'text' && (
            <TextInput value={answers[q.id] || ''} onChangeText={(t) => set(q.id, t)} multiline placeholder="Type your answer…" placeholderTextColor={colors.textMuted} style={styles.textArea} />
          )}
        </Card>
      ))}

      <Button label="Send my feedback" variant="primary" icon="chatbubble-ellipses-outline" onPress={submit} style={{ marginBottom: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  err: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.redTint, borderWidth: 1, borderColor: colors.red, borderRadius: radius.md, padding: 10, marginBottom: spacing.md },
  opt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 11, marginBottom: 8 },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  textArea: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10, minHeight: 70, color: colors.text, textAlignVertical: 'top' },
});
