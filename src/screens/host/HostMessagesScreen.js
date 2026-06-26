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
  Field,
  EmptyState,
  VerificationGate,
} from '../../components/ui';
import { conversations, useStore, getCurrentHost, hostFullyVerified } from '../../data/mock';

export default function HostMessagesScreen({ navigation, route }) {
  useStore();
  const [selectedId, setSelectedId] = useState(null);
  const selected = conversations.find((c) => c.id === selectedId);
  const host = getCurrentHost();

  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  return (
    <Screen>
      <Text style={[font.h1, { marginBottom: spacing.lg }]}>Messages</Text>

      {conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No conversations yet"
          subtitle="Guest messages will appear here when they reach out."
        />
      ) : !selected ? (
        conversations.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return (
            <Card key={c.id} style={{ marginBottom: spacing.md }} onPress={() => setSelectedId(c.id)}>
              <Row>
                <Avatar seed={c.guestName} size={44} />
                <View style={{ flex: 1, marginLeft: spacing.md, paddingRight: spacing.sm }}>
                  <Row style={styles.between}>
                    <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text, flex: 1 }} numberOfLines={1}>{c.guestName}</Text>
                    {c.unread ? <View style={[styles.unreadDot, { marginLeft: spacing.sm }]} /> : null}
                  </Row>
                  <Text style={font.small} numberOfLines={1}>{c.eventTitle}</Text>
                  <Text style={[font.small, { marginTop: spacing.xs, color: colors.text }]} numberOfLines={1}>
                    {last ? last.text : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
              </Row>
            </Card>
          );
        })
      ) : (
        <View>
          <Row style={[styles.between, { marginBottom: spacing.md }]}>
            <Row style={{ flex: 1, paddingRight: spacing.sm }}>
              <Avatar seed={selected.guestName} size={40} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text }} numberOfLines={1}>{selected.guestName}</Text>
                <Text style={font.small} numberOfLines={1}>{selected.eventTitle}</Text>
              </View>
            </Row>
            <Button label="Back" variant="ghost" icon="chevron-back" small onPress={() => setSelectedId(null)} />
          </Row>

          <Card>
            {selected.messages.map((m, i) => {
              const isHost = m.sender === 'host';
              return (
                <View
                  key={i}
                  style={[
                    styles.bubble,
                    isHost
                      ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
                      : { backgroundColor: colors.surfaceHover, alignSelf: 'flex-start' },
                  ]}
                >
                  <Text style={{ color: isHost ? '#fff' : colors.text, fontSize: 14, lineHeight: 20 }}>{m.text}</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      marginTop: spacing.xs,
                      textAlign: 'right',
                      color: isHost ? 'rgba(255,255,255,0.8)' : colors.textMuted,
                    }}
                  >
                    {m.time}
                  </Text>
                </View>
              );
            })}
          </Card>

          <View style={{ marginTop: spacing.md }}>
            <Field placeholder="Reply…" />
            <Button
              label="Send"
              variant="primary"
              icon="mail-outline"
              onPress={() => Alert.alert('Prototype — not wired')}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
});
