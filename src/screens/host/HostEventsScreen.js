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
  Row,
  Divider,
  Field,
  Tabs,
  VerificationGate,
} from '../../components/ui';
import { events, getRsvps, useStore, getCurrentHost, hostFullyVerified } from '../../data/mock';

const STATUS_TONE = {
  Published: 'green',
  Draft: 'gray',
  Cancelled: 'red',
};

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'drafts', label: 'Drafts' },
];

export default function HostEventsScreen({ navigation, route }) {
  useStore();
  const [active, setActive] = useState('upcoming');
  const host = getCurrentHost();

  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  return (
    <Screen>
      <Row style={[styles.between, { marginBottom: spacing.lg }]}>
        <Text style={font.h1}>My Events</Text>
        <Button
          label="New"
          variant="primary"
          icon="add"
          small
          onPress={() => navigation.navigate('HostCreateEvent')}
        />
      </Row>

      <Tabs tabs={TABS} active={active} onChange={setActive} />

      <Field placeholder="Search events…" />

      {events.map((e) => {
        const count = getRsvps(e.id).length;
        return (
          <Card key={e.id} padded={false} style={{ marginBottom: spacing.md, overflow: 'hidden' }}>
            <Image source={{ uri: e.cover }} style={styles.cover} />
            <View style={{ padding: spacing.lg }}>
              <Row style={styles.between}>
                <Text style={[font.h3, { flex: 1, paddingRight: spacing.sm }]} numberOfLines={1}>
                  {e.title}
                </Text>
                <Badge tone={STATUS_TONE[e.status] || 'gray'} label={e.status} />
              </Row>
              <Row style={{ marginTop: 6 }}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: 4 }]}>
                  {e.date} • {e.time}
                </Text>
              </Row>
              <Row style={{ marginTop: 4 }}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                  {e.location}
                </Text>
              </Row>
              <Divider style={{ marginVertical: spacing.sm }} />
              <Row style={styles.between}>
                <Row>
                  <Ionicons name="people-outline" size={14} color={colors.primary} />
                  <Text style={[font.small, { marginLeft: 4, color: colors.text, fontWeight: '700' }]}>
                    {count} RSVPs · cap {e.capacity}
                  </Text>
                </Row>
                <Button
                  label="Manage"
                  variant="outline"
                  small
                  onPress={() => navigation.navigate('HostEventManage', { eventId: e.id })}
                />
              </Row>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  cover: { width: '100%', height: 120, backgroundColor: colors.surfaceHover },
});
