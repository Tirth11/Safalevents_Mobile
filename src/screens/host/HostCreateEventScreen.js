import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import {
  Screen,
  Card,
  Button,
  SectionTitle,
  Row,
  Divider,
  TextField,
  Toggle,
  Chips,
  StepIndicator,
  ScreenHeader,
  VerificationGate,
} from '../../components/ui';
import {
  createEvent,
  getCurrentHost,
  hostFullyVerified,
  COVER_PRESETS,
  ACCENT_THEMES,
  EVENT_TYPES,
  DRESS_CODES,
  DRESS_CODE_COVER_PRESETS,
} from '../../data/mock';

const STEPS = ['Basics', 'Theme', 'Visibility', 'Rules'];

export default function HostCreateEventScreen({ navigation }) {
  const host = getCurrentHost();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', eventType: 'Party', date: '', time: '', location: '', description: '',
    accentTheme: ACCENT_THEMES[0].key, cover: COVER_PRESETS[0],
    privacy: 'Public', rsvpStatus: 'Open', capacity: '', maxGuestsPerRsvp: '1', rsvpDeadline: '',
    approvalRequired: false, messagingEnabled: true, allowSelfEdit: false, allowSelfCancellation: false,
    cancellationCutoff: '', requireCancellationReason: false, allowComments: false,
    ageRestricted: false, minimumAge: '18',
    enablePhotoAlbum: false, photoUploadPermission: 'host_only', requirePhotoApproval: false,
    sendRsvpConfirmationEmail: true, sendRsvpConfirmationSms: false, sendPreEventReminders: true, sendPostEventFeedbackEmail: false,
    enablePayments: false, ticketPrice: '', bankName: '', holderName: '', routing: '', account: '',
    questions: [''],
    dressCode: 'No Dress Code', customDressCode: '', dressCodeDescription: '', dressCodeAvoid: '', dressCodeInstructions: '', dressCodeCover: '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setQuestion = (i, v) => setForm((p) => ({ ...p, questions: p.questions.map((q, idx) => (idx === i ? v : q)) }));
  const addQuestion = () => setForm((p) => ({ ...p, questions: [...p.questions, ''] }));
  const removeQuestion = (i) => setForm((p) => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }));

  const finish = (asDraft) => {
    const data = {
      ...form,
      bank: form.enablePayments
        ? { bankName: form.bankName, holderName: form.holderName, routing: form.routing, account: form.account }
        : null,
    };
    const ev = createEvent(data, asDraft);
    // Land on the new event's manage screen so the host can keep configuring it.
    navigation.replace('HostEventManage', { eventId: ev.id });
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Phase 1d — gate create-event for unverified org hosts (jump to Account tab).
  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('HostTabs', { screen: 'Account' })} />;
  }

  return (
    <Screen>
      <ScreenHeader title="Create event" subtitle={`Step ${step + 1} of ${STEPS.length}`} onBack={() => navigation.goBack()} />
      <StepIndicator steps={STEPS} current={step} />

      {/* ── Step 1: Basics ── */}
      {step === 0 && (
        <Card style={{ marginBottom: spacing.lg }}>
          <TextField label="Event title" value={form.title} onChangeText={(t) => set('title', t)} placeholder="e.g. Summer Rooftop Mixer" />
          <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Event type</Text>
          <Chips options={EVENT_TYPES} value={form.eventType} onChange={(v) => set('eventType', v)} />
          <View style={{ height: spacing.md }} />
          <Row style={{ gap: spacing.md }}>
            <TextField half label="Date" value={form.date} onChangeText={(t) => set('date', t)} placeholder="YYYY-MM-DD" />
            <TextField half label="Time" value={form.time} onChangeText={(t) => set('time', t)} placeholder="19:00" />
          </Row>
          <TextField label="Location" value={form.location} onChangeText={(t) => set('location', t)} placeholder="Venue, City, State" />
          <TextField label="Description" value={form.description} onChangeText={(t) => set('description', t)} placeholder="Tell guests what to expect…" multiline />
        </Card>
      )}

      {/* ── Step 2: Theme & cover ── */}
      {step === 1 && (
        <View>
          <SectionTitle>Accent theme</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <View style={styles.swatchWrap}>
              {ACCENT_THEMES.map((t) => {
                const on = form.accentTheme === t.key;
                return (
                  <TouchableOpacity key={t.key} activeOpacity={0.85} onPress={() => set('accentTheme', t.key)} style={[styles.swatch, on && { borderColor: colors.primary, borderWidth: 2 }]}>
                    <View style={styles.swatchBars}>
                      <View style={{ flex: 1, backgroundColor: t.colors[0] }} />
                      <View style={{ flex: 1, backgroundColor: t.colors[1] }} />
                    </View>
                    <Row style={{ justifyContent: 'space-between', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}>
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text, flex: 1, paddingRight: spacing.xs }} numberOfLines={1}>{t.name}</Text>
                      {on ? <Ionicons name="checkmark-circle" size={15} color={colors.primary} /> : null}
                    </Row>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <SectionTitle>Cover image</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { marginBottom: spacing.md, lineHeight: 18 }]}>Pick a cover from the gallery (file picker unavailable in the prototype).</Text>
            <View style={styles.coverWrap}>
              {COVER_PRESETS.map((url) => {
                const on = form.cover === url;
                return (
                  <TouchableOpacity key={url} activeOpacity={0.85} onPress={() => set('cover', url)} style={[styles.coverThumbWrap, on && { borderColor: colors.primary, borderWidth: 3 }]}>
                    <Image source={{ uri: url }} style={styles.coverThumb} />
                    {on ? (
                      <View style={styles.coverCheck}><Ionicons name="checkmark" size={14} color="#fff" /></View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* ── Step 3: Visibility & capacity ── */}
      {step === 2 && (
        <View>
          <SectionTitle>Visibility</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Privacy</Text>
            <Chips options={['Public', 'Private', 'Unlisted']} value={form.privacy} onChange={(v) => set('privacy', v)} />
            <View style={{ height: spacing.md }} />
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>RSVP status</Text>
            <Chips options={['Open', 'Closed']} value={form.rsvpStatus} onChange={(v) => set('rsvpStatus', v)} />
          </Card>

          <SectionTitle>Capacity</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={{ gap: spacing.md }}>
              <TextField half label="Capacity" value={form.capacity} onChangeText={(t) => set('capacity', t)} placeholder="100" keyboardType="numeric" />
              <TextField half label="Max guests / RSVP" value={form.maxGuestsPerRsvp} onChangeText={(t) => set('maxGuestsPerRsvp', t)} placeholder="1" keyboardType="numeric" />
            </Row>
            <TextField label="RSVP deadline" value={form.rsvpDeadline} onChangeText={(t) => set('rsvpDeadline', t)} placeholder="YYYY-MM-DD" />
          </Card>

          <SectionTitle>Dress Code</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Attire Type</Text>
            <Chips options={DRESS_CODES} value={form.dressCode} onChange={(v) => set('dressCode', v)} />
            
            {form.dressCode === 'Other' && (
              <TextField label="Custom Dress Code" value={form.customDressCode} onChangeText={(t) => set('customDressCode', t)} placeholder="e.g. Wear something blue, Neon Party" />
            )}
            
            {form.dressCode !== 'No Dress Code' && (
              <>
                <TextField label="Dress Code Description" value={form.dressCodeDescription} onChangeText={(t) => set('dressCodeDescription', t)} placeholder="Describe the style or vibe…" multiline />
                <TextField label="Things to Avoid" value={form.dressCodeAvoid} onChangeText={(t) => set('dressCodeAvoid', t)} placeholder="e.g. Please avoid shorts and flip-flops" />
                <TextField label="Additional Instructions" value={form.dressCodeInstructions} onChangeText={(t) => set('dressCodeInstructions', t)} placeholder="e.g. All guests are requested to wear white attire" />

                <Text style={[font.small, { fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm, color: colors.text }]}>Outfit Inspiration Reference Photo</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
                  {DRESS_CODE_COVER_PRESETS.map((url) => {
                    const on = form.dressCodeCover === url;
                    return (
                      <TouchableOpacity key={url} activeOpacity={0.85} onPress={() => set('dressCodeCover', url)} style={{ width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden', borderWidth: on ? 3 : 0, borderColor: colors.primary }}>
                        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </Card>
        </View>
      )}

      {/* ── Step 4: Rules & notifications ── */}
      {step === 3 && (
        <View>
          <SectionTitle>Rules</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Require RSVP approval" desc="Hold RSVPs as Under Approval" value={form.approvalRequired} onValueChange={(v) => set('approvalRequired', v)} icon="shield-checkmark-outline" />
            <Toggle label="Allow guest messaging" desc="Let guests message you" value={form.messagingEnabled} onValueChange={(v) => set('messagingEnabled', v)} icon="chatbubbles-outline" />
            <Toggle label="Allow guest self-edit" desc="Guests can edit their RSVP" value={form.allowSelfEdit} onValueChange={(v) => set('allowSelfEdit', v)} icon="create-outline" />
            <Toggle label="Allow self-cancellation" desc="Guests can cancel their RSVP" value={form.allowSelfCancellation} onValueChange={(v) => set('allowSelfCancellation', v)} icon="close-circle-outline" />
            {form.allowSelfCancellation ? (
              <>
                <TextField label="Cancellation cutoff (hours before)" value={form.cancellationCutoff} onChangeText={(t) => set('cancellationCutoff', t)} placeholder="24" keyboardType="numeric" />
                <Toggle label="Require cancellation reason" value={form.requireCancellationReason} onValueChange={(v) => set('requireCancellationReason', v)} icon="document-text-outline" />
              </>
            ) : null}
            <Toggle label="Allow comments" desc="Public comments on the event" value={form.allowComments} onValueChange={(v) => set('allowComments', v)} icon="chatbox-outline" />
          </Card>

          {/* Attendance rules — age restriction (US-EVENT-013) */}
          <SectionTitle>Attendance rules</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Age restriction" desc="Collect a date of birth at RSVP; block guests under the minimum age" value={form.ageRestricted} onValueChange={(v) => set('ageRestricted', v)} icon="lock-closed-outline" />
            {form.ageRestricted ? (
              <>
                <TextField label="Minimum age" value={form.minimumAge} onChangeText={(t) => set('minimumAge', t)} placeholder="18" keyboardType="numeric" />
                <Chips options={['13', '16', '18', '21']} value={form.minimumAge} onChange={(v) => set('minimumAge', v)} />
              </>
            ) : null}
          </Card>

          {/* Engagement & album (US-UI-004 / EP-001) */}
          <SectionTitle>Photo album</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Guest photo uploads" desc="Create a shared album for the event" value={form.enablePhotoAlbum} onValueChange={(v) => set('enablePhotoAlbum', v)} icon="images-outline" />
            {form.enablePhotoAlbum ? (
              <>
                <Text style={[font.small, { fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.sm, color: colors.text }]}>Who can upload?</Text>
                <Chips
                  options={['Host only', 'RSVPed guests']}
                  value={form.photoUploadPermission === 'guests' ? 'RSVPed guests' : 'Host only'}
                  onChange={(v) => set('photoUploadPermission', v === 'RSVPed guests' ? 'guests' : 'host_only')}
                />
                {form.photoUploadPermission === 'guests' ? (
                  <Toggle label="Require approval for guest uploads" desc="Review photos before they appear" value={form.requirePhotoApproval} onValueChange={(v) => set('requirePhotoApproval', v)} icon="checkmark-done-outline" />
                ) : null}
              </>
            ) : null}
          </Card>

          <SectionTitle>Notifications</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="RSVP confirmation email" value={form.sendRsvpConfirmationEmail} onValueChange={(v) => set('sendRsvpConfirmationEmail', v)} icon="mail-outline" />
            <Toggle label="RSVP confirmation SMS" value={form.sendRsvpConfirmationSms} onValueChange={(v) => set('sendRsvpConfirmationSms', v)} icon="call-outline" />
            <Toggle label="Pre-event reminders" value={form.sendPreEventReminders} onValueChange={(v) => set('sendPreEventReminders', v)} icon="time-outline" />
            <Toggle label="Post-event feedback email" value={form.sendPostEventFeedbackEmail} onValueChange={(v) => set('sendPostEventFeedbackEmail', v)} icon="star-outline" />
          </Card>

          <SectionTitle>Payments</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Enable payments" desc="Charge guests for entry" value={form.enablePayments} onValueChange={(v) => set('enablePayments', v)} icon="card-outline" />
            {form.enablePayments ? (
              <>
                <TextField label="Ticket price (USD)" value={form.ticketPrice} onChangeText={(t) => set('ticketPrice', t)} placeholder="25" keyboardType="numeric" />
                <Divider />
                <TextField label="Bank name" value={form.bankName} onChangeText={(t) => set('bankName', t)} placeholder="Chase Bank" />
                <TextField label="Account holder name" value={form.holderName} onChangeText={(t) => set('holderName', t)} placeholder="Alex Rivera" />
                <Row style={{ gap: spacing.md }}>
                  <TextField half label="Routing number" value={form.routing} onChangeText={(t) => set('routing', t)} placeholder="021000021" keyboardType="numeric" />
                  <TextField half label="Account number" value={form.account} onChangeText={(t) => set('account', t)} placeholder="••••1234" keyboardType="numeric" />
                </Row>
              </>
            ) : null}
          </Card>

          <SectionTitle>Custom questions</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            {form.questions.map((q, i) => (
              <Row key={i} style={{ alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <TextField label={`Question ${i + 1}`} value={q} onChangeText={(t) => setQuestion(i, t)} placeholder="e.g. Any food allergies?" />
                </View>
                <TouchableOpacity onPress={() => removeQuestion(i)} activeOpacity={0.8} style={{ marginTop: 26, marginLeft: spacing.sm, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </Row>
            ))}
            <Button label="Add question" variant="outline" icon="add" small style={{ alignSelf: 'flex-start' }} onPress={addQuestion} />
          </Card>
        </View>
      )}

      {/* ── Wizard nav ── */}
      <Row style={{ gap: spacing.md, marginBottom: spacing.md, alignItems: 'stretch' }}>
        {step > 0 ? (
          <View style={{ flex: 1 }}>
            <Button label="Back" variant="outline" icon="chevron-back" onPress={back} />
          </View>
        ) : null}
        {step < STEPS.length - 1 ? (
          <View style={{ flex: 1 }}>
            <Button label="Next" icon="chevron-forward" onPress={next} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Button label="Publish event" variant="primary" icon="checkmark-circle" onPress={() => finish(false)} />
          </View>
        )}
      </Row>
      {step === STEPS.length - 1 ? (
        <Button label="Save draft" variant="ghost" icon="save-outline" onPress={() => finish(true)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  swatchWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { width: '47%', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface },
  swatchBars: { height: 42, flexDirection: 'row' },
  coverWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  coverThumbWrap: { width: '47%', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  coverThumb: { width: '100%', height: 80, backgroundColor: colors.surfaceHover },
  coverCheck: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
