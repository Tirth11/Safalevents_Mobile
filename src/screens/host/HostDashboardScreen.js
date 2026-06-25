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
import { events, rsvps, useStore, getCurrentHost, hostFullyVerified, getCheckedInCount } from '../../data/mock';

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
  const totalSeats = rsvps.reduce((n, r) => n + (r.guestCount || 1), 0);
  const arrivedSeats = rsvps.reduce((n, r) => n + getCheckedInCount(r), 0);
  const checkinPct = totalSeats ? arrivedSeats / totalSeats : 0;

  // Per-event RSVP vs attended (first few events) for the trend chart.
  const eventBars = events.slice(0, 4).map((e) => {
    const ev = rsvps.filter((r) => r.eventId === e.id);
    return {
      label: e.title.split(' ')[0],
      a: ev.reduce((n, r) => n + (r.guestCount || 1), 0),
      b: ev.reduce((n, r) => n + getCheckedInCount(r), 0),
    };
  });

  // RSVP response breakdown for the stacked bar.
  const confirmed = rsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED').length;
  const pending = rsvps.filter((r) => r.approvalState === 'UNDER_APPROVAL').length;
  const waitlist = rsvps.filter((r) => r.status === 'waitlist').length;
  const rejected = rsvps.filter((r) => r.approvalState === 'REJECTED').length;
  const rsvpSegments = [
    { label: 'Confirmed', value: confirmed, color: colors.accent },
    { label: 'Pending', value: pending, color: colors.amber },
    { label: 'Waitlist', value: waitlist, color: colors.blue },
    { label: 'Rejected', value: rejected, color: colors.red },
  ].filter((s) => s.value > 0);

  const earningsBars = [
    { label: 'Week 1', value: 800, color: colors.primary },
    { label: 'Week 2', value: 1500, color: colors.primary },
    { label: 'Week 3', value: 2100, color: colors.primary },
    { label: 'Week 4', value: 3200, color: colors.accent },
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

      {/* Quick stats */}
      <Row style={{ marginBottom: spacing.md, alignItems: 'stretch' }}>
        <StatCard label="Total Events" value={events.length} icon="calendar-outline" color={colors.primary} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Total RSVPs" value={rsvps.length} icon="people-outline" color={colors.blue} />
      </Row>
      <Row style={{ marginBottom: spacing.xl, alignItems: 'stretch' }}>
        <StatCard label="Pending" value={pendingCount} icon="time-outline" color={colors.amber} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Attendees In" value={`${arrivedSeats}/${totalSeats}`} icon="checkmark-circle" color={colors.accent} />
      </Row>

      {/* ── Check-in rate gauge ── */}
      <Card style={{ marginBottom: spacing.lg }}>
        <ChartHeading icon="speedometer-outline" title="Check-in Rate" subtitle="Attendees arrived vs expected" color={colors.accent} />
        <Row style={{ justifyContent: 'space-around', alignItems: 'center' }}>
          <GaugeRing progress={checkinPct} color={colors.accent} label={`${arrivedSeats} of ${totalSeats}\nattendees in`} />
          <View style={{ gap: spacing.md }}>
            <MiniStat color={colors.accent} value={arrivedSeats} label="Arrived" />
            <MiniStat color={colors.amber} value={totalSeats - arrivedSeats} label="Expected" />
            <MiniStat color={colors.primary} value={`${Math.round(checkinPct * 100)}%`} label="Turnout" />
          </View>
        </Row>
      </Card>

      {/* ── Attendance trend ── */}
      <Card style={{ marginBottom: spacing.lg }}>
        <ChartHeading icon="bar-chart-outline" title="RSVP vs Attendance" subtitle="Reserved seats vs who showed up" />
        <BarGroupChart data={eventBars} />
        <Legend
          items={[
            { label: 'RSVP seats', color: colors.primary },
            { label: 'Attended', color: colors.accent },
          ]}
        />
      </Card>

      {/* ── RSVP response overview ── */}
      {rsvpSegments.length > 0 && (
        <Card style={{ marginBottom: spacing.lg }}>
          <ChartHeading icon="pie-chart-outline" title="RSVP Responses" subtitle="Where your guests stand" color={colors.blue} />
          <StackedBar segments={rsvpSegments} />
        </Card>
      )}

      {/* ── Earnings growth ── */}
      <Card style={{ marginBottom: spacing.xl }}>
        <ChartHeading icon="trending-up-outline" title="Earnings Growth" subtitle="This month · $2,450 collected" color={colors.primary} />
        <HBars data={earningsBars} suffix="" />
        <Divider style={{ marginVertical: spacing.md }} />
        <Row style={styles.between}>
          <View>
            <Text style={font.tiny}>This month</Text>
            <Text style={[font.h2, { color: colors.text }]}>$2,450</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={font.tiny}>Projected</Text>
            <Text style={[font.h2, { color: colors.accent }]}>$4,100</Text>
          </View>
        </Row>
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
