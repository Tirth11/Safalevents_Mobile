import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  SectionTitle,
  Avatar,
  StatCard,
  Row,
  Divider,
  ToggleRow,
  Toggle,
} from '../../components/ui';
import { GUEST, useStore, guestSettings, updateGuestSettings } from '../../data/mock';

const MENU = [
  { key: 'edit', label: 'Edit profile', icon: 'person-circle-outline' },
  { key: 'notify', label: 'Notification preferences', icon: 'mail-outline' },
  { key: 'help', label: 'Help & Support', icon: 'chatbubbles-outline' },
];

import { useAuth } from '../../auth/AuthContext';

export default function GuestProfileScreen({ navigation, route }) {
  useStore();
  const auth = useAuth();
  return (
    <Screen>
      <Text style={[font.h1, { marginBottom: spacing.md }]}>Profile</Text>

      <Card style={{ marginBottom: spacing.lg }}>
        <Row>
          <Avatar seed={GUEST.avatarSeed} size={64} />
          <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
            <Text style={font.h2}>{GUEST.name}</Text>
            <Text style={font.small}>{GUEST.email}</Text>
            <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
              <Badge tone="green" label="Guest" />
            </View>
          </View>
        </Row>
      </Card>

      <SectionTitle>Stats</SectionTitle>
      <Row style={{ marginBottom: spacing.lg, alignItems: 'stretch' }}>
        <StatCard label="Attended" value="12" icon="checkmark-circle" color={colors.accent} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Upcoming" value="3" icon="calendar-outline" color={colors.primary} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Messages" value="2" icon="chatbubbles-outline" color={colors.blue} />
      </Row>

      <SectionTitle>Settings</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        <Toggle
          label="Email reminders"
          desc="Get event reminders by email"
          icon="mail-outline"
          value={guestSettings.emailReminders}
          onValueChange={(v) => updateGuestSettings({ emailReminders: v })}
        />
        <Toggle
          label="SMS reminders"
          desc="Text alerts before your events"
          icon="call-outline"
          value={guestSettings.smsReminders}
          onValueChange={(v) => updateGuestSettings({ smsReminders: v })}
        />
        <Toggle
          label="New message alerts"
          desc="Notify me when a host replies"
          icon="chatbubbles-outline"
          value={guestSettings.newMessageAlerts}
          onValueChange={(v) => updateGuestSettings({ newMessageAlerts: v })}
        />
      </Card>

      <SectionTitle>Account</SectionTitle>
      <Card padded={false} style={{ marginBottom: spacing.lg }}>
        {MENU.map((item, idx) => (
          <View key={item.key}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (item.key === 'help') Alert.alert('Help & Support', 'Email support@safalevent.com or visit our Help Center.');
                else if (item.key === 'notify') Alert.alert('Notification preferences', 'Adjust your reminders in the Settings section above.');
                else if (item.key === 'edit') Alert.alert('Edit profile', 'Profile editing is available in the full app.');
              }}
              style={styles.menuRow}
            >
              <Ionicons name={item.icon} size={18} color={colors.primary} />
              <Text style={[font.body, { flex: 1, marginLeft: spacing.md, fontWeight: '600' }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {idx < MENU.length - 1 ? <Divider style={{ marginVertical: 0 }} /> : null}
          </View>
        ))}
      </Card>

      <Button
        label="Switch account"
        variant="outline"
        icon="swap-horizontal-outline"
        style={{ marginBottom: spacing.md }}
        onPress={() => { auth.signOut(); navigation.navigate('Auth', { mode: 'login' }); }}
      />
      <Button
        label="Log out"
        variant="danger"
        icon="log-out-outline"
        onPress={() => { auth.signOut(); navigation.navigate('Browse'); }}
      />
    </Screen>
  );
}

export { GuestProfileScreen };

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
