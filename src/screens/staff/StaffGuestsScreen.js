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
        <TouchableOpacity activeOpacity={0.7} onPress={() => setSelected(r)}>
          <Row>
            <Avatar seed={r.name} size={34} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>
                {r.name}{isParty ? ` · party of ${total}` : ''}
              </Text>
              <Text style={font.tiny}>{r.email}</Text>
              <Row style={{ marginTop: 4 }}>
                <ApprovalBadge rsvp={r} />
                {isConfirmed && (
                  <View style={[styles.statusBadge, { backgroundColor: ci.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: ci.color }]}>{ci.label}</Text>
                  </View>
                )}
              </Row>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Row>
        </TouchableOpacity>

        {/* Quick door controls */}
        {canCheckin && isConfirmed && (
          <Row style={{ marginTop: 8, justifyContent: 'flex-end' }}>
            {ci.state === 'full' ? (
              <Row>
                <Badge tone="green" dot label={`All ${total} in`} />
                <Text style={styles.undo} onPress={() => resetArrival(r.id)}>Undo</Text>
              </Row>
            ) : (
              <Row>
                <Button label="View details" small variant="outline" onPress={() => setSelected(r)} style={{ marginRight: 6 }} />
                <Button label="+1" small variant="accent" onPress={() => arrive(1)} />
                {remaining > 1 && <Button label={`All ${remaining}`} small style={{ marginLeft: 6 }} onPress={() => arrive(remaining)} />}
              </Row>
            )}
          </Row>
        )}

        {isConfirmed && isParty && (
          <View style={styles.members}>
            {members.map((m, i) => {
              const arrived = i < ci.inCount;
              return (
                <Row key={i} style={{ marginTop: 4 }}>
                  <View style={[styles.memberDot, { backgroundColor: arrived ? '#16a34a' : colors.border }]} />
                  <Text style={[font.tiny, { flex: 1, color: arrived ? colors.text : colors.textMuted }]}>{m}</Text>
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
      <Text style={[font.small, { marginTop: -6, marginBottom: spacing.md }]}>
        {event.title} · {canCheckin ? 'Tap a guest for full history & check-in' : 'Tap a guest to view details'}
      </Text>

      <Card padded={false} style={{ padding: 6, marginBottom: spacing.lg }}>
        <Text style={[font.tiny, { fontWeight: '700', color: colors.text, padding: 8 }]}>Confirmed attendees ({confirmed.length})</Text>
        {confirmed.length ? confirmed.map(renderRow) : <EmptyState icon="people-outline" title="No confirmed guests" />}
      </Card>

      {other.length > 0 && (
        <Card padded={false} style={{ padding: 6 }}>
          <Text style={[font.tiny, { fontWeight: '700', color: colors.text, padding: 8 }]}>Pending / waitlist / not approved</Text>
          {other.map(renderRow)}
        </Card>
      )}

      {/* ── Full guest detail sheet (history + check-in, permission-gated) ── */}
      {!!selected && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, backgroundColor: colors.bg }]}>
        <Screen scroll={false}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Text style={font.h2}>Guest Details</Text>
            <TouchableOpacity onPress={() => setSelected(null)} hitSlop={10} style={styles.close}>
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
  row: { padding: 8, borderTopWidth: 1, borderTopColor: colors.border },
  statusBadge: { marginLeft: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  undo: { marginLeft: 10, fontSize: 11, fontWeight: '700', color: colors.red },
  members: { marginTop: 8, marginLeft: 44, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.border },
  memberDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHover },
});
