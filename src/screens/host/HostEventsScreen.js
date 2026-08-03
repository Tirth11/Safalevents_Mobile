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
import { events, getRsvps, useStore, getCurrentHost, hostFullyVerified, deleteEvent } from '../../data/mock';

const STATUS_TONE = {
  Published: 'green',
  Draft: 'gray',
  Cancelled: 'red',
};

// Mirrors the web dashboard's My Events buckets.
const TABS = [
  { key: 'live', label: 'Live Now' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Draft' },
  { key: 'past', label: 'Past' },
  { key: 'approval', label: 'Approval' },
  { key: 'all', label: 'All' },
];

// Date ranges within Scheduled — the only bucket that spans future dates.
const RANGES = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'future', label: 'Future' },
];

const isUnderApproval = (e) =>
  e.approvalState === 'UNDER_APPROVAL' || e.status === 'Under Approval';

// Live from the start time for four hours, matching the web rule.
const isLiveNow = (e, now, todayStr) => {
  if (e.status === 'Draft' || e.date !== todayStr) return false;
  const startHr = parseInt(String(e.time || '00:00').split(':')[0], 10);
  const hr = now.getHours();
  return hr >= startHr && hr < startHr + 4;
};

function bucketEvents(list, tab, range, now) {
  const todayStr = now.toISOString().split('T')[0];
  return list.filter((e) => {
    if (tab === 'all') return true;
    if (tab === 'approval') return isUnderApproval(e);
    if (tab === 'draft') return e.status === 'Draft';
    if (e.status === 'Draft') return false;

    const start = new Date(`${e.date}T${e.time || '00:00'}`);
    if (isNaN(start.getTime())) return false;
    const diffDays = Math.ceil((start.getTime() - now.getTime()) / 86400000);

    if (tab === 'live') return isLiveNow(e, now, todayStr);
    if (tab === 'past') return start < now && !isLiveNow(e, now, todayStr);
    if (tab === 'scheduled') {
      if (isLiveNow(e, now, todayStr) || start < now) return false;
      if (range === 'today') return e.date === todayStr;
      if (range === 'week') return diffDays >= 0 && diffDays <= 7;
      if (range === 'future') return diffDays > 7;
      return true;
    }
    return false;
  });
}

export default function HostEventsScreen({ navigation, route }) {
  useStore();
  // Scheduled by default — Live Now is empty most of the day.
  const [active, setActive] = useState('scheduled');
  const [range, setRange] = useState('all');
  const [query, setQuery] = useState('');
  const host = getCurrentHost();

  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  const now = new Date();
  const q = query.trim().toLowerCase();
  const visible = bucketEvents(events, active, active === 'scheduled' ? range : 'all', now)
    .filter((e) => !q
      || e.title.toLowerCase().includes(q)
      || (e.location && e.location.toLowerCase().includes(q))
      || (e.eventType && e.eventType.toLowerCase().includes(q)))
    // Past reads newest-first; everything else soonest-first.
    .sort((a, b) => {
      const at = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const bt = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return active === 'past' ? bt - at : at - bt;
    });

  const countFor = (tab) => bucketEvents(events, tab, 'all', now).length;

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

      <Tabs
        tabs={TABS.map((t) => {
          const n = countFor(t.key);
          return { key: t.key, label: n > 0 ? `${t.label} ${n}` : t.label };
        })}
        active={active}
        onChange={setActive}
      />

      {active === 'scheduled' ? (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={styles.rangeLabel}>Sort by date</Text>
          <Row style={{ flexWrap: 'wrap' }}>
            {RANGES.map((r) => {
              const isActive = range === r.key;
              const n = bucketEvents(events, 'scheduled', r.key, now).length;
              return (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setRange(r.key)}
                  activeOpacity={0.8}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: isActive ? '#fff' : colors.textMuted }}>
                    {r.label} {n}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Row>
        </View>
      ) : null}

      <Field placeholder="Search events…" value={query} onChangeText={setQuery} />

      {visible.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Ionicons name="calendar-outline" size={34} color={colors.textMuted} />
          <Text style={[font.h3, { marginTop: spacing.sm }]}>Nothing here yet</Text>
          <Text style={[font.small, { textAlign: 'center', marginTop: 4 }]}>
            {q ? 'No events match your search.' : 'No events in this bucket right now.'}
          </Text>
        </Card>
      ) : null}

      {visible.map((e) => {
        const count = getRsvps(e.id).length;
        // "Not yet taken place" — a Draft, or an event whose start is still in the future.
        const eventStart = new Date(`${e.date}T${e.time || '00:00'}`);
        const notOccurred = e.status === 'Draft' || (!isNaN(eventStart.getTime()) && eventStart > new Date());
        const confirmDelete = () => {
          Alert.alert(
            'Delete event?',
            `This permanently deletes "${e.title}" and all its guest RSVP logs. This cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(e.id) },
            ]
          );
        };
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
              <Row style={{ marginTop: spacing.xs }}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: spacing.xs, flex: 1 }]} numberOfLines={1}>
                  {e.date} • {e.time}
                </Text>
              </Row>
              <Row style={{ marginTop: spacing.xs }}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text style={[font.small, { marginLeft: spacing.xs, flex: 1 }]} numberOfLines={1}>
                  {e.location}
                </Text>
              </Row>
              <Divider style={{ marginVertical: spacing.sm }} />
              <Row style={styles.between}>
                <Row style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Ionicons name="people-outline" size={14} color={colors.primary} />
                  <Text style={[font.small, { marginLeft: spacing.xs, color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                    {count} RSVPs · cap {e.capacity}
                  </Text>
                </Row>
                <Row>
                  {notOccurred ? (
                    <TouchableOpacity
                      onPress={confirmDelete}
                      hitSlop={8}
                      activeOpacity={0.7}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.red} />
                    </TouchableOpacity>
                  ) : null}
                  <Button
                    label="Manage"
                    variant="outline"
                    small
                    onPress={() => navigation.navigate('HostEventManage', { eventId: e.id })}
                  />
                </Row>
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
  rangeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
});
