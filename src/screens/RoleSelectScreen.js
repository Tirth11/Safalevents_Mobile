import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, font } from '../theme/theme';
import { BrandLockup } from '../components/ui';
import { loginAsStaff, useIndividualHost, useOrgHost } from '../data/mock';

function RoleCard({ icon, title, desc, onPress, tint = 'rgba(242,84,27,0.10)' }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={[styles.iconTile, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[font.h3, { fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[font.small, { fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 18 }]} numberOfLines={2}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} style={{ marginLeft: 4 }} />
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
        <Text style={[font.body, styles.tagline]}>
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
            <Text style={[font.small, styles.note]}>UI prototype · switch roles anytime from Account / Profile</Text>
          </>
        ) : (
          <View style={styles.staffCard}>
            <Text style={[font.h2, { fontSize: 18, color: colors.text, marginBottom: 10 }]}>Staff sign-in</Text>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color={colors.red} />
                <Text style={[font.small, { color: colors.red, flex: 1 }]}>{error}</Text>
              </View>
            ) : null}
            <Text style={[font.small, styles.label]}>Invite ID</Text>
            <TextInput
              value={inviteId}
              onChangeText={setInviteId}
              autoCapitalize="characters"
              placeholder="INV-XXXXXX"
              placeholderTextColor={colors.textMuted}
              style={[font.body, styles.input]}
            />
            <Text style={[font.small, styles.label]}>Email or phone</Text>
            <TextInput
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              placeholder="you@email.com"
              placeholderTextColor={colors.textMuted}
              style={[font.body, styles.input]}
            />
            <Text style={[font.tiny, styles.hint]}>Demo: INV-GATE-1 / gabe@safalevent.com (QR Scanner) · INV-SAM-2026 / sam@safalevent.com (Coordinator)</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={doStaffLogin} activeOpacity={0.8}>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={[font.body, { color: '#fff', fontWeight: '700', fontSize: 15 }]}>Sign in as Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStaffMode(false); setError(''); }} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ alignSelf: 'center', marginTop: 12, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chevron-back" size={15} color={colors.textMuted} />
              <Text style={[font.body, { color: colors.textMuted, fontWeight: '600' }]}>Back</Text>
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
  tagline: { color: 'rgba(255,255,255,0.88)', marginTop: 8, marginBottom: 28, fontSize: 15, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 14 },
  iconTile: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  note: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', marginTop: 18, fontFamily: 'Inter_400Regular' },
  staffCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginBottom: 4, marginTop: 8, fontFamily: 'Inter_700Bold' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.surface, fontFamily: 'Inter_400Regular' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 16, fontFamily: 'Inter_400Regular' },
  primaryBtn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  errorBox: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.md, padding: 10, marginBottom: 8 },
});
