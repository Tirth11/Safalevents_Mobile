import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { colors, spacing, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, ApprovalBadge, EmptyState } from '../../components/ui';
import { useStore, getCurrentStaff, getEvent, getRsvps, checkInGuest, staffCan } from '../../data/mock';

export default function StaffGuestsScreen() {
  useStore();
  const staff = getCurrentStaff();
  const event = getEvent(staff?.eventId) || getEvent('1');
  const eventRsvps = getRsvps(event.id);
  const canEdit = staffCan('checkin') || staffCan('guests_edit');

  const confirmed = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const other = eventRsvps.filter((r) => !(r.status === 'going' && r.approvalState === 'APPROVED'));

  const renderRow = (r) => (
    <Row key={r.id} style={styles.row}>
      <Avatar seed={r.name} size={34} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
        <Text style={font.tiny}>{r.email}</Text>
        <Row style={{ marginTop: 4 }}>
          <ApprovalBadge rsvp={r} />
          {r.checkedIn && <Badge tone="green" dot label="Arrived" style={{ marginLeft: 6 }} />}
        </Row>
      </View>
      {canEdit && r.status === 'going' && r.approvalState === 'APPROVED' && !r.checkedIn && (
        <Button
          label="Check in"
          small
          variant="accent"
          onPress={() => { checkInGuest(r.id, `${staff?.name || 'Staff'} (Staff)`); Alert.alert('Checked in ✓', `${r.name} marked as arrived. Email sent to the guest.`); }}
        />
      )}
    </Row>
  );

  return (
    <Screen>
      <SectionTitle>Guests</SectionTitle>
      <Text style={[font.small, { marginTop: -6, marginBottom: spacing.md }]}>
        {event.title} · {canEdit ? 'You can check guests in' : 'Read-only (your role)'}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { padding: 8, borderTopWidth: 1, borderTopColor: colors.border },
});
