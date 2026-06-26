import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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
  ScreenHeader,
  Tabs,
  TextField,
} from '../../components/ui';
import {
  useStore,
  staff,
  roles,
  events,
  inviteStaff,
  updateStaffRole,
  removeStaff,
  PERMISSION_LABELS,
  getRoleById,
} from '../../data/mock';

export default function StaffRolesScreen({ navigation }) {
  useStore();

  const eventId = events[0]?.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id);

  const sendInvite = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing details', 'Enter a name and email to send an invite.');
      return;
    }
    const record = inviteStaff(eventId, { name: name.trim(), email: email.trim(), roleId });
    Alert.alert(
      'Invite sent',
      `${record.name} was invited as ${record.roleName}.\n\nInvite ID: ${record.inviteId}`
    );
    setName('');
    setEmail('');
    setRoleId(roles[0]?.id);
  };

  const confirmRemove = (s) => {
    Alert.alert('Remove teammate', `Remove ${s.name} from your team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeStaff(s.id) },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Staff & Roles"
        subtitle="Manage your team and what they can do"
        onBack={() => navigation.goBack()}
      />

      {/* Invite section */}
      <Card style={{ marginBottom: spacing.lg }}>
        <SectionTitle>Invite a teammate</SectionTitle>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Jane Doe" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="jane@example.com"
          keyboardType="email-address"
        />
        <Text style={[font.small, { fontFamily: 'Inter_700Bold', fontWeight: '700', marginBottom: 6, color: colors.text }]}>
          Role
        </Text>
        <Tabs
          tabs={roles.map((r) => ({ key: r.id, label: r.name }))}
          active={roleId}
          onChange={setRoleId}
        />
        <Button label="Send invite" icon="paper-plane-outline" onPress={sendInvite} />
      </Card>

      {/* Team list */}
      <Card style={{ marginBottom: spacing.lg }}>
        <SectionTitle>Your team</SectionTitle>
        {staff.length === 0 ? (
          <Text style={font.small}>No teammates yet. Invite someone above.</Text>
        ) : (
          staff.map((s, idx) => (
            <View key={s.id}>
              {idx > 0 ? <Divider /> : null}
              <Row>
                <Avatar seed={s.name} size={44} />
                <View style={{ flex: 1, marginLeft: spacing.md, paddingRight: spacing.sm }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={[font.small, { marginTop: 1 }]} numberOfLines={1}>{s.email}</Text>
                  <Row style={{ marginTop: spacing.xs, flexWrap: 'wrap' }}>
                    <Badge tone="primary" label={s.roleName} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                    <Badge
                      tone={s.status === 'ACTIVE' ? 'green' : 'amber'}
                      dot
                      label={s.status}
                      style={{ marginBottom: spacing.xs }}
                    />
                  </Row>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(s)} activeOpacity={0.8} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -spacing.sm }}>
                  <Ionicons name="trash-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </Row>

              {/* Change role chips */}
              <Text style={[font.tiny, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>Change role</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {roles.map((r) => {
                  const on = r.id === s.roleId;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => updateStaffRole(s.id, r.id)}
                      activeOpacity={0.85}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: radius.full,
                        borderWidth: 1,
                        marginRight: spacing.xs,
                        marginBottom: spacing.xs,
                        backgroundColor: on ? colors.primary : colors.surface,
                        borderColor: on ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{ color: on ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12, fontFamily: 'Inter_700Bold' }}>
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Roles reference */}
      <Card>
        <SectionTitle>Roles &amp; permissions</SectionTitle>
        {roles.map((role, idx) => (
          <View key={role.id}>
            {idx > 0 ? <Divider /> : null}
            <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text, fontFamily: 'Inter_700Bold' }}>
              {role.name}
            </Text>
            <Text style={[font.small, { marginTop: 2, marginBottom: spacing.sm, lineHeight: 19 }]}>{role.description}</Text>
            {PERMISSION_LABELS.map((p) => {
              const granted = !!role.permissions[p.key];
              return (
                <Row key={p.key} style={{ marginBottom: spacing.xs }}>
                  <Ionicons
                    name={granted ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={granted ? colors.accent : colors.textMuted}
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={{ fontSize: 13, color: granted ? colors.text : colors.textMuted, fontFamily: 'Inter_400Regular' }}>
                    {p.label}
                  </Text>
                </Row>
              );
            })}
          </View>
        ))}
      </Card>
    </Screen>
  );
}
