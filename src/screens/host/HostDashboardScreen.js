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
  VerificationGate,
} from '../../components/ui';
import { events, rsvps, useStore, getCurrentHost, hostFullyVerified } from '../../data/mock';

const STATUS_TONE = {
  Published: 'green',
  Draft: 'gray',
  Cancelled: 'red',
};

export default function HostDashboardScreen({ navigation, route }) {
  useStore(); // live update when staff check guests in at the gate
  const host = getCurrentHost();

  // Phase 1d — org hosts are locked out until docs uploaded + admin-approved.
  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  const pendingCount = rsvps.filter((r) => r.approvalState === 'UNDER_APPROVAL').length;
  const checkedInCount = rsvps.filter((r) => r.checkedIn).length;
  const checkinPct = rsvps.length ? Math.round((checkedInCount / rsvps.length) * 100) : 0;

  return (
    <Screen>
      <Row style={[styles.between, { marginBottom: spacing.lg }]}>
        <Row>
          <Avatar seed={host.avatarSeed || host.name} size={46} />
          <View style={{ marginLeft: spacing.md }}>
            <Text style={font.small}>Welcome back,</Text>
            <Text style={font.h2}>{(host.name || 'Host').split(' ')[0]}</Text>
          </View>
        </Row>
        <TouchableOpacity
          onPress={() => navigation.navigate('HostNotifications')}
          style={styles.bell}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </Row>

      <Row style={{ marginBottom: spacing.md }}>
        <StatCard label="Total Events" value={events.length} icon="calendar-outline" color={colors.primary} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Total RSVPs" value={rsvps.length} icon="people-outline" color={colors.blue} />
      </Row>
      <Row style={{ marginBottom: spacing.lg }}>
        <StatCard label="Pending" value={pendingCount} icon="time-outline" color={colors.amber} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Check-in %" value={`${checkinPct}%`} icon="checkmark-circle" color={colors.accent} />
      </Row>

      <Card style={{ borderColor: colors.amber, backgroundColor: colors.amberTint, marginBottom: spacing.xl }}>
        <Row style={styles.between}>
          <Row style={{ flex: 1, paddingRight: spacing.md }}>
            <View style={[styles.iconTile, { backgroundColor: colors.amber + '22' }]}>
              <Ionicons name="time-outline" size={20} color={colors.amber} />
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={font.h3}>RSVPs awaiting approval</Text>
              <Text style={font.small}>{pendingCount} request(s) need your review</Text>
            </View>
          </Row>
        </Row>
        <Button
          label="Review now"
          variant="accent"
          icon="checkmark-circle"
          small
          style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
          onPress={() => navigation.navigate('HostEventManage', { eventId: '2' })}
        />
      </Card>

      <SectionTitle>Your events</SectionTitle>
      {events.slice(0, 3).map((e) => {
        const count = rsvps.filter((r) => r.eventId === e.id).length;
        return (
          <Card
            key={e.id}
            padded={false}
            style={{ marginBottom: spacing.md, overflow: 'hidden' }}
            onPress={() => navigation.navigate('HostEventManage', { eventId: e.id })}
          >
            <Image source={{ uri: e.cover }} style={styles.cover} />
            <View style={{ padding: spacing.lg }}>
              <Row style={styles.between}>
                <Text style={[font.h3, { flex: 1, paddingRight: spacing.sm }]} numberOfLines={1}>
                  {e.title}
                </Text>
                <Badge tone={STATUS_TONE[e.status] || 'gray'} label={e.status} />
              </Row>
              <Row style={{ marginTop: 6 }}>
                <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: 4 }]} numberOfLines={1}>
                  {e.date} • {e.location}
                </Text>
              </Row>
              <Divider style={{ marginVertical: spacing.sm }} />
              <Row>
                <Ionicons name="people-outline" size={14} color={colors.primary} />
                <Text style={[font.small, { marginLeft: 4, color: colors.text, fontWeight: '700' }]}>
                  {count} RSVPs
                </Text>
              </Row>
            </View>
          </Card>
        );
      })}

      <Button
        label="Create event"
        variant="primary"
        icon="add"
        style={{ marginTop: spacing.md }}
        onPress={() => navigation.navigate('HostCreateEvent')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  iconTile: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 120, backgroundColor: colors.surfaceHover },
});
