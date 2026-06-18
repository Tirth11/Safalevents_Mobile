import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';
import { Button } from '../components/ui';
import { HOST, GUEST, loginAsStaff } from '../data/mock';
import { useAuth } from '../auth/AuthContext';

function Segment({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <TouchableOpacity key={o.key} onPress={() => onChange(o.key)} style={[styles.segBtn, value === o.key && styles.segBtnActive]}>
          <Text style={{ fontWeight: '700', fontSize: 13.5, color: value === o.key ? '#fff' : colors.textMuted }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...props} />
    </View>
  );
}

export default function AuthScreen({ navigation, route }) {
  const auth = useAuth();
  const [mode, setMode] = useState('register'); // 'login' | 'register'
  const [role, setRole] = useState(
    route.params?.role === 'host' || auth.pendingIntent?.role === 'host' ? 'host' : 'guest'
  );
  const [staffMode, setStaffMode] = useState(!!route.params?.staff);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [code, setCode] = useState('');
  const [staffForm, setStaffForm] = useState({ inviteId: '', contact: '' });
  const [error, setError] = useState('');

  const routeAfterAuth = (user) => {
    const intent = auth.pendingIntent;
    auth.setPendingIntent(null);
    if (user.role === 'staff') return navigation.replace('StaffTabs');
    if (intent && intent.nav) return navigation.replace(intent.nav, intent.params || {});
    navigation.replace(user.role === 'host' ? 'HostTabs' : 'GuestTabs');
  };

  const sendCode = () => {
    setError('');
    if (!contact.trim()) { setError('Enter your email or phone.'); return; }
    setCode(String(Math.floor(100000 + Math.random() * 900000)));
    setStep('otp');
  };

  const verify = () => {
    setError('');
    const v = otp.trim();
    if (v && v.length !== 6) { setError('Enter the 6-digit code, or leave it blank in demo mode.'); return; }
    // Demo: choosing Host signs you in as the demo host, Guest as the demo guest.
    const user = role === 'host'
      ? { role: 'host', name: HOST.name, email: contact.trim() || HOST.email }
      : { role: 'guest', name: GUEST.name, email: contact.trim() || GUEST.email };
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
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
          /* ── Login as Staff ── */
          <View>
            <Text style={font.h2}>Login as Staff</Text>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>Use the Invite ID your host shared with you.</Text>
            <LabeledInput label="Invite ID" value={staffForm.inviteId} autoCapitalize="characters" onChangeText={(t) => setStaffForm({ ...staffForm, inviteId: t })} placeholder="INV-XXXXXX" />
            <LabeledInput label="Email or phone" value={staffForm.contact} autoCapitalize="none" onChangeText={(t) => setStaffForm({ ...staffForm, contact: t })} placeholder="you@email.com" />
            <Text style={styles.hint}>Demo: INV-GATE-1 / gabe@safalevent.com (QR Scanner) · INV-SAM-2026 / sam@safalevent.com (Coordinator)</Text>
            <Button label="Sign in as Staff" icon="lock-closed" onPress={doStaffLogin} style={{ marginTop: 14 }} />
            <TouchableOpacity onPress={() => { setStaffMode(false); setError(''); }} style={styles.backLink}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : step === 'otp' ? (
          /* ── OTP step ── */
          <View>
            <Text style={font.h2}>Verify it's you</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>We sent a 6-digit code to {contact}.</Text>
            <View style={styles.codeChip}><Ionicons name="sparkles" size={13} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '700' }}> Demo code: {code}</Text></View>
            <LabeledInput label="Verification code" value={otp} keyboardType="number-pad" maxLength={6} onChangeText={(t) => setOtp(t.replace(/\D/g, ''))} placeholder="123456" />
            <Button label={mode === 'register' ? 'Create account' : 'Log in'} icon="checkmark" onPress={verify} />
            <TouchableOpacity onPress={() => { setStep('form'); setError(''); }} style={styles.backLink}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Login / Register form ── */
          <View>
            <Segment options={[{ key: 'register', label: 'Sign up' }, { key: 'login', label: 'Log in' }]} value={mode} onChange={setMode} />
            <Text style={[styles.label, { marginTop: spacing.lg }]}>I want to…</Text>
            <Segment
              options={[{ key: 'guest', label: 'Attend (Guest)' }, { key: 'host', label: 'Host events' }]}
              value={role}
              onChange={setRole}
            />
            <View style={{ height: spacing.lg }} />
            {mode === 'register' && <LabeledInput label="Full name" value={name} onChangeText={setName} placeholder={role === 'host' ? 'Alex Rivera' : 'Alice Vance'} />}
            <LabeledInput label="Email or phone" value={contact} autoCapitalize="none" onChangeText={setContact} placeholder="you@email.com" />
            <Button label="Continue with code" icon="mail" onPress={sendCode} />

            <View style={styles.divider}>
              <View style={styles.line} /><Text style={font.tiny}>  or  </Text><View style={styles.line} />
            </View>
            <Button label="Login as Staff" variant="outline" icon="shield-checkmark-outline" onPress={() => { setStaffMode(true); setError(''); }} />
            <Text style={[styles.hint, { textAlign: 'center', marginTop: 12 }]}>Staff join via an Invite ID from their host — they don't sign up here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
