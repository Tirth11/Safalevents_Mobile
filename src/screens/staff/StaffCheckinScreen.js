import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, ApprovalBadge, EmptyState } from '../../components/ui';
import {
  useStore, getCurrentStaff, getEvent, getRsvps, validateScan, checkInGuest, staffCan,
} from '../../data/mock';

const RESULT_TONE = { valid: 'green', invalid: 'red', rejected: 'red', pending: 'amber', notgoing: 'red', duplicate: 'amber' };

export default function StaffCheckinScreen({ navigation }) {
  useStore(); // live counts / arrivals update as guests are scanned in
  const staff = getCurrentStaff();
  const event = getEvent(staff?.eventId) || getEvent('1');
  const eventRsvps = getRsvps(event.id);

  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);

  const goingApproved = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const arrived = goingApproved.filter((r) => r.checkedIn);

  const handleScan = (passId) => {
    if (!passId) return;
    setResult(validateScan(event.id, passId));
  };

  const confirmArrival = (rsvp) => {
    checkInGuest(rsvp.id, `${staff?.name || 'Gate Staff'} (Staff)`);
    setResult(null);
    setManualId('');
    Alert.alert('Checked in ✓', `${rsvp.name} marked as arrived.\n\nA confirmation email was sent to ${rsvp.email}, and the host dashboard now shows them checked in.`);
  };

  return (
    <Screen>
      <SectionTitle>Gate Check-in</SectionTitle>
      <Text style={[font.small, { marginTop: -6, marginBottom: spacing.md }]}>{event.title} · {event.date}</Text>

      {/* Live arrivals */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={font.small}>Arrivals</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>
              {arrived.length}<Text style={{ fontSize: 16, color: colors.textMuted }}> / {goingApproved.length}</Text>
            </Text>
          </View>
          <View style={[styles.bigIcon, { backgroundColor: colors.accentTint }]}>
            <Ionicons name="people" size={26} color={colors.accent} />
          </View>
        </Row>
      </Card>

      {/* Scanner */}
      {!scanning ? (
        <Button label="Scan guest QR" icon="qr-code-outline" onPress={() => { setScanning(true); setResult(null); }} style={{ marginBottom: spacing.lg }} />
      ) : (
        <Card style={{ marginBottom: spacing.lg }}>
          {/* Camera viewfinder (simulated — real build would use expo-camera) */}
          <View style={styles.viewfinder}>
            <Ionicons name="qr-code-outline" size={90} color={colors.primary} />
            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
          </View>
          <Text style={[font.small, { textAlign: 'center', marginTop: 8 }]}>Point the camera at the guest's QR pass</Text>

          {/* Manual entry */}
          <Row style={{ marginTop: spacing.md, gap: 8 }}>
            <TextInput
              value={manualId}
              onChangeText={setManualId}
              placeholder="Enter pass ID (e.g. r1)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={styles.input}
            />
            <Button label="Verify" small onPress={() => handleScan(manualId)} />
          </Row>

          {/* Simulate scan by tapping a pass */}
          <Text style={[font.tiny, { marginTop: spacing.md, marginBottom: 6, fontWeight: '700', color: colors.text }]}>Or tap a pass to simulate a scan</Text>
          {eventRsvps.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => handleScan(r.id)} style={styles.passRow} activeOpacity={0.8}>
              <Avatar seed={r.name} size={30} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }}>{r.name}</Text>
                <Text style={font.tiny}>Pass {r.id} · {r.checkedIn ? 'checked in' : 'not arrived'}</Text>
              </View>
              <Ionicons name="scan-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => { setScanning(false); setResult(null); }} style={{ alignSelf: 'center', marginTop: 12 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Close scanner</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Scan result */}
      {result && (
        <Card style={{ marginBottom: spacing.lg, borderColor: result.ok ? colors.accent : colors.red, borderWidth: 1.5 }}>
          <Row style={{ marginBottom: 8 }}>
            <Ionicons
              name={result.ok ? 'checkmark-circle' : result.code === 'duplicate' || result.code === 'pending' ? 'alert-circle' : 'close-circle'}
              size={22}
              color={result.ok ? colors.accent : result.code === 'duplicate' || result.code === 'pending' ? colors.amber : colors.red}
            />
            <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 15, color: colors.text }}>{result.message}</Text>
          </Row>
          {result.rsvp && (
            <View style={{ backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 12 }}>
              <Row>
                <Avatar seed={result.rsvp.name} size={42} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: colors.text }}>{result.rsvp.name}</Text>
                  <Text style={font.small}>{result.rsvp.email}</Text>
                  <Row style={{ marginTop: 4, gap: 8 }}>
                    <ApprovalBadge rsvp={result.rsvp} />
                    <Badge tone="gray" label={`${result.rsvp.guestCount || 1} attendee${(result.rsvp.guestCount || 1) > 1 ? 's' : ''}`} />
                  </Row>
                </View>
              </Row>
              {Object.keys(result.rsvp.answers || {}).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  {Object.entries(result.rsvp.answers).map(([q, a]) => (
                    <Text key={q} style={font.tiny}><Text style={{ fontWeight: '700' }}>{q} </Text>{a}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
          {result.ok && staffCan('checkin') && (
            <Button label="Mark as Arrived" icon="checkmark-done" variant="accent" onPress={() => confirmArrival(result.rsvp)} style={{ marginTop: spacing.md }} />
          )}
          {result.ok && !staffCan('checkin') && (
            <Text style={[font.small, { marginTop: 10 }]}>Your role can view this guest but not check them in.</Text>
          )}
        </Card>
      )}

      {/* Recent arrivals */}
      <SectionTitle>Recent arrivals</SectionTitle>
      {arrived.length === 0 ? (
        <EmptyState icon="time-outline" title="No arrivals yet" subtitle="Scanned guests will appear here." />
      ) : (
        <Card padded={false} style={{ padding: 6 }}>
          {arrived.map((r) => (
            <Row key={r.id} style={{ padding: 8 }}>
              <Avatar seed={r.name} size={30} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }}>{r.name}</Text>
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

const styles = StyleSheet.create({
  bigIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { height: 180, borderRadius: radius.md, backgroundColor: '#0f0f14', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.primary },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  passRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
});
