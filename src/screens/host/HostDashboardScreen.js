import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
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
import { GaugeRing, BarGroupChart, StackedBar, HBars, Legend } from '../../components/Charts';
import { events, rsvps, useStore, getCurrentHost, hostFullyVerified, getCheckedInCount, conversations } from '../../data/mock';

const STATUS_TONE = {
  Published: 'green',
  Draft: 'gray',
  Cancelled: 'red',
};

// Small heading used above each chart card.
function ChartHeading({ icon, title, subtitle, color = colors.primary }) {
  return (
    <Row style={{ marginBottom: spacing.md }}>
      <View style={[styles.chartIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={{ marginLeft: spacing.sm, flex: 1 }}>
        <Text style={[font.h3, { marginBottom: 0 }]}>{title}</Text>
        {subtitle ? <Text style={font.tiny}>{subtitle}</Text> : null}
      </View>
    </Row>
  );
}

export default function HostDashboardScreen({ navigation }) {
  useStore(); // live update when staff check guests in at the gate
  const host = getCurrentHost();

  // Org hosts are locked out until docs uploaded + admin-approved.
  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  // ── Derived metrics ──────────────────────────────────────────────────────
  const pendingCount = rsvps.filter((r) => r.approvalState === 'UNDER_APPROVAL').length;
  const unreadCount = conversations ? conversations.filter((c) => c.unread).length : 2;
  const pendingEventsCount = events.filter((e) => e.status === 'Pending').length;

  // Per-event RSVP vs attended (first few events) for the trend chart.
  const eventBars = events.slice(0, 4).map((e) => {
    const ev = rsvps.filter((r) => r.eventId === e.id);
    return {
      label: e.title.split(' ')[0],
      a: ev.filter((r) => r.status === 'going').length,
      b: ev.filter((r) => r.status === 'maybe' || r.status === 'waitlist').length,
    };
  });

  const earningsBars = [
    { label: 'Jan', value: 1200, color: colors.primary },
    { label: 'Feb', value: 2500, color: colors.primary },
    { label: 'Mar', value: 3800, color: colors.primary },
    { label: 'Apr', value: 5100, color: colors.primary },
    { label: 'May', value: 7200, color: colors.primary },
    { label: 'Jun', value: 10450, color: colors.accent },
  ];

  const geoBars = [
    { label: 'New York', value: 320, color: colors.primary },
    { label: 'New Jersey', value: 150, color: colors.primary },
    { label: 'Connecticut', value: 65, color: colors.primary },
    { label: 'London', value: 28, color: colors.primary },
    { label: 'Boston', value: 12, color: colors.primary },
  ];

  const dayBars = [
    { label: 'M', a: 20, b: 0 },
    { label: 'T', a: 45, b: 0 },
    { label: 'W', a: 80, b: 0 },
    { label: 'T', a: 110, b: 0 },
    { label: 'F', a: 190, b: 0 },
    { label: 'S', a: 310, b: 0 },
    { label: 'S', a: 150, b: 0 },
  ];

  return (
    <Screen>
      {/* Greeting */}
      <Row style={[styles.between, { marginBottom: spacing.lg }]}>
        <Row>
          <Avatar seed={host.avatarSeed || host.name} size={46} />
          <View style={{ marginLeft: spacing.md }}>
            <Text style={font.small}>Welcome back,</Text>
            <Text style={font.h2}>{(host.name || 'Host').split(' ')[0]}</Text>
          </View>
        </Row>
        <TouchableOpacity onPress={() => navigation.navigate('HostNotifications')} style={styles.bell} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </Row>

      {/* Quick stats matching web app */}
      <Row style={{ marginBottom: spacing.md, alignItems: 'stretch' }}>
        <StatCard label="Total Events" value={events.length} icon="calendar-outline" color={colors.primary} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Unread Messages" value={unreadCount} icon="chatbubble-outline" color={colors.blue} />
      </Row>
      <Row style={{ marginBottom: spacing.xl, alignItems: 'stretch' }}>
        <StatCard label="RSVP Pending" value={pendingCount} icon="time-outline" color={colors.amber} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Events Pending" value={pendingEventsCount} icon="shield-checkmark-outline" color={colors.red} />
      </Row>

      {/* ── RSVP Response Overview ── */}
      <Card style={{ marginBottom: spacing.lg }}>
        <ChartHeading icon="pie-chart-outline" title="RSVP Response Overview" subtitle="Total RSVPs by event" />
        <BarGroupChart data={eventBars} aColor="#00A152" bColor="#F59F00" />
        <Legend
          items={[
            { label: 'Yes', color: '#00A152' },
            { label: 'Maybe', color: '#F59F00' },
          ]}
        />
      </Card>

      {/* ── Earnings growth ── */}
      <Card style={{ marginBottom: spacing.lg }}>
        <ChartHeading icon="trending-up-outline" title="Earnings Growth" subtitle="Cumulative revenue over time" color={colors.primary} />
        <HBars data={earningsBars} suffix="" />
      </Card>

      {/* ── Guest Demographics ── */}
      <Card style={{ marginBottom: spacing.lg }}>
        <ChartHeading icon="map-outline" title="Guest Demographics" subtitle="Top regions across all events" color={colors.blue} />
        <HBars data={geoBars} />
      </Card>

      {/* ── Day of Week ── */}
      <Card style={{ marginBottom: spacing.xl }}>
        <ChartHeading icon="calendar-outline" title="Successful Participation" subtitle="Avg. RSVPs by day" color={colors.accent} />
        <BarGroupChart data={dayBars} bColor="transparent" />
      </Card>


      {/* Pending approvals callout */}
      {pendingCount > 0 && (
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
      )}

      {/* Events */}
      <SectionTitle right={<Button label="See all" variant="ghost" small onPress={() => navigation.navigate('Events')} />}>
        Your events
      </SectionTitle>
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
                <Text style={[font.small, { marginLeft: 4, color: colors.text, fontWeight: '700' }]}>{count} RSVPs</Text>
              </Row>
            </View>
          </Card>
        );
      })}

      <Button label="Create event" variant="primary" icon="add" style={{ marginTop: spacing.md }} onPress={() => navigation.navigate('HostCreateEvent')} />
    </Screen>
  );
}

function MiniStat({ color, value, label }) {
  return (
    <Row>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, marginRight: 8 }} />
      <View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, fontFamily: 'Inter_800ExtraBold', lineHeight: 20 }}>{value}</Text>
        <Text style={font.tiny}>{label}</Text>
      </View>
    </Row>
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
  chartIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 120, backgroundColor: colors.surfaceHover },
});
