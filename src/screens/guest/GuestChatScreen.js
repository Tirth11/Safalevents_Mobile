import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
import {
  Screen,
  Card,
  Button,
  Row,
  Field,
  ScreenHeader,
} from '../../components/ui';
import { conversations } from '../../data/mock';

export default function GuestChatScreen({ navigation, route }) {
  const convo =
    conversations.find(
      (c) => c.id === route.params?.conversationId || c.eventId === route.params?.eventId
    ) || conversations[0];

  return (
    <Screen>
      <ScreenHeader
        title="Message Host"
        subtitle={convo.hostName}
        onBack={() => navigation.goBack()}
      />

      {convo.messages.map((m, idx) => {
        const isGuest = m.sender === 'guest';
        return (
          <View
            key={idx}
            style={{ alignItems: isGuest ? 'flex-end' : 'flex-start', marginBottom: spacing.md }}
          >
            <View
              style={[
                styles.bubble,
                isGuest
                  ? { backgroundColor: colors.primary, borderTopRightRadius: 4 }
                  : { backgroundColor: colors.surfaceHover, borderTopLeftRadius: 4 },
              ]}
            >
              <Text style={{ color: isGuest ? colors.white : colors.text, fontSize: 14, lineHeight: 20 }}>
                {m.text}
              </Text>
            </View>
            <Text style={[font.tiny, { marginTop: spacing.xs, marginHorizontal: spacing.xs }]}>{m.time}</Text>
          </View>
        );
      })}

      <Row style={{ marginTop: spacing.sm, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Field placeholder="Type a message…" />
        </View>
        <Button
          label="Send"
          variant="primary"
          icon="send"
          small
          onPress={() => Alert.alert('Send', 'Prototype — not wired')}
        />
      </Row>
    </Screen>
  );
}

export { GuestChatScreen };

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
});
