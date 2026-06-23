import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';
import { BrandLockup } from '../components/ui';
import { loginAsStaff, useIndividualHost, useOrgHost } from '../data/mock';

function RoleCard({ icon, title, desc, onPress, tint = 'rgba(242,84,27,0.10)' }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={[styles.iconTile, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{title}</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function RoleSelectScreen({ navigation }) {
  const [staffMode, setStaffMode] = useState(false);
  const [inviteId, setInviteId] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const doStaffLogin = () => {
    const res = loginAsStaff(inviteId, contact);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setError('');
    navigation.replace('StaffTabs');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ marginBottom: 16 }}>
          <BrandLockup size={48} onLight={false} tile />
        </View>
        <Text style={styles.tagline}>
          {staffMode
            ? 'Team member sign-in — enter the Invite ID your host shared with you.'
            : 'Plan, RSVP, and run beautiful events. Choose how you’d like to continue.'}
        </Text>

        {!staffMode ? (
          <>
            <RoleCard
              icon="grid"
              title="Host an event"
              desc="Create events, approve RSVPs, manage staff & messaging."
              onPress={() => { useIndividualHost(); navigation.replace('HostTabs'); }}
            />
            <RoleCard
              icon="business"
              title="Host as an organization"
              desc="Upload verification docs & get approved before hosting."
              onPress={() => { useOrgHost(); navigation.replace('HostTabs'); }}
              tint="rgba(234,179,8,0.16)"
            />
            <RoleCard
              icon="ticket"
              title="Attend an event"
              desc="RSVP, view tickets & QR passes, message hosts."
              onPress={() => navigation.replace('GuestTabs')}
              tint="rgba(0,166,62,0.12)"
            />
            <RoleCard
              icon="shield-checkmark"
              title="Login as Staff"
              desc="Joined via an Invite ID? Sign in to your assigned event."
              onPress={() => { setStaffMode(true); setError(''); }}
              tint="rgba(124,58,237,0.14)"
            />
            <Text style={styles.note}>UI prototype · switch roles anytime from Account / Profile</Text>
          </>
        ) : (
          <View style={styles.staffCard}>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 10 }}>Staff sign-in</Text>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color={colors.red} />
                <Text style={{ color: colors.red, fontSize: 12.5, flex: 1 }}>{error}</Text>
              </View>
            ) : null}
            <Text style={styles.label}>Invite ID</Text>
            <TextInput
              value={inviteId}
              onChangeText={setInviteId}
              autoCapitalize="characters"
              placeholder="INV-XXXXXX"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Text style={styles.label}>Email or phone</Text>
            <TextInput
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              placeholder="you@email.com"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <Text style={styles.hint}>Demo: INV-GATE-1 / gabe@safalevent.com (QR Scanner) · INV-SAM-2026 / sam@safalevent.com (Coordinator)</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={doStaffLogin} activeOpacity={0.85}>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sign in as Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStaffMode(false); setError(''); }} style={{ alignSelf: 'center', marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brand: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { color: 'rgba(255,255,255,0.88)', marginTop: 8, marginBottom: 28, fontSize: 15, lineHeight: 21 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 14 },
  iconTile: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  note: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', marginTop: 18 },
  staffCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 16 },
  primaryBtn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  errorBox: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.md, padding: 10, marginBottom: 8 },
});
