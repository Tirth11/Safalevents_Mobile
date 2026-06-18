import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Badge,
  Button,
  Row,
  Divider,
  EmptyState,
  ScreenHeader,
} from '../../components/ui';
import { notifications } from '../../data/mock';

const TYPE_META = {
  rsvp: { color: colors.primary, icon: 'people-outline' },
  message: { color: colors.blue, icon: 'chatbubbles-outline' },
  checkin: { color: colors.accent, icon: 'checkmark-circle' },
};

export default function HostNotificationsScreen({ navigation, route }) {
  return (
    <Screen>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="You're all caught up"
          subtitle="New activity will show up here."
        />
      ) : (
        notifications.map((n) => {
          const meta = TYPE_META[n.type] || TYPE_META.rsvp;
          return (
            <Card key={n.id} style={{ marginBottom: spacing.md }}>
              <Row style={{ alignItems: 'flex-start' }}>
                <View style={[styles.iconTile, { backgroundColor: meta.color + '22' }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Row style={styles.between}>
                    <Text style={{ fontWeight: '800', fontSize: 14, color: colors.text, flex: 1, paddingRight: 8 }}>
                      {n.title}
                    </Text>
                    {!n.read ? <View style={styles.unreadDot} /> : null}
                  </Row>
                  <Text style={[font.small, { color: colors.text, marginTop: 2 }]}>{n.message}</Text>
                  <Text style={[font.tiny, { marginTop: 4 }]}>{n.time}</Text>
                </View>
              </Row>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  iconTile: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red, marginTop: 4 },
});
