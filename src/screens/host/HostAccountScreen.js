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
  Row,
  Divider,
  ToggleRow,
} from '../../components/ui';
import { HOST, payouts } from '../../data/mock';

const PAYOUT_TONE = {
  Paid: 'green',
  Processing: 'amber',
  Failed: 'red',
};

const MENU = [
  { icon: 'people-outline', label: 'Staff & Roles (managed per event)' },
  { icon: 'card-outline', label: 'Integrations' },
  { icon: 'mail-outline', label: 'Help & Support' },
];

import { useAuth } from '../../auth/AuthContext';

export default function HostAccountScreen({ navigation, route }) {
  const auth = useAuth();
  return (
    <Screen>
      <Card style={{ marginBottom: spacing.lg }}>
        <Row>
          <Avatar seed={HOST.avatarSeed} size={56} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={font.h2}>{HOST.name}</Text>
            <Text style={font.small}>{HOST.email}</Text>
          </View>
          <Badge tone="purple" label="Host" />
        </Row>
      </Card>

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
        <Text style={[font.small, { fontWeight: '700', color: colors.text, marginBottom: spacing.sm }]}>
          Recent payouts
        </Text>
        {payouts.map((p) => (
          <Row key={p.id} style={[styles.between, { marginBottom: spacing.sm }]}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>${p.amount.toFixed(2)}</Text>
              <Text style={font.tiny}>
                {p.date} · {p.bank}
              </Text>
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert(m.label, 'Prototype — not wired.')}
              style={styles.menuRow}
            >
              <View style={[styles.iconTile, { backgroundColor: colors.primaryTint }]}>
                <Ionicons name={m.icon} size={18} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, marginLeft: spacing.md, fontWeight: '700', fontSize: 14, color: colors.text }}>
                {m.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            {i < MENU.length - 1 ? <Divider style={{ marginVertical: 0 }} /> : null}
          </View>
        ))}
      </Card>

      <Button
        label="Switch account"
        variant="outline"
        icon="swap-horizontal-outline"
        style={{ marginBottom: spacing.md }}
        onPress={() => { auth.signOut(); navigation.navigate('Auth'); }}
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

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  iconTile: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
});
