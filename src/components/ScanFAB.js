// Floating "Scan QR" action button for the HOST experience — mirrors the web
// app's QRScanFAB. Tapping it opens a full-screen Smart Check-In Scanner that
// lets the host pick an event, simulate scanning a guest (demo, no camera),
// and view the complete post-scan guest detail panel + partial check-in.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';
import { Card, Button, Avatar, Row, Badge } from './ui';
import GuestCheckinDetail from './GuestCheckinDetail';
import { useStore, events, getEvent, getRsvps, validateScan, getCheckinState } from '../data/mock';

export default function ScanFAB() {
  useStore(); // re-render when check-ins mutate live
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState(events[0]?.id);
  const [passInput, setPassInput] = useState('');
  const [result, setResult] = useState(null);

  const reset = () => {
    setResult(null);
    setPassInput('');
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const pickEvent = (id) => {
    setEventId(id);
    reset();
  };

  const verifyManual = () => {
    if (!passInput.trim()) return;
    setResult(validateScan(eventId, passInput.trim()));
  };

  const rsvps = getRsvps(eventId);
  const event = getEvent(eventId);

  return (
    <>
      {/* ── Floating action button ── */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpen(true)}
        style={styles.fab}
      >
        <Ionicons name="qr-code-outline" size={20} color="#fff" />
        <Text style={styles.fabLabel}>Scan QR</Text>
      </TouchableOpacity>

      {/* ── Full-screen scanner modal ── */}
      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={styles.screen}>
          {/* Header */}
          <Row style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={font.h2}>Smart Check-In Scanner</Text>
              <Text style={font.small}>Scan a guest pass to verify entry</Text>
            </View>
            <TouchableOpacity onPress={close} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Row>

          <ScrollView
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 48, gap: spacing.md }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Event picker */}
            <View>
              <Text style={styles.kicker}>EVENT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {events.map((e) => {
                  const on = e.id === eventId;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => pickEvent(e.id)}
                      activeOpacity={0.85}
                      style={[styles.chip, on && styles.chipActive]}
                    >
                      <Text
                        numberOfLines={1}
                        style={{ maxWidth: 200, color: on ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5, fontFamily: 'Inter_700Bold' }}
                      >
                        {e.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {result ? (
              // ── Result view ──
              result.rsvp ? (
                <>
                  <GuestCheckinDetail
                    rsvp={result.rsvp}
                    event={event}
                    result={result}
                    scannerName="Host"
                    canCheckin
                    canViewHistory
                  />
                  <Button label="Scan another" icon="scan-outline" variant="outline" onPress={reset} />
                </>
              ) : (
                <Card style={styles.errorCard}>
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Ionicons name="alert-circle" size={20} color={colors.red} />
                    <Text style={{ flex: 1, marginLeft: 8, fontWeight: '700', color: colors.red, fontSize: 13.5 }}>
                      {result.message || 'Invalid pass.'}
                    </Text>
                  </Row>
                  <Button label="Try again" icon="refresh" variant="outline" small style={{ marginTop: spacing.md }} onPress={reset} />
                </Card>
              )
            ) : (
              // ── Scan capture view ──
              <>
                {/* Viewfinder */}
                <View style={styles.viewfinder}>
                  <View style={[styles.corner, styles.tl]} />
                  <View style={[styles.corner, styles.tr]} />
                  <View style={[styles.corner, styles.bl]} />
                  <View style={[styles.corner, styles.br]} />
                  <Ionicons name="qr-code-outline" size={64} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.viewfinderHint}>Demo (no camera): tap a guest to simulate scanning</Text>
                </View>

                {/* Manual entry */}
                <Card>
                  <Text style={styles.kicker}>MANUAL PASS ENTRY</Text>
                  <Row style={{ gap: 8 }}>
                    <TextInput
                      value={passInput}
                      onChangeText={setPassInput}
                      placeholder="Enter pass ID"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                      style={styles.input}
                      onSubmitEditing={verifyManual}
                    />
                    <Button label="Verify" icon="checkmark" small onPress={verifyManual} />
                  </Row>
                </Card>

                {/* Demo guest list */}
                <Card>
                  <Text style={styles.kicker}>DEMO GUESTS ({rsvps.length})</Text>
                  <View style={{ gap: 8 }}>
                    {rsvps.length === 0 ? (
                      <Text style={font.small}>No RSVPs for this event yet.</Text>
                    ) : (
                      rsvps.map((r) => {
                        const st = getCheckinState(r);
                        return (
                          <TouchableOpacity
                            key={r.id}
                            activeOpacity={0.8}
                            onPress={() => setResult(validateScan(eventId, r.id))}
                            style={styles.guestRow}
                          >
                            <Avatar seed={r.name} size={40} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>
                                {r.name}
                              </Text>
                              <Text style={font.tiny}>Pass {r.id} · {st.label}</Text>
                            </View>
                            <Ionicons name="scan-outline" size={20} color={colors.primary} />
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </Card>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabLabel: { color: '#fff', fontWeight: '800', fontSize: 14, marginLeft: 8, fontFamily: 'Inter_800ExtraBold' },

  screen: { flex: 1, backgroundColor: colors.bg, paddingTop: 52 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  closeBtn: { padding: 4 },

  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, color: colors.textMuted, marginBottom: 10 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },

  viewfinder: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#0f1115',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  viewfinderHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginTop: 14, paddingHorizontal: 24 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.amber },
  tl: { top: 22, left: 22, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  tr: { top: 22, right: 22, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  bl: { bottom: 22, left: 22, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  br: { bottom: 22, right: 22, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },

  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },

  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    padding: 10,
  },

  errorCard: { borderColor: colors.red, backgroundColor: colors.redTint },
});
