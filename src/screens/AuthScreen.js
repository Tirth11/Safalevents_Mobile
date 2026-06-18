import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';
import { Button } from '../components/ui';
import { HOST, GUEST, loginAsStaff, loginByContact, registerUser, findUser } from '../data/mock';
import { useAuth } from '../auth/AuthContext';

const ORG_TYPES = ['NGO', 'Temple', 'Company', 'Community', 'Other'];

// One-tap demo accounts (mirror the web Login page). Staff signs in via an Invite ID;
// the "pending" persona demonstrates the blocked-sign-in path for an org awaiting review.
const DEMO_PERSONAS = [
  { key: 'host', title: 'Alex Rivera · Host', desc: 'Manage events, approvals & analytics.', contact: 'alex@safalevent.com', icon: 'grid', tint: 'rgba(242,84,27,0.10)' },
  { key: 'guest', title: 'Alice Vance · Guest', desc: 'Tickets, QR passes, explore events.', contact: 'alice@example.com', icon: 'ticket', tint: 'rgba(0,166,62,0.12)' },
  { key: 'staff', title: 'Sam Carter · Staff', desc: 'Coordinator — approvals & check-in.', invite: 'INV-SAM-2026', contact: 'sam@safalevent.com', icon: 'shield-checkmark', tint: 'rgba(124,58,237,0.14)' },
  { key: 'pending', title: 'Safal Foundation · Pending', desc: 'Org host awaiting admin review.', contact: 'org@safalevent.com', icon: 'time', tint: 'rgba(234,179,8,0.16)' },
];

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
  const [mode, setMode] = useState(route.params?.mode === 'login' ? 'login' : 'register');
  const [role, setRole] = useState(route.params?.role === 'host' || auth.pendingIntent?.role === 'host' ? 'host' : 'guest');
  const [hostType, setHostType] = useState('individual'); // individual | organization
  const [staffMode, setStaffMode] = useState(!!route.params?.staff);
  const [step, setStep] = useState('form'); // form | otp | success
  const [otp, setOtp] = useState('');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loginUser, setLoginUser] = useState(null); // the looked-up account during login
  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', phone: '', city: '', state: '',
    orgName: '', orgType: 'NGO', website: '', contactName: '', name: '',
  });
  const [staffForm, setStaffForm] = useState({ inviteId: '', contact: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const isOrg = role === 'host' && hostType === 'organization';

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const routeAfterAuth = (user) => {
    const intent = auth.pendingIntent;
    auth.setPendingIntent(null);
    if (user.role === 'staff') return navigation.replace('StaffTabs');
    if (intent && intent.nav) return navigation.replace(intent.nav, intent.params || {});
    navigation.replace(user.role === 'host' ? 'HostTabs' : 'GuestTabs');
  };

  const genCode = () => setCode(String(Math.floor(100000 + Math.random() * 900000)));

  const sendCode = () => {
    setError('');
    if (!f.email.trim()) { setError('Enter your email or phone.'); return; }

    if (mode === 'login') {
      // Unified login: look up the account, block pending/rejected hosts, route by type.
      const res = loginByContact(f.email);
      if (!res.success) { setError(res.error); return; }
      setLoginUser(res.user);
    } else {
      if (isOrg && !agree) { setError('Please confirm you are authorized to represent this organization.'); return; }
      if (findUser(f.email)) { setError('An account with this email already exists. Try logging in instead.'); return; }
    }
    genCode();
    setResendIn(30);
    setOtp('');
    setStep('otp');
  };

  const resendCode = () => {
    if (resendIn > 0) return;
    genCode();
    setResendIn(30);
    setOtp('');
  };

  const verify = () => {
    setError('');
    if (otp.trim() && otp.trim().length !== 6) { setError('Enter the 6-digit code, or leave it blank in demo mode.'); return; }

    if (mode === 'login') {
      const u = loginUser;
      if (!u) { setError('Something went wrong — please re-enter your email/phone.'); setStep('form'); return; }
      auth.signIn({ role: u.role, name: u.name, email: u.email, hostType: u.hostType });
      routeAfterAuth(u);
      return;
    }

    // Register: provision the account.
    const newUser = role === 'host'
      ? { role: 'host', hostType, name: isOrg ? (f.orgName || 'My Organization') : (`${f.firstName} ${f.lastName}`.trim() || HOST.name), email: f.email.trim() || HOST.email, phone: f.phone.trim() }
      : { role: 'guest', name: f.name.trim() || GUEST.name, email: f.email.trim() || GUEST.email, phone: f.phone.trim() };
    const reg = registerUser(newUser);
    const user = reg.user || newUser;

    // Organization hosts are PENDING — show the review screen, don't enter the dashboard.
    if (user.role === 'host' && user.hostType === 'organization') {
      setStep('success');
      return;
    }
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

  // One-tap demo sign-in (login tab convenience). Routes by the account's real type.
  const quickLogin = (p) => {
    setError('');
    if (p.key === 'staff') {
      const res = loginAsStaff(p.invite, p.contact);
      if (!res.success) { setError(res.error); return; }
      auth.signIn({ role: 'staff', name: res.staff.name, email: res.staff.email });
      routeAfterAuth({ role: 'staff' });
      return;
    }
    const res = loginByContact(p.contact);
    if (!res.success) { setError(res.error); return; } // pending org → shows the block
    auth.signIn({ role: res.user.role, name: res.user.name, email: res.user.email, hostType: res.user.hostType });
    routeAfterAuth(res.user);
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
        ) : step === 'success' ? (
          /* Organization signup — pending admin review (US-AUTH-006). */
          <View style={{ alignItems: 'center', paddingTop: spacing.lg }}>
            <View style={styles.successIcon}><Ionicons name="hourglass-outline" size={34} color={colors.primary} /></View>
            <Text style={[font.h2, { textAlign: 'center' }]}>Application submitted</Text>
            <Text style={[font.small, { textAlign: 'center', marginTop: 6, marginBottom: spacing.lg }]}>
              Your organization is pending admin review. You can browse events now — we’ll email you once you’re approved to publish.
            </Text>
            <Button label="Browse events" icon="compass" onPress={() => navigation.goBack()} style={{ width: '100%' }} />
            <TouchableOpacity onPress={() => { setStep('form'); setMode('login'); setError(''); }} style={styles.backLink}>
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
            <View style={styles.otpFooter}>
              <TouchableOpacity onPress={() => { setStep('form'); setError(''); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resendCode} disabled={resendIn > 0} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={15} color={resendIn > 0 ? colors.textMuted : colors.primary} />
                <Text style={{ color: resendIn > 0 ? colors.textMuted : colors.primary, fontWeight: '700' }}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={[font.h2, { marginBottom: 4 }]}>{mode === 'register' ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>{mode === 'register' ? 'Pick how you want to use SafalEvents.' : 'Log in with your email or phone — we’ll send a code.'}</Text>

            <Segment options={[{ key: 'register', label: 'Sign up' }, { key: 'login', label: 'Log in' }]} value={mode} onChange={(m) => { setMode(m); setError(''); }} />

            {/* Account-type chooser only matters at signup; login routes by the stored account. */}
            {mode === 'register' ? (
              <>
                <Text style={[styles.label, { marginTop: spacing.lg }]}>I want to…</Text>
                <Segment options={[{ key: 'guest', label: 'Attend (Guest)' }, { key: 'host', label: 'Host events' }]} value={role} onChange={setRole} />
              </>
            ) : null}

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
              <>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Field half label="First name" value={f.firstName} onChangeText={(t) => set('firstName', t)} placeholder="Alex" />
                  <Field half label="Last name" value={f.lastName} onChangeText={(t) => set('lastName', t)} placeholder="Rivera" />
                </View>
                <Field label="City" value={f.city} onChangeText={(t) => set('city', t)} placeholder="New York" />
              </>
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

            {/* Common contact */}
            <Field label="Email or phone" value={f.email} autoCapitalize="none" onChangeText={(t) => set('email', t)} placeholder="you@email.com" />
            {mode === 'register' ? (
              <Field label="Phone" value={f.phone} onChangeText={(t) => set('phone', t)} placeholder="+1 (555) 000-0000" />
            ) : null}

            {/* Individual host terms */}
            {mode === 'register' && role === 'host' && hostType === 'individual' ? (
              <TouchableOpacity onPress={() => setAgreeTerms((a) => !a)} style={styles.checkRow} activeOpacity={0.8}>
                <Ionicons name={agreeTerms ? 'checkbox' : 'square-outline'} size={20} color={agreeTerms ? colors.primary : colors.textMuted} />
                <Text style={{ flex: 1, fontSize: 12.5, color: colors.text }}>I agree to the Terms and Privacy Policy.</Text>
              </TouchableOpacity>
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

            {/* Demo quick-logins (login tab only) */}
            {mode === 'login' ? (
              <>
                <View style={styles.divider}><View style={styles.line} /><Text style={font.tiny}>  or try a demo profile  </Text><View style={styles.line} /></View>
                {DEMO_PERSONAS.map((p) => (
                  <TouchableOpacity key={p.key} onPress={() => quickLogin(p)} style={styles.demoBtn} activeOpacity={0.85}>
                    <View style={[styles.demoIcon, { backgroundColor: p.tint }]}><Ionicons name={p.icon} size={18} color={colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }}>{p.title}</Text>
                      <Text style={{ fontSize: 11.5, color: colors.textMuted }}>{p.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </>
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
  otpFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  docBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, padding: 12, marginBottom: 12, backgroundColor: colors.primaryTint },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, marginBottom: 10, backgroundColor: colors.surface },
  demoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  successIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
