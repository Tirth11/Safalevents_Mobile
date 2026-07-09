import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Button, Badge, Row, Divider, ScreenHeader, SectionTitle } from '../../components/ui';
import {
  useStore, getEvent, getRsvps,
  getFeedbackForm, saveFeedbackForm, publishFeedbackForm, closeFeedbackForm,
  sendFeedbackInvites, getFeedbackAnalytics,
} from '../../data/mock';

const TYPES = [
  { key: 'rating', label: '★ Rating' },
  { key: 'single', label: '◉ Single' },
  { key: 'multi', label: '☑ Multi' },
  { key: 'text', label: '✎ Text' },
];
const uid = () => 'q' + Math.random().toString(36).slice(2, 7);

export default function HostFeedbackScreen({ navigation, route }) {
  useStore();
  const eventId = route.params?.eventId;
  const event = getEvent(eventId);
  const form = getFeedbackForm(eventId);
  const [tab, setTab] = useState('build');

  const persist = (next) => saveFeedbackForm(eventId, next);
  const addQ = () => {
    if (form.questions.length >= 5) return Alert.alert('Limit reached', 'A form can have at most 5 questions.');
    persist({ ...form, questions: [...form.questions, { id: uid(), type: 'rating', text: '', required: false, options: [], expected: null }] });
  };
  const updateQ = (id, patch) => persist({ ...form, questions: form.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const removeQ = (id) => persist({ ...form, questions: form.questions.filter((q) => q.id !== id) });

  const publish = () => {
    const r = publishFeedbackForm(eventId);
    if (r.error) return Alert.alert('Cannot publish', r.error);
    Alert.alert('Published', 'Guests can now submit feedback.');
  };
  const close = () => closeFeedbackForm(eventId);

  const a = tab === 'analytics' ? getFeedbackAnalytics(eventId) : null;
  const exportData = async () => {
    const an = getFeedbackAnalytics(eventId);
    const lines = an.perQuestion.map((pq) => {
      if (pq.kind === 'rating') return `${pq.q.text}: avg ${pq.avg}★ (${pq.count})`;
      if (pq.kind === 'choice') return `${pq.q.text}: ${Object.entries(pq.counts).map(([o, c]) => `${o} ${c}`).join(', ')}`;
      return `${pq.q.text}: ${pq.sentiments.positive}+ / ${pq.sentiments.neutral}~ / ${pq.sentiments.negative}-`;
    }).join('\n');
    try { await Share.share({ title: 'Feedback report', message: `Feedback — ${event?.title}\nResponses: ${an.total} · Rate: ${an.responseRate}%\n\n${lines}` }); }
    catch (e) { Alert.alert('Export', 'Report saved to your device.'); }
  };

  const statusTone = form.status === 'Published' ? 'green' : form.status === 'Closed' ? 'gray' : 'amber';
  const chip = (on) => [styles.chip, on && styles.chipOn];

  return (
    <Screen>
      <ScreenHeader title="Event Feedback" onBack={() => navigation.goBack()} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Badge tone={statusTone} label={form.status} />
        <Row style={{ gap: spacing.sm }}>
          {form.status !== 'Published'
            ? <Button label="Publish" small variant="primary" icon="rocket-outline" onPress={publish} />
            : <Button label="Close" small variant="outline" icon="ban-outline" onPress={close} />}
        </Row>
      </Row>

      <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        {['build', 'analytics'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={chip(tab === t)}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: tab === t ? '#fff' : colors.textMuted }}>{t === 'build' ? 'Builder' : 'Analytics'}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      {tab === 'build' ? (
        <>
          {form.questions.map((q, i) => (
            <Card key={q.id} style={{ marginBottom: spacing.md }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>Question {i + 1}</Text>
                <TouchableOpacity onPress={() => removeQ(q.id)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={colors.red} /></TouchableOpacity>
              </Row>
              <TextInput
                value={q.text} onChangeText={(t) => updateQ(q.id, { text: t })}
                placeholder="Question text" placeholderTextColor={colors.textMuted}
                maxLength={200} style={styles.input}
              />
              <Row style={{ gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.sm }}>
                {TYPES.map((t) => (
                  <TouchableOpacity key={t.key} onPress={() => updateQ(q.id, { type: t.key, expected: null })} style={chip(q.type === t.key)}>
                    <Text style={{ fontWeight: '700', fontSize: 12, color: q.type === t.key ? '#fff' : colors.textMuted }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </Row>
              <TouchableOpacity onPress={() => updateQ(q.id, { required: !q.required })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm }}>
                <Ionicons name={q.required ? 'checkbox' : 'square-outline'} size={18} color={q.required ? colors.primary : colors.textMuted} />
                <Text style={[font.small, { color: colors.text }]}>Required</Text>
              </TouchableOpacity>
              {(q.type === 'single' || q.type === 'multi') && (
                <TextInput
                  value={(q.options || []).join(', ')}
                  onChangeText={(t) => updateQ(q.id, { options: t.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Options, comma separated" placeholderTextColor={colors.textMuted}
                  style={[styles.input, { marginTop: spacing.sm }]}
                />
              )}
              {q.type === 'rating' && (
                <Text style={[font.tiny, { marginTop: spacing.sm, color: colors.textMuted }]}>
                  Expected: target avg ≥ {q.expected?.value || '—'}★ (tap to cycle)
                  {'  '}
                  <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => {
                    const cur = q.expected?.value || 0; const nextV = cur >= 5 ? 0 : (cur < 3 ? 3 : cur + 0.5);
                    updateQ(q.id, { expected: nextV ? { kind: 'min_rating', value: nextV } : null });
                  }}>change</Text>
                </Text>
              )}
            </Card>
          ))}
          <Button label={`Add question (${form.questions.length}/5)`} variant="outline" icon="add" onPress={addQ} style={{ marginBottom: spacing.xl }} />
        </>
      ) : (
        <>
          <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            {[['Responses', a.total], ['Invited', a.invitesSent], ['Rate', `${a.responseRate}%`]].map(([l, v]) => (
              <Card key={l} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.md }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>{v}</Text>
                <Text style={font.tiny}>{l}</Text>
              </Card>
            ))}
          </Row>
          <Button label="Export report" variant="outline" icon="download-outline" onPress={exportData} style={{ marginBottom: spacing.md }} />
          {a.total === 0 ? <Text style={[font.small, { color: colors.textMuted }]}>No responses yet. Publish &amp; invite guests — results appear here.</Text> : null}
          {a.perQuestion.map((pq, i) => (
            <Card key={pq.q.id} style={{ marginBottom: spacing.md }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={{ fontWeight: '700', color: colors.text, flex: 1, paddingRight: 8 }}>{i + 1}. {pq.q.text}</Text>
                {pq.met != null ? <Badge tone={pq.met ? 'green' : 'red'} label={pq.met ? 'Target met' : 'Below'} /> : null}
              </Row>
              {pq.kind === 'rating' && <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>{pq.avg || 0}★ <Text style={[font.tiny, { color: colors.textMuted }]}>({pq.count})</Text></Text>}
              {pq.kind === 'choice' && Object.entries(pq.counts).map(([o, c]) => <Text key={o} style={font.small}>{o}: {c}</Text>)}
              {pq.kind === 'text' && (
                <>
                  <Text style={font.small}>{pq.sentiments.positive} positive · {pq.sentiments.neutral} neutral · {pq.sentiments.negative} negative</Text>
                  {pq.samples.map((t, j) => <Text key={j} style={[font.tiny, { color: colors.textMuted, marginTop: 4 }]}>“{t}”</Text>)}
                </>
              )}
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text },
});
