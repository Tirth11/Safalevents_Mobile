import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font } from '../../theme/theme';
import { Screen, Card, Button, Avatar, Row, Divider } from '../../components/ui';
import { useAuth } from '../../auth/AuthContext';

const PERKS = [
  { icon: 'checkmark-done-outline', text: 'RSVP and get your QR ticket pass' },
  { icon: 'chatbubbles-outline', text: 'Message hosts about an event' },
  { icon: 'bookmark-outline', text: 'Save events for later' },
  { icon: 'sparkles-outline', text: 'Host your own events & manage RSVPs' },
];

export default function BrowseAccountScreen({ navigation }) {
  const auth = useAuth();

  if (auth.isAuthed) {
    return (
      <Screen>
        <Card style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Avatar seed={auth.user.name} size={64} />
          <Text style={[font.h3, { marginTop: spacing.md }]} numberOfLines={1}>{auth.user.name}</Text>
          <Text style={font.small} numberOfLines={1}>{auth.user.email}</Text>
          <Button
            label="Go to my dashboard"
            icon="arrow-forward"
            style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
            onPress={() => navigation.navigate(auth.user.role === 'host' ? 'HostTabs' : auth.user.role === 'staff' ? 'StaffTabs' : 'GuestTabs')}
          />
          <Button label="Log out" variant="outline" style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} onPress={() => auth.signOut()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[font.h2, { marginTop: spacing.md, textAlign: 'center' }]}>You're browsing as a guest</Text>
        <Text style={[font.small, { textAlign: 'center', marginTop: spacing.xs, lineHeight: 19 }]}>Create an account to RSVP, message hosts, and host your own events.</Text>
      </View>

      <Card style={{ marginBottom: spacing.lg }}>
        {PERKS.map((p, i) => (
          <Row key={p.text} style={{ paddingVertical: spacing.sm, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
            <Ionicons name={p.icon} size={18} color={colors.primary} />
            <Text style={{ marginLeft: spacing.md, fontSize: 14, color: colors.text, flex: 1 }} numberOfLines={1}>{p.text}</Text>
          </Row>
        ))}
      </Card>

      <Button label="Log in / Sign up" icon="log-in-outline" onPress={() => navigation.navigate('Auth')} />
      <Divider />
      <Button label="Login as Staff (Invite ID)" variant="outline" icon="shield-checkmark-outline" onPress={() => navigation.navigate('Auth', { staff: true })} />
    </Screen>
  );
}
