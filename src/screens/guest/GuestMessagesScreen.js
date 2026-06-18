import React, { useState } from 'react';
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
  Tabs,
  EmptyState,
} from '../../components/ui';
import { conversations, outbox } from '../../data/mock';

const TABS = [
  { key: 'conversations', label: 'Conversations' },
  { key: 'logs', label: 'Delivery logs' },
];

const CHANNEL_TONE = { Email: 'blue', SMS: 'purple' };

export default function GuestMessagesScreen({ navigation, route }) {
  const [active, setActive] = useState('conversations');

  return (
    <Screen>
      <Text style={[font.h1, { marginBottom: spacing.md }]}>Messages</Text>

      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'conversations' ? (
        conversations.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            subtitle="Message a host from an event to start a chat."
          />
        ) : (
          conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <Card
                key={c.id}
                style={{ marginBottom: spacing.md }}
                onPress={() =>
                  navigation.navigate('GuestChat', { conversationId: c.id, eventId: c.eventId })
                }
              >
                <Row>
                  <Avatar seed={c.hostName} size={44} />
                  <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
                    <Row style={styles.between}>
                      <Text style={[font.body, { fontWeight: '700' }]} numberOfLines={1}>
                        {c.hostName}
                      </Text>
                      {c.unread ? <Ionicons name="ellipse" size={10} color={colors.red} /> : null}
                    </Row>
                    <Text style={font.tiny} numberOfLines={1}>
                      {c.eventTitle}
                    </Text>
                    <Text style={[font.small, { marginTop: 4 }]} numberOfLines={1}>
                      {last ? last.text : 'No messages yet'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Row>
              </Card>
            );
          })
        )
      ) : outbox.length === 0 ? (
        <EmptyState
          icon="mail-outline"
          title="No delivery logs"
          subtitle="Notifications you receive will appear here."
        />
      ) : (
        outbox.map((o) => (
          <Card key={o.id} style={{ marginBottom: spacing.md }}>
            <Row style={styles.between}>
              <Badge tone={CHANNEL_TONE[o.channel] || 'gray'} label={o.channel} />
              <Text style={font.tiny}>{o.time}</Text>
            </Row>
            <Text style={[font.body, { fontWeight: '700', marginTop: 8 }]} numberOfLines={1}>
              {o.subject}
            </Text>
            <Row style={{ marginTop: 4 }}>
              <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
              <Text style={[font.small, { marginLeft: 4 }]} numberOfLines={1}>
                To {o.to}
              </Text>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}

export { GuestMessagesScreen };

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
});
