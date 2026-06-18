import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, ApprovalBadge, EmptyState } from '../../components/ui';
import {
  useStore, getCurrentStaff, getEvent, getRsvps, validateScan, checkInGuest, staffCan,
} from '../../data/mock';

export default function StaffCheckinScreen() {
  useStore();
  const staff = getCurrentStaff();
  const event = getEvent(staff?.eventId) || getEvent('1');
  const eventRsvps = getRsvps(event.id);

  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);

  const goingApproved = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const arrived = goingApproved.filter((r) => r.checkedIn);
  const canCheckin = staffCan('checkin');

  const handleScan = (passId) => {
    if (!passId) return;
    setResult(validateScan(event.id, passId));
    setScanning(false);
  };

  const confirmArrival = (rsvp) => {
    checkInGuest(rsvp.id, `${staff?.name || 'Gate Staff'} (Staff)`);
    setResult(null);
    setManualId('');
    Alert.alert('Checked in ✓', `${rsvp.name} is marked arrived.\nA confirmation email was sent and the host dashboard is updated.`);
  };

  const toneFor = (code) => (code === 'valid' ? colors.accent : code === 'duplicate' || code === 'pending' ? colors.amber : colors.red);

  return (
    <Screen contentStyle={{ paddingBottom: 28 }}>
      <SectionTitle>Gate Check-in</SectionTitle>
      <Text style={[font.small, { marginTop: -4, marginBottom: spacing.md }]}>{event.title} · {event.date}</Text>

      {/* Live arrivals */}
      <Card style={{ marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={font.small}>Checked in</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>
            {arrived.length}<Text style={{ fontSize: 16, color: colors.textMuted }}> / {goingApproved.length}</Text>
          </Text>
        </View>
        <View style={[styles.bigIcon, { backgroundColor: colors.accentTint }]}>
          <Ionicons name="people" size={28} color={colors.accent} />
        </View>
      </Card>

      {/* Big scan CTA */}
      <Button label={scanning ? 'Scanning…' : 'Scan guest QR'} icon="qr-code-outline" onPress={() => { setScanning(true); setResult(null); }} style={{ marginBottom: spacing.lg, paddingVertical: 16 }} />

      {/* Scanner */}
      {scanning ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.viewfinder}>
            <Ionicons name="qr-code-outline" size={88} color={colors.primary} />
            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
          </View>
          <Text style={[font.small, { textAlign: 'center', marginTop: 10 }]}>Point the camera at the guest's QR pass</Text>

          <Row style={{ marginTop: spacing.md, gap: 8 }}>
            <TextInput value={manualId} onChangeText={setManualId} placeholder="…or type pass ID (e.g. r1)" placeholderTextColor={colors.textMuted} autoCapitalize="none" style={styles.input} />
            <Button label="Verify" small onPress={() => handleScan(manualId)} />
          </Row>

          <Text style={[font.tiny, { marginTop: spacing.md, marginBottom: 6, fontWeight: '700', color: colors.text }]}>
            Demo (no camera): tap a guest to simulate scanning their QR
          </Text>
          {eventRsvps.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => handleScan(r.id)} style={styles.passRow} activeOpacity={0.8}>
              <Avatar seed={r.name} size={32} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                <Text style={font.tiny}>Pass {r.id} · {r.checkedIn ? 'checked in' : 'not arrived'}</Text>
              </View>
              <Ionicons name="scan-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setScanning(false)} style={{ alignSelf: 'center', marginTop: 14 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Close scanner</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {/* Scan result — full guest details, then check in */}
      {result ? (
        <Card style={{ marginBottom: spacing.lg, borderColor: toneFor(result.code), borderWidth: 1.5 }}>
          <Row style={{ marginBottom: 12 }}>
            <Ionicons
              name={result.ok ? 'checkmark-circle' : result.code === 'duplicate' || result.code === 'pending' ? 'alert-circle' : 'close-circle'}
              size={24}
              color={toneFor(result.code)}
            />
            <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 15, color: colors.text, flex: 1 }}>{result.message}</Text>
          </Row>

          {result.rsvp ? (
            <View style={styles.detailCard}>
              <Row>
                <Avatar seed={result.rsvp.name} size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '800', fontSize: 17, color: colors.text }}>{result.rsvp.name}</Text>
                  <ApprovalBadge rsvp={result.rsvp} />
                </View>
              </Row>

              <View style={styles.detailRows}>
                <DetailRow icon="mail-outline" label="Email" value={result.rsvp.email} />
                {result.rsvp.phone ? <DetailRow icon="call-outline" label="Phone" value={result.rsvp.phone} /> : null}
                <DetailRow icon="people-outline" label="Party size" value={`${result.rsvp.guestCount || 1} attendee${(result.rsvp.guestCount || 1) > 1 ? 's' : ''}`} />
                <DetailRow icon="ticket-outline" label="Pass ID" value={result.rsvp.id} />
                <DetailRow icon="calendar-outline" label="Event" value={event.title} />
              </View>

              {Object.keys(result.rsvp.answers || {}).length > 0 ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 2 }]}>Responses</Text>
                  {Object.entries(result.rsvp.answers).map(([q, a]) => (
                    <Text key={q} style={font.tiny}><Text style={{ fontWeight: '700' }}>{q} </Text>{a}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {result.ok && canCheckin ? (
            <Button label="Mark Check-in (Arrived)" icon="checkmark-done" variant="accent" onPress={() => confirmArrival(result.rsvp)} style={{ marginTop: spacing.lg, paddingVertical: 15 }} />
          ) : null}
          {result.ok && !canCheckin ? (
            <Text style={[font.small, { marginTop: 12 }]}>Your role can view this guest but not check them in.</Text>
          ) : null}
          {!result.ok ? (
            <Button label="Scan again" variant="outline" icon="qr-code-outline" onPress={() => { setResult(null); setScanning(true); }} style={{ marginTop: spacing.lg }} />
          ) : null}
        </Card>
      ) : null}

      {/* Recent arrivals */}
      <SectionTitle>Recent arrivals</SectionTitle>
      {arrived.length === 0 ? (
        <EmptyState icon="time-outline" title="No arrivals yet" subtitle="Scanned guests appear here." />
      ) : (
        <Card padded={false} style={{ padding: 6 }}>
          {arrived.map((r) => (
            <Row key={r.id} style={{ padding: 10 }}>
              <Avatar seed={r.name} size={32} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                <Text style={font.tiny}>{r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'arrived'}</Text>
              </View>
              <Badge tone="green" dot label="Arrived" />
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Row style={{ marginTop: 8 }}>
      <Ionicons name={icon} size={15} color={colors.textMuted} style={{ width: 20 }} />
      <Text style={{ width: 78, fontSize: 12.5, color: colors.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13.5, color: colors.text }}>{value}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  bigIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { height: 184, borderRadius: radius.md, backgroundColor: '#0f0f14', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.primary },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  passRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  detailCard: { backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 14 },
  detailRows: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 },
});
