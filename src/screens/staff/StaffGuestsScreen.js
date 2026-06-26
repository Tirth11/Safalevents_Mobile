import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, ApprovalBadge, EmptyState } from '../../components/ui';
import GuestCheckinDetail from '../../components/GuestCheckinDetail';
import {
  useStore, getCurrentStaff, getEvent, getRsvps, staffCan,
  getCheckinState, getCheckedInCount, recordArrival, resetArrival, getPartyMembers,
} from '../../data/mock';

export default function StaffGuestsScreen() {
  useStore();
  const staff = getCurrentStaff();
  const event = getEvent(staff?.eventId) || getEvent('1');
  const eventRsvps = getRsvps(event.id);

  // Permissions
  const canCheckin = staffCan('checkin') || staffCan('guests_edit');
  const canViewHistory = staffCan('history_view') || staffCan('guests_view');

  const [selected, setSelected] = useState(null); // rsvp opened in the detail sheet

  const confirmed = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const other = eventRsvps.filter((r) => !(r.status === 'going' && r.approvalState === 'APPROVED'));

  const scannerName = `${staff?.name || 'Staff'} (Staff)`;

  const renderRow = (r) => {
    const isConfirmed = r.status === 'going' && r.approvalState === 'APPROVED';
    const ci = getCheckinState(r);
    const total = r.guestCount || 1;
    const remaining = total - ci.inCount;
    const isParty = total > 1;
    const members = isParty ? getPartyMembers(r.name, total) : [];

    const arrive = (count) => {
      recordArrival(r.id, count, scannerName);
      const newIn = Math.min(total, getCheckedInCount(r));
      Alert.alert(
        'Arrival recorded ✓',
        newIn >= total
          ? `${r.name} — full party (${total}) checked in. Email sent to the guest.`
          : `${r.name} — ${newIn}/${total} attendees now checked in.`
      );
    };

    return (
      <View key={r.id} style={styles.row}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setSelected(r)}>
          <Row>
            <Avatar seed={r.name} size={34} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>
                {r.name}{isParty ? ` · party of ${total}` : ''}
              </Text>
              <Text style={font.tiny} numberOfLines={1}>{r.email}</Text>
              <Row style={{ marginTop: spacing.xs }}>
                <ApprovalBadge rsvp={r} />
                {isConfirmed && (
                  <View style={[styles.statusBadge, { backgroundColor: ci.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: ci.color }]}>{ci.label}</Text>
                  </View>
                )}
              </Row>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
          </Row>
        </TouchableOpacity>

        {/* Quick door controls */}
        {canCheckin && isConfirmed && (
          <Row style={{ marginTop: spacing.sm, justifyContent: 'flex-end' }}>
            {ci.state === 'full' ? (
              <Row>
                <Badge tone="green" dot label={`All ${total} in`} />
                <Text style={styles.undo} onPress={() => resetArrival(r.id)}>Undo</Text>
              </Row>
            ) : (
              <Row style={{ gap: spacing.sm }}>
                <Button label="View details" small variant="outline" onPress={() => setSelected(r)} />
                <Button label="+1" small variant="accent" onPress={() => arrive(1)} />
                {remaining > 1 && <Button label={`All ${remaining}`} small onPress={() => arrive(remaining)} />}
              </Row>
            )}
          </Row>
        )}

        {isConfirmed && isParty && (
          <View style={styles.members}>
            {members.map((m, i) => {
              const arrived = i < ci.inCount;
              return (
                <Row key={i} style={{ marginTop: spacing.xs }}>
                  <View style={[styles.memberDot, { backgroundColor: arrived ? '#16a34a' : colors.border }]} />
                  <Text style={[font.tiny, { flex: 1, color: arrived ? colors.text : colors.textMuted }]} numberOfLines={1}>{m}</Text>
                  <Text style={[font.tiny, { color: arrived ? '#16a34a' : colors.textMuted, fontWeight: '700' }]}>{arrived ? 'IN' : 'PENDING'}</Text>
                </Row>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen>
      <SectionTitle>Guests</SectionTitle>
      <Text style={[font.small, { marginTop: -spacing.xs, marginBottom: spacing.md, lineHeight: 18 }]} numberOfLines={2}>
        {event.title} · {canCheckin ? 'Tap a guest for full history & check-in' : 'Tap a guest to view details'}
      </Text>

      <Card padded={false} style={{ padding: 6, marginBottom: spacing.lg }}>
        <Text style={[font.tiny, { fontWeight: '700', color: colors.text, padding: spacing.md }]}>Confirmed attendees ({confirmed.length})</Text>
        {confirmed.length ? confirmed.map(renderRow) : <EmptyState icon="people-outline" title="No confirmed guests" />}
      </Card>

      {other.length > 0 && (
        <Card padded={false} style={{ padding: 6 }}>
          <Text style={[font.tiny, { fontWeight: '700', color: colors.text, padding: spacing.md }]}>Pending / waitlist / not approved</Text>
          {other.map(renderRow)}
        </Card>
      )}

      {/* ── Full guest detail sheet (history + check-in, permission-gated) ── */}
      {!!selected && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, backgroundColor: colors.bg }]}>
        <Screen scroll={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Text style={font.h2}>Guest Details</Text>
            <TouchableOpacity onPress={() => setSelected(null)} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.close}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </Row>
          {!canViewHistory ? (
            <Text style={[font.small, { marginBottom: spacing.md }]}>Your role can check guests in but full attendance history is hidden.</Text>
          ) : null}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {selected ? (
              <GuestCheckinDetail
                rsvp={selected}
                event={event}
                scannerName={scannerName}
                canCheckin={canCheckin}
                canViewHistory={canViewHistory}
              />
            ) : null}
          </ScrollView>
        </Screen>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  statusBadge: { marginLeft: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  undo: { marginLeft: spacing.md, fontSize: 11, fontWeight: '700', color: colors.red, minHeight: 44, textAlignVertical: 'center' },
  members: { marginTop: 8, marginLeft: 44, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.border },
  memberDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHover },
});
