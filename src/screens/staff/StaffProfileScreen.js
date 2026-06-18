import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, Divider } from '../../components/ui';
import {
  useStore, getCurrentStaff, getEvent, getRoleById, getStaffPermissions, setCurrentStaff, PERMISSION_LABELS,
} from '../../data/mock';
import { useAuth } from '../../auth/AuthContext';

export default function StaffProfileScreen({ navigation }) {
  const auth = useAuth();
  useStore();
  const staff = getCurrentStaff();
  const role = staff && getRoleById(staff.roleId);
  const perms = getStaffPermissions(staff);
  const event = getEvent(staff?.eventId);

  return (
    <Screen>
      <SectionTitle>My access</SectionTitle>

      <Card style={{ marginBottom: spacing.lg }}>
        <Row>
          <Avatar seed={staff?.name} size={52} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={font.h3}>{staff?.name}</Text>
            <Text style={font.small}>{staff?.email}</Text>
            <Row style={{ marginTop: 4 }}>
              <Badge tone="purple" label={role ? role.name : 'Staff'} />
            </Row>
          </View>
        </Row>
        {role?.description ? <Text style={[font.small, { marginTop: 10 }]}>{role.description}</Text> : null}
        <Divider />
        <Text style={font.small}>Assigned event</Text>
        <Text style={{ fontWeight: '700', color: colors.text, marginTop: 2 }}>{event ? event.title : '—'}</Text>
      </Card>

      <SectionTitle>What your role allows</SectionTitle>
      <Card style={{ marginBottom: spacing.lg }}>
        {PERMISSION_LABELS.map((p, i) => {
          const on = !!perms[p.key];
          return (
            <Row key={p.key} style={{ paddingVertical: 8, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
              <Ionicons name={on ? 'checkmark-circle' : 'close-circle'} size={18} color={on ? colors.accent : colors.textMuted} />
              <Text style={{ marginLeft: 10, fontSize: 14, color: on ? colors.text : colors.textMuted, flex: 1 }}>{p.label}</Text>
              {on ? <Badge tone="green" label="Allowed" /> : <Badge tone="gray" label="Hidden" />}
            </Row>
          );
        })}
      </Card>

      <Button
        label="Switch account"
        icon="swap-horizontal-outline"
        variant="outline"
        onPress={() => { auth.signOut(); navigation.navigate('Auth', { mode: 'login' }); }}
        style={{ marginBottom: 10 }}
      />
      <Button
        label="Log out"
        icon="log-out-outline"
        variant="danger"
        onPress={() => { auth.signOut(); navigation.navigate('Browse'); }}
      />
    </Screen>
  );
}
