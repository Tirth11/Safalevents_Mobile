import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  SectionTitle,
  Avatar,
  Row,
  Divider,
  ToggleRow,
} from '../../components/ui';
import {
  payouts,
  useStore,
  getCurrentHost,
  isOrgHost,
  hostFullyVerified,
  saveOrgDocuments,
  approveCurrentOrgHost,
  useIndividualHost,
  useOrgHost,
} from '../../data/mock';
import { useAuth } from '../../auth/AuthContext';

const PAYOUT_TONE = { Paid: 'green', Processing: 'amber', Failed: 'red' };

const MENU = [
  { icon: 'people-outline', label: 'Staff & Roles (managed per event)' },
  { icon: 'card-outline', label: 'Integrations' },
  { icon: 'mail-outline', label: 'Help & Support' },
];

// Realistic filenames cycled through by the simulated "upload" control.
const SAMPLE_DOCS = ['Registration_Certificate.pdf', 'Tax_Exemption_Letter.pdf', 'Govt_ID_Proof.pdf', 'Address_Proof.pdf'];

// Verification status → badge tone + label.
function verifyBadge(host) {
  if (host.status === 'REJECTED') return { tone: 'red', label: 'Rejected' };
  if (!host.orgDocsUploaded) return { tone: 'amber', label: 'Documents required' };
  if (host.status === 'ACTIVE') return { tone: 'green', label: 'Verified' };
  return { tone: 'blue', label: 'Pending Safal Events approval' };
}

function OrgVerificationCard() {
  useStore();
  const host = getCurrentHost();
  const op = host.orgProfile || {};
  const submitted = !!host.orgDocsUploaded;
  // Local draft list of docs being assembled before submit.
  const [docs, setDocs] = useState(op.docs && op.docs.length ? [...op.docs] : []);
  const b = verifyBadge(host);

  const addDoc = () => {
    const next = SAMPLE_DOCS[docs.length % SAMPLE_DOCS.length];
    setDocs((d) => [...d, next]);
  };
  const removeDoc = (i) => setDocs((d) => d.filter((_, idx) => idx !== i));
  const submit = () => {
    if (!docs.length) { Alert.alert('No documents', 'Add at least one document before submitting.'); return; }
    saveOrgDocuments(docs);
    Alert.alert('Submitted for verification', 'A Safal Events admin will review your documents. You can host once approved.');
  };

  return (
    <>
      <SectionTitle>Organization</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Row style={[styles.between, { marginBottom: spacing.md }]}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={font.h3}>{op.orgName || host.name}</Text>
            <Text style={font.small}>{op.orgType || 'Organization'}{op.website ? ` · ${op.website}` : ''}</Text>
            {op.city ? <Text style={font.tiny}>{op.city}{op.state ? `, ${op.state}` : ''}</Text> : null}
          </View>
          <Badge tone={b.tone} dot label={b.label} />
        </Row>

        {host.status === 'REJECTED' ? (
          <View style={[styles.noteBox, { backgroundColor: colors.redTint }]}>
            <Ionicons name="alert-circle" size={16} color={colors.red} />
            <Text style={{ color: colors.red, fontSize: 12.5, flex: 1, lineHeight: 17 }}>
              {host.rejectReason || 'Your documents were not approved. Please re-upload valid documents.'}
            </Text>
          </View>
        ) : null}

        <Divider />

        {/* Documents list (draft until submitted) */}
        <Text style={[font.small, { fontWeight: '700', color: colors.text, marginBottom: spacing.sm }]}>
          Verification documents
        </Text>
        {docs.length === 0 ? (
          <Text style={[font.small, { marginBottom: spacing.sm }]}>No documents added yet.</Text>
        ) : (
          docs.map((name, i) => (
            <Row key={`${name}-${i}`} style={[styles.docRow]}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: colors.text }} numberOfLines={1}>{name}</Text>
              <TouchableOpacity onPress={() => removeDoc(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Row>
          ))
        )}

        <Button label="Upload document" variant="outline" icon="cloud-upload-outline" small style={{ alignSelf: 'flex-start', marginTop: spacing.sm }} onPress={addDoc} />

        {submitted ? (
          <View style={[styles.noteBox, { backgroundColor: colors.blueTint, marginTop: spacing.md }]}>
            <Ionicons name="time-outline" size={16} color={colors.blue} />
            <Text style={{ color: colors.blue, fontSize: 12.5, flex: 1, lineHeight: 17 }}>
              {host.status === 'ACTIVE'
                ? 'Your organization is verified — you can host events.'
                : 'Documents submitted. Pending Safal Events admin approval.'}
            </Text>
          </View>
        ) : null}

        <Button
          label={submitted ? 'Re-submit for verification' : 'Submit for verification'}
          variant="primary"
          icon="checkmark-circle"
          style={{ marginTop: spacing.md }}
          onPress={submit}
        />

        {/* Demo-only shortcut so the unlocked host experience is reachable. */}
        {submitted && host.status !== 'ACTIVE' ? (
          <Button
            label="Simulate admin approval (demo)"
            variant="ghost"
            icon="shield-checkmark-outline"
            small
            style={{ marginTop: spacing.sm }}
            onPress={() => { approveCurrentOrgHost(); Alert.alert('Approved', 'Your organization is now verified.'); }}
          />
        ) : null}
      </Card>
    </>
  );
}

export default function HostAccountScreen({ navigation }) {
  useStore();
  const auth = useAuth();
  const host = getCurrentHost();
  const org = isOrgHost(host);
  const verified = hostFullyVerified(host);

  return (
    <Screen>
      <Card style={{ marginBottom: spacing.lg }}>
        <Row>
          <Avatar seed={host.avatarSeed || host.name} size={56} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={font.h2}>{host.name}</Text>
            <Text style={font.small}>{host.email}</Text>
          </View>
          <Badge tone={org ? 'blue' : 'purple'} label={org ? 'Org Host' : 'Host'} />
        </Row>
      </Card>

      {/* Phase 1c — org verification card */}
      {org ? <OrgVerificationCard /> : null}

      {/* Earnings & settings only make sense for an active hosting account */}
      {verified ? (
        <>
          <SectionTitle>Earnings</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={font.small}>Available balance</Text>
            <Text style={{ fontSize: 34, fontWeight: '800', color: colors.text, marginVertical: 4 }}>$4,250</Text>
            <Button
              label="Withdraw"
              variant="accent"
              icon="card-outline"
              small
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
              onPress={() => Alert.alert('Withdraw', 'Prototype — payouts are not wired.')}
            />
            <Divider />
            <Text style={[font.small, { fontWeight: '700', color: colors.text, marginBottom: spacing.sm }]}>Recent payouts</Text>
            {payouts.map((p) => (
              <Row key={p.id} style={[styles.between, { marginBottom: spacing.sm }]}>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>${p.amount.toFixed(2)}</Text>
                  <Text style={font.tiny}>{p.date} · {p.bank}</Text>
                </View>
                <Badge tone={PAYOUT_TONE[p.status] || 'gray'} label={p.status} />
              </Row>
            ))}
          </Card>

          <SectionTitle>Settings</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <ToggleRow label="Email confirmations" desc="Send RSVP receipts via email" value icon="mail-outline" />
            <ToggleRow label="SMS confirmations" desc="Text guests when approved" value={false} icon="call-outline" />
            <ToggleRow label="Pre-event reminders" desc="Remind guests 24h before" value icon="time-outline" />
            <ToggleRow label="Daily digest" desc="Daily summary of RSVPs" value={false} icon="notifications-outline" />
          </Card>

          <Card style={{ marginBottom: spacing.lg }} padded={false}>
            {MENU.map((m, i) => (
              <View key={m.label}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert(m.label, 'Prototype — not wired.')} style={styles.menuRow}>
                  <View style={[styles.iconTile, { backgroundColor: colors.primaryTint }]}>
                    <Ionicons name={m.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={{ flex: 1, marginLeft: spacing.md, fontWeight: '700', fontSize: 14, color: colors.text }}>{m.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                {i < MENU.length - 1 ? <Divider style={{ marginVertical: 0 }} /> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {/* Demo account switcher — become the individual host (full) or org host (gated). */}
      <SectionTitle>Switch account</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <TouchableOpacity activeOpacity={0.85} style={styles.switchRow} onPress={() => useIndividualHost()}>
          <Avatar seed="Alex Rivera" size={40} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>Alex Rivera · Individual</Text>
            <Text style={font.tiny}>Verified host — full experience</Text>
          </View>
          {host.email === 'alex@safalevent.com' ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
        </TouchableOpacity>
        <Divider style={{ marginVertical: spacing.sm }} />
        <TouchableOpacity activeOpacity={0.85} style={styles.switchRow} onPress={() => useOrgHost()}>
          <Avatar seed="Safal Foundation" size={40} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>Safal Foundation · Organization</Text>
            <Text style={font.tiny}>Unverified — see the verification gate</Text>
          </View>
          {host.email === 'org@safalevent.com' ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
        </TouchableOpacity>
      </Card>

      <Button
        label="Log out"
        variant="danger"
        icon="log-out-outline"
        onPress={() => { auth.signOut(); navigation.navigate('Browse'); }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  iconTile: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  docRow: { backgroundColor: colors.surfaceHover, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: radius.md, padding: 12 },
});
