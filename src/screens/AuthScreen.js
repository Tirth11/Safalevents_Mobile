import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';
import { Button } from '../components/ui';
import { HOST, GUEST, loginAsStaff } from '../data/mock';
import { useAuth } from '../auth/AuthContext';

const ORG_TYPES = ['NGO', 'Temple', 'Company', 'Community', 'Other'];

function Segment({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <TouchableOpacity key={o.key} onPress={() => onChange(o.key)} style={[styles.segBtn, value === o.key && styles.segBtnActive]}>
          <Text style={{ fontWeight: '700', fontSize: 13, color: value === o.key ? '#fff' : colors.textMuted }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Field({ label, half, ...props }) {
  return (
    <View style={{ marginBottom: 12, flex: half ? 1 : undefined }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...props} />
    </View>
  );
}

export default function AuthScreen({ navigation, route }) {
  const auth = useAuth();
  const [mode, setMode] = useState('register');
  const [role, setRole] = useState(route.params?.role === 'host' || auth.pendingIntent?.role === 'host' ? 'host' : 'guest');
  const [hostType, setHostType] = useState('individual'); // individual | organization
  const [staffMode, setStaffMode] = useState(!!route.params?.staff);
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', phone: '', city: '', state: '',
    orgName: '', orgType: 'NGO', website: '', contactName: '', name: '',
  });
  const [staffForm, setStaffForm] = useState({ inviteId: '', contact: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const isOrg = role === 'host' && hostType === 'organization';

  const routeAfterAuth = (user) => {
    const intent = auth.pendingIntent;
    auth.setPendingIntent(null);
    if (user.role === 'staff') return navigation.replace('StaffTabs');
    if (intent && intent.nav) return navigation.replace(intent.nav, intent.params || {});
    navigation.replace(user.role === 'host' ? 'HostTabs' : 'GuestTabs');
  };

  const sendCode = () => {
    setError('');
    if (!f.email.trim()) { setError('Enter your email or phone.'); return; }
    if (mode === 'register' && isOrg && !agree) { setError('Please confirm you are authorized to represent this organization.'); return; }
    setCode(String(Math.floor(100000 + Math.random() * 900000)));
    setStep('otp');
  };

  const verify = () => {
    setError('');
    if (otp.trim() && otp.trim().length !== 6) { setError('Enter the 6-digit code, or leave it blank in demo mode.'); return; }
    if (mode === 'register' && isOrg) {
      Alert.alert(
        'Application submitted',
        'Your organization was submitted for admin review. (Demo: continuing to your host dashboard.)'
      );
    }
    const user = role === 'host'
      ? { role: 'host', name: isOrg ? (f.orgName || 'My Organization') : (`${f.firstName} ${f.lastName}`.trim() || HOST.name), email: f.email.trim() || HOST.email, hostType }
      : { role: 'guest', name: f.name.trim() || GUEST.name, email: f.email.trim() || GUEST.email };
    auth.signIn(user);
    routeAfterAuth(user);
  };

  const doStaffLogin = () => {
    setError('');
    const res = loginAsStaff(staffForm.inviteId, staffForm.contact);
    if (!res.success) { setError(res.error); return; }
    auth.signIn({ role: 'staff', name: res.staff.name, email: res.staff.email });
    routeAfterAuth({ role: 'staff' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.logo}><Ionicons name="calendar" size={16} color="#fff" /></View>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>SafalEvents</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={15} color={colors.red} />
            <Text style={{ color: colors.red, fontSize: 12.5, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {staffMode ? (
          <View>
            <Text style={font.h2}>Login as Staff</Text>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>Use the Invite ID your host shared with you.</Text>
            <Field label="Invite ID" value={staffForm.inviteId} autoCapitalize="characters" onChangeText={(t) => setStaffForm({ ...staffForm, inviteId: t })} placeholder="INV-XXXXXX" />
            <Field label="Email or phone" value={staffForm.contact} autoCapitalize="none" onChangeText={(t) => setStaffForm({ ...staffForm, contact: t })} placeholder="you@email.com" />
            <Text style={styles.hint}>Demo: INV-GATE-1 / gabe@safalevent.com (QR Scanner) · INV-SAM-2026 / sam@safalevent.com (Coordinator)</Text>
            <Button label="Sign in as Staff" icon="lock-closed" onPress={doStaffLogin} style={{ marginTop: 14 }} />
            <TouchableOpacity onPress={() => { setStaffMode(false); setError(''); }} style={styles.backLink}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : step === 'otp' ? (
          <View>
            <Text style={font.h2}>Verify it's you</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>We sent a 6-digit code to {f.email}.</Text>
            <View style={styles.codeChip}><Ionicons name="sparkles" size={13} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}> Demo code: {code}</Text></View>
            <Field label="Verification code" value={otp} keyboardType="number-pad" maxLength={6} onChangeText={(t) => setOtp(t.replace(/\D/g, ''))} placeholder="123456" />
            <Button label={mode === 'register' ? 'Create account' : 'Log in'} icon="checkmark" onPress={verify} />
            <TouchableOpacity onPress={() => { setStep('form'); setError(''); }} style={styles.backLink}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={[font.h2, { marginBottom: 4 }]}>{mode === 'register' ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>{mode === 'register' ? 'Pick how you want to use SafalEvents.' : 'Log in to your account.'}</Text>

            <Segment options={[{ key: 'register', label: 'Sign up' }, { key: 'login', label: 'Log in' }]} value={mode} onChange={setMode} />
            <Text style={[styles.label, { marginTop: spacing.lg }]}>I want to…</Text>
            <Segment options={[{ key: 'guest', label: 'Attend (Guest)' }, { key: 'host', label: 'Host events' }]} value={role} onChange={setRole} />

            {mode === 'register' && role === 'host' ? (
              <>
                <Text style={[styles.label, { marginTop: spacing.lg }]}>Who's hosting?</Text>
                <Segment options={[{ key: 'individual', label: 'Individual' }, { key: 'organization', label: 'Organization' }]} value={hostType} onChange={setHostType} />
              </>
            ) : null}

            <View style={{ height: spacing.lg }} />

            {/* GUEST register */}
            {mode === 'register' && role === 'guest' ? (
              <Field label="Full name" value={f.name} onChangeText={(t) => set('name', t)} placeholder="Alice Vance" />
            ) : null}

            {/* HOST individual register */}
            {mode === 'register' && role === 'host' && hostType === 'individual' ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Field half label="First name" value={f.firstName} onChangeText={(t) => set('firstName', t)} placeholder="Alex" />
                <Field half label="Last name" value={f.lastName} onChangeText={(t) => set('lastName', t)} placeholder="Rivera" />
              </View>
            ) : null}

            {/* HOST organization register */}
            {mode === 'register' && isOrg ? (
              <>
                <Field label="Organization name" value={f.orgName} onChangeText={(t) => set('orgName', t)} placeholder="Safal Foundation" />
                <Text style={styles.label}>Organization type</Text>
                <View style={styles.chips}>
                  {ORG_TYPES.map((t) => (
                    <TouchableOpacity key={t} onPress={() => set('orgType', t)} style={[styles.chip, f.orgType === t && styles.chipActive]}>
                      <Text style={{ color: f.orgType === t ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5 }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 12 }} />
                <Field label="Website" value={f.website} autoCapitalize="none" onChangeText={(t) => set('website', t)} placeholder="https://…" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Field half label="City" value={f.city} onChangeText={(t) => set('city', t)} placeholder="New York" />
                  <Field half label="State" value={f.state} onChangeText={(t) => set('state', t)} placeholder="NY" />
                </View>
                <Field label="Contact person" value={f.contactName} onChangeText={(t) => set('contactName', t)} placeholder="Maya Sharma" />
                <TouchableOpacity onPress={() => Alert.alert('Verification documents', 'Document upload (demo). An admin reviews these before activation.')} style={styles.docBtn}>
                  <Ionicons name="cloud-upload-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Upload verification documents</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {/* Common contact + phone */}
            <Field label="Email or phone" value={f.email} autoCapitalize="none" onChangeText={(t) => set('email', t)} placeholder="you@email.com" />
            {mode === 'register' && role === 'host' ? (
              <Field label="Phone" value={f.phone} onChangeText={(t) => set('phone', t)} placeholder="+1 (555) 000-0000" />
            ) : null}

            {/* Org consent */}
            {mode === 'register' && isOrg ? (
              <TouchableOpacity onPress={() => setAgree((a) => !a)} style={styles.checkRow} activeOpacity={0.8}>
                <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={20} color={agree ? colors.primary : colors.textMuted} />
                <Text style={{ flex: 1, fontSize: 12.5, color: colors.text }}>I'm authorized to represent this organization and the details are accurate.</Text>
              </TouchableOpacity>
            ) : null}

            <Button label="Continue with code" icon="mail" onPress={sendCode} style={{ marginTop: 4 }} />

            {isOrg && mode === 'register' ? (
              <Text style={[styles.hint, { marginTop: 8 }]}>Organization accounts are reviewed by an admin before they can publish events.</Text>
            ) : null}

            <View style={styles.divider}><View style={styles.line} /><Text style={font.tiny}>  or  </Text><View style={styles.line} /></View>
            <Button label="Login as Staff" variant="outline" icon="shield-checkmark-outline" onPress={() => { setStaffMode(true); setError(''); }} />
            <Text style={[styles.hint, { textAlign: 'center', marginTop: 12 }]}>Staff join via an Invite ID from their host — they don't sign up here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceHover, borderRadius: radius.full, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: radius.full, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.primary },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  hint: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  errorBox: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.md, padding: 10, marginBottom: 12 },
  codeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.primaryTint, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 14 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  docBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, padding: 12, marginBottom: 12, backgroundColor: colors.primaryTint },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
});
