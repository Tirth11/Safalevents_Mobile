import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { Screen, Card, Badge, Button, SectionTitle, Avatar, Row, Divider, EmptyState, Tabs } from '../../components/ui';
import { MOCK_GUESTS, getTrustBadge, getPatternBadge, getEventStatus, getPartyMembers, useStore, getCurrentHost, hostFullyVerified, events, rsvps } from '../../data/mock';
import { VerificationGate } from '../../components/ui';

// ─── Trust Score Bar ─────────────────────────────────────────────────────────
function TrustBar({ score, color }) {
  return (
    <View style={{ width: 72, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${score}%`, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

// ─── Section Label (small heading with icon) ─────────────────────────────────
function SectionLabel({ icon, children }) {
  return (
    <Row style={{ marginBottom: 10 }}>
      <Ionicons name={icon} size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>{children}</Text>
    </Row>
  );
}

// ─── Stat Mini Card ──────────────────────────────────────────────────────────
function StatMini({ label, value, icon, color }) {
  return (
    <View style={[s.statMini, shadow]}>
      <View style={[s.iconTile, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 6 }}>{value}</Text>
      <Text style={font.small}>{label}</Text>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function HostGuestsScreen({ navigation }) {
  useStore();
  const host = getCurrentHost();

  // Verification gate for org hosts
  if (!hostFullyVerified(host)) {
    return <VerificationGate onUpload={() => navigation.navigate('Account')} />;
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReliability, setFilterReliability] = useState('All');
  const [filterPattern, setFilterPattern] = useState('All');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [historyModal, setHistoryModal] = useState(null); // null | 'rsvp' | 'checkin'
  const [notesMap, setNotesMap] = useState({});
  const [showCheckinPanel, setShowCheckinPanel] = useState(false);
  const [checkinState, setCheckinState] = useState({});
  const [arrivingNow, setArrivingNow] = useState(1);

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: MOCK_GUESTS.length,
    highTrust: MOCK_GUESTS.filter((g) => g.trustScore >= 70).length,
    atRisk: MOCK_GUESTS.filter((g) => g.trustScore < 50).length,
    reminded: MOCK_GUESTS.filter((g) => g.remindersSent > 0).length,
  }), []);

  const filteredGuests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return MOCK_GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q) && !g.email.toLowerCase().includes(q) && !g.phone.includes(q)) return false;
      if (filterReliability !== 'All' && getTrustBadge(g.trustScore).text !== filterReliability) return false;
      if (filterPattern !== 'All') {
        const match =
          (filterPattern === 'Consistent' && g.pattern === 'Consistent Attendee') ||
          (filterPattern === 'Partial' && (g.pattern === 'Partial Attendance' || g.pattern === 'Frequent Partial Attendance')) ||
          (filterPattern === 'NoShow' && g.pattern === 'Frequent No-Show') ||
          (filterPattern === 'OverRsvp' && g.pattern === 'Over-RSVP Pattern');
        if (!match) return false;
      }
      if (selectedEvents.length > 0) {
        let matchesSelectedEvent = false;
        for (const evtId of selectedEvents) {
          // Check if guest has RSVP in this event
          const eventRsvpsList = rsvps.filter(r => r.eventId === evtId && r.status === 'going');
          if (eventRsvpsList.some(r => r.email.toLowerCase() === g.email.toLowerCase())) {
            matchesSelectedEvent = true;
            break;
          }
          // Also check fuzzy history
          const targetEvt = events.find(e => e.id === evtId);
          if (targetEvt && g.history) {
            const titleNorm = targetEvt.title.toLowerCase();
            if (g.history.some(h => {
              const histNorm = h.event.toLowerCase();
              return titleNorm.includes(histNorm) || histNorm.includes(titleNorm);
            })) {
              matchesSelectedEvent = true;
              break;
            }
          }
        }
        if (!matchesSelectedEvent) return false;
      }
      return true;
    });
  }, [searchTerm, filterReliability, filterPattern, selectedEvents]);

  const hasActiveFilters = searchTerm || filterReliability !== 'All' || filterPattern !== 'All' || selectedEvents.length > 0;
  const resetFilters = () => { setSearchTerm(''); setFilterReliability('All'); setFilterPattern('All'); setSelectedEvents([]); };

  // ── Guest intelligence (derived from selectedGuest) ────────────────────────
  const insight = useMemo(() => {
    if (!selectedGuest) return null;
    const g = selectedGuest;
    const evCount = g.history.length || 1;
    const accuracy = Math.round((g.actualAttendees / (g.totalAttendees || 1)) * 100);
    const noShows = g.history.filter((h) => h.actual === 0).length;
    const partials = g.history.filter((h) => h.actual > 0 && h.actual < h.rsvpCount).length;
    const isReliable = g.trustScore >= 70;
    const isRisky = g.trustScore < 50 || g.pattern === 'Over-RSVP Pattern';
    const lastAttended = [...g.history].reverse().find((h) => h.actual > 0)?.event || '—';
    return {
      accuracy,
      avgRsvp: (g.totalAttendees / evCount).toFixed(1),
      avgActual: (g.actualAttendees / evCount).toFixed(1),
      noShows,
      partials,
      isReliable,
      isRisky,
      lastAttended,
      overRsvpEvents: g.history.filter((h) => h.rsvpCount - h.actual >= 3).length,
    };
  }, [selectedGuest]);

  const guestNotes = selectedGuest ? (notesMap[selectedGuest.id] ?? selectedGuest.notes) : '';

  // ── Trust filter chip options ──────────────────────────────────────────────
  const trustChipOptions = [
    { key: 'All', label: 'All' },
    { key: 'Excellent', label: 'Excellent' },
    { key: 'Good', label: 'Good' },
    { key: 'Moderate', label: 'Moderate' },
    { key: 'High Risk', label: 'High Risk' },
  ];
  const patternChipOptions = [
    { key: 'All', label: 'All' },
    { key: 'Consistent', label: 'Consistent' },
    { key: 'Partial', label: 'Partial' },
    { key: 'NoShow', label: 'No-Show' },
    { key: 'OverRsvp', label: 'Over-RSVP' },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: GUEST DETAIL MODAL (full-screen overlay)
  // ══════════════════════════════════════════════════════════════════════════
  const renderDetailModal = () => {
    if (!selectedGuest || !insight) return null;

    const g = selectedGuest;
    const trust = getTrustBadge(g.trustScore);
    const pattern = getPatternBadge(g.pattern);

    return (
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* ── Header ── */}
          <View style={s.modalHeader}>
            <Row style={{ flex: 1 }}>
              <Avatar seed={g.name} size={50} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={font.h2}>{g.name}</Text>
                <Text style={[font.small, { marginTop: 2 }]}>{g.email}</Text>
              </View>
            </Row>
            <TouchableOpacity
              onPress={() => { setSelectedGuest(null); setShowCheckinPanel(false); setCheckinState({}); setHistoryModal(null); }}
              style={s.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── Body ── */}
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

            {/* ─── Verdict Banner ─── */}
            {insight.isReliable ? (
              <View style={[s.verdictBanner, { backgroundColor: '#16a34a' }]}>
                <Row style={{ marginBottom: 6 }}>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, marginLeft: 8 }}>Reliable Guest</Text>
                </Row>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 28 }}>
                  {insight.accuracy}% <Text style={{ fontSize: 14, fontWeight: '600', opacity: 0.9 }}>attendance accuracy</Text>
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: 6 }}>
                  Consistent attendance across {g.eventsRsvpd} events.
                </Text>
              </View>
            ) : insight.isRisky ? (
              <View style={[s.verdictBanner, { backgroundColor: '#dc2626' }]}>
                <Row style={{ marginBottom: 10 }}>
                  <Ionicons name="alert-circle" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, marginLeft: 8 }}>
                    {g.pattern === 'Over-RSVP Pattern' ? 'Over-RSVP Pattern Detected' : 'High No-Show Risk'}
                  </Text>
                </Row>
                <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>{g.totalAttendees}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 3 }}>Seats reserved</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>{g.actualAttendees}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 3 }}>Actual attended</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>{insight.accuracy}%</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 3 }}>Accuracy</Text>
                  </View>
                </Row>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Food & capacity planning risk</Text>
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: '#eab30815', borderWidth: 1, borderColor: '#eab30840', borderLeftWidth: 4, borderLeftColor: '#eab308', borderRadius: 12, padding: 16, marginBottom: spacing.lg }}>
                <Row style={{ marginBottom: 4 }}>
                  <Ionicons name="alert-circle" size={17} color="#a16207" />
                  <Text style={{ fontWeight: '800', fontSize: 15, color: '#a16207', marginLeft: 8 }}>Partial Attendance</Text>
                </Row>
                <Text style={{ fontSize: 13, color: colors.text }}>
                  {insight.accuracy}% accuracy across {g.eventsRsvpd} events — monitor future RSVPs.
                </Text>
              </View>
            )}

            {/* ─── Summary Grid ─── */}
            <View style={{ marginTop: spacing.lg }}>
              <SectionLabel icon="trending-up-outline">Summary</SectionLabel>
              <View style={s.gridTwoCol}>
                {[
                  { label: "Events RSVP'd", value: g.eventsRsvpd },
                  { label: 'Trust Score', value: `${g.trustScore}%`, color: trust.color },
                  { label: "Total Attendees RSVP'd", value: g.totalAttendees },
                  { label: 'Actual Check-ins', value: g.actualAttendees },
                ].map((item, i) => (
                  <View key={i} style={s.summaryTile}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, marginBottom: 6 }}>{item.label}</Text>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: item.color || colors.text }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ─── Behavior Insights ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="pulse-outline">Behavior Insights</SectionLabel>
              <View style={s.gridTwoCol}>
                {[
                  { label: 'Attendance Accuracy', value: `${insight.accuracy}%`, color: trust.color },
                  { label: 'Avg RSVP / Event', value: insight.avgRsvp },
                  { label: 'Avg Actual Attendance', value: insight.avgActual },
                  g.pattern === 'Over-RSVP Pattern'
                    ? { label: 'Repeated Over-RSVP', value: `${insight.overRsvpEvents} events`, color: '#ef4444' }
                    : { label: 'Last Attended', value: insight.lastAttended },
                ].map((item, i) => (
                  <View key={i} style={s.insightTile}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, marginBottom: 5 }}>{item.label}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: item.color || colors.text }}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <Row style={{ marginTop: 8 }}>
                <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 5 }}>
                  First RSVP: <Text style={{ fontWeight: '700', color: colors.text }}>{g.firstRsvp}</Text>
                </Text>
              </Row>
            </View>

            {/* ─── Attendance History Table ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="time-outline">Attendance History</SectionLabel>
              <View style={s.tableContainer}>
                {/* Table header */}
                <View style={[s.tableRow, { backgroundColor: colors.surfaceHover, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <Text style={[s.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Event</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>RSVP</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>Actual</Text>
                  <Text style={[s.tableHeaderCell, { flex: 0.6 }]}>{'Δ'}</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.4, textAlign: 'right' }]}>Status</Text>
                </View>
                {/* Table body */}
                {g.history.map((h, i) => {
                  const diff = h.actual - h.rsvpCount;
                  const st = getEventStatus(h.rsvpCount, h.actual);
                  return (
                    <View key={i} style={[s.tableRow, i < g.history.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                      <Text style={[s.tableCell, { flex: 2, textAlign: 'left', fontWeight: '600' }]} numberOfLines={1}>{h.event}</Text>
                      <Text style={[s.tableCell, { flex: 1 }]}>{h.rsvpCount}</Text>
                      <Text style={[s.tableCell, { flex: 1 }]}>{h.actual}</Text>
                      <Text style={[s.tableCell, { flex: 0.6, fontWeight: '700', color: diff < 0 ? '#ef4444' : diff > 0 ? '#16a34a' : colors.textMuted }]}>
                        {diff === 0 ? '—' : diff}
                      </Text>
                      <View style={{ flex: 1.4, alignItems: 'flex-end', paddingVertical: 10, paddingHorizontal: 6 }}>
                        <View style={{ backgroundColor: st.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: st.color }}>{st.icon} {st.label}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ─── Recent Activity Timeline ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="calendar-outline">Recent Activity</SectionLabel>
              <View style={{ paddingLeft: 20 }}>
                {/* Vertical line */}
                <View style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, backgroundColor: colors.border }} />
                {g.history.map((h, i) => {
                  const st = getEventStatus(h.rsvpCount, h.actual);
                  return (
                    <View key={i} style={{ paddingBottom: i < g.history.length - 1 ? 16 : 0, position: 'relative' }}>
                      {/* Dot */}
                      <View style={{ position: 'absolute', left: -19, top: 3, width: 12, height: 12, borderRadius: 6, backgroundColor: st.color, borderWidth: 2, borderColor: colors.surface }} />
                      <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>{h.date}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{h.event}</Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        RSVP {h.rsvpCount} {'·'} {h.actual === 0 ? (
                          <Text style={{ color: '#ef4444', fontWeight: '700' }}>No Show</Text>
                        ) : (
                          <Text>Checked In {h.actual}</Text>
                        )}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ─── Communication History ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="mail-outline">Communication History</SectionLabel>
              {g.communications.length === 0 ? (
                <View style={{ backgroundColor: colors.surfaceHover, borderRadius: 10, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>No reminders or messages sent yet.</Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {g.communications.map((c, i) => {
                    const delivered = c.status === 'Delivered';
                    const opened = c.status === 'Opened';
                    const stColor = opened ? '#16a34a' : delivered ? colors.primary : '#ef4444';
                    const iconName = c.type.includes('SMS') ? 'chatbox-outline' : c.type.includes('Email') || c.type.includes('Reminder') ? 'mail-outline' : 'notifications-outline';
                    return (
                      <View key={i} style={s.commItem}>
                        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surfaceHover, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name={iconName} size={15} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{c.type}</Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>{c.date}</Text>
                        </View>
                        <View style={{ backgroundColor: stColor + '1F', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.full }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: stColor }}>{c.status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ─── Attendance Analysis (non-reliable only) ─── */}
            {!insight.isReliable && (
              <View style={{ marginTop: spacing.xl }}>
                <SectionLabel icon="alert-circle-outline">Attendance Analysis</SectionLabel>
                <View style={{ backgroundColor: '#ef44440a', borderWidth: 1, borderColor: '#ef444425', borderRadius: 12, padding: 16 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {[
                      { label: 'RSVP Seats Reserved', value: g.totalAttendees },
                      { label: 'Actual Attendance', value: g.actualAttendees },
                      { label: 'Accuracy', value: `${insight.accuracy}%`, color: trust.color },
                      { label: 'No Shows', value: insight.noShows },
                      { label: 'Partial Events', value: insight.partials },
                      { label: 'Reminders Sent', value: g.remindersSent },
                    ].map((item, i) => (
                      <View key={i} style={{ width: '33.33%', paddingVertical: 8 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: item.color || colors.text }}>{item.value}</Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 4 }}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ─── Host Notes ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="document-text-outline">Host Notes</SectionLabel>
              <TextInput
                value={guestNotes}
                onChangeText={(text) => setNotesMap((prev) => ({ ...prev, [g.id]: text }))}
                placeholder="Add a private note about this guest — RSVP habits, preferences, things to watch..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={s.notesInput}
              />
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>Notes are private to your team.</Text>
            </View>

            {/* ─── Quick Actions ─── */}
            <View style={{ marginTop: spacing.xl }}>
              <SectionLabel icon="flash-outline">Quick Actions</SectionLabel>
              <View style={{ gap: 8 }}>
                {[
                  { icon: 'qr-code-outline', label: showCheckinPanel ? 'Hide Check-In Panel' : 'Check-In Scanner', highlight: true, onPress: () => { setShowCheckinPanel(!showCheckinPanel); setCheckinState({}); setArrivingNow(1); } },
                  { icon: 'notifications-outline', label: 'Send Reminder', onPress: () => Alert.alert('Send Reminder', `Reminder sent to ${g.name}.`) },
                  { icon: 'chatbox-outline', label: 'Send Message', onPress: () => Alert.alert('Send Message', `Opening message composer for ${g.name}.`) },
                  { icon: 'document-text-outline', label: 'View RSVP History', onPress: () => setHistoryModal('rsvp') },
                  { icon: 'people-outline', label: 'View Check-In History', onPress: () => setHistoryModal('checkin') },
                ].map((action, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={action.onPress}
                    activeOpacity={0.85}
                    style={[s.actionBtn, action.highlight && { borderColor: colors.primary, backgroundColor: colors.primaryTint }]}
                  >
                    <Ionicons name={action.icon} size={15} color={colors.primary} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 12 }}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── Check-In Panel ─── */}
            {showCheckinPanel && (
              <View style={{ marginTop: spacing.xl }}>
                <SectionLabel icon="qr-code-outline">Event Check-In</SectionLabel>
                <View style={{ gap: 14 }}>
                  {g.history.map((h, idx) => {
                    const total = h.rsvpCount;
                    const checked = checkinState[idx] != null ? checkinState[idx] : h.actual;
                    const remaining = total - checked;
                    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                    const members = getPartyMembers(g.name, total);
                    const evSt = checked >= total
                      ? { label: 'All Checked In', color: '#16a34a', bg: '#16a34a1F' }
                      : checked > 0
                      ? { label: `${checked}/${total} Arrived`, color: '#d97706', bg: '#d976061F' }
                      : { label: 'Not Checked In', color: colors.textMuted, bg: colors.surfaceHover };

                    return (
                      <Card key={idx}>
                        {/* Event header */}
                        <View style={[s.between, { marginBottom: 12 }]}>
                          <View style={{ flex: 1, marginRight: spacing.sm }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{h.event}</Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{h.date}</Text>
                          </View>
                          <View style={{ backgroundColor: evSt.bg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: evSt.color }}>{evSt.label}</Text>
                          </View>
                        </View>

                        {/* Progress bar */}
                        <View style={{ marginBottom: 12 }}>
                          <View style={[s.between, { marginBottom: 5 }]}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{checked} of {total} attendees</Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{pct}%</Text>
                          </View>
                          <View style={{ height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${pct}%`, backgroundColor: checked >= total ? '#16a34a' : colors.primary, borderRadius: 4 }} />
                          </View>
                        </View>

                        {/* Party members */}
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.4, marginBottom: 8 }}>PARTY MEMBERS</Text>
                          <View style={{ gap: 6 }}>
                            {members.map((m, mi) => {
                              const isIn = mi < checked;
                              return (
                                <View key={mi} style={[s.memberRow, { backgroundColor: isIn ? '#16a34a08' : colors.surfaceHover, borderColor: isIn ? '#16a34a25' : colors.border }]}>
                                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isIn ? '#16a34a18' : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name={isIn ? 'checkmark-circle' : 'people-outline'} size={14} color={isIn ? '#16a34a' : colors.textMuted} />
                                  </View>
                                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: isIn ? colors.text : colors.textMuted, marginLeft: 10 }}>{m}</Text>
                                  <Text style={{ fontSize: 10, fontWeight: '700', color: isIn ? '#16a34a' : colors.textMuted }}>{isIn ? 'IN' : 'PENDING'}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>

                        {/* Check-in controls */}
                        {remaining > 0 ? (
                          <View style={{ backgroundColor: colors.surfaceHover, borderRadius: 10, padding: 12 }}>
                            <Row style={{ flexWrap: 'wrap', gap: 10 }}>
                              {/* Stepper */}
                              <View style={s.stepper}>
                                <TouchableOpacity onPress={() => setArrivingNow(Math.max(1, arrivingNow - 1))} style={s.stepperBtn}>
                                  <Ionicons name="remove" size={14} color={colors.text} />
                                </TouchableOpacity>
                                <Text style={{ minWidth: 28, textAlign: 'center', fontWeight: '800', fontSize: 15 }}>{Math.min(arrivingNow, remaining)}</Text>
                                <TouchableOpacity onPress={() => setArrivingNow(Math.min(remaining, arrivingNow + 1))} style={s.stepperBtn}>
                                  <Ionicons name="add" size={14} color={colors.text} />
                                </TouchableOpacity>
                              </View>
                              {/* Check In button */}
                              <TouchableOpacity
                                onPress={() => { setCheckinState((prev) => ({ ...prev, [idx]: checked + Math.min(arrivingNow, remaining) })); setArrivingNow(1); }}
                                style={[s.checkInBtn, { flex: 1, minWidth: 120 }]}
                              >
                                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Check In {Math.min(arrivingNow, remaining)}</Text>
                              </TouchableOpacity>
                              {/* All N button */}
                              {remaining > 1 && (
                                <TouchableOpacity
                                  onPress={() => setCheckinState((prev) => ({ ...prev, [idx]: total }))}
                                  style={s.allBtn}
                                >
                                  <Text style={{ fontWeight: '700', fontSize: 12, color: colors.text }}>All {remaining}</Text>
                                </TouchableOpacity>
                              )}
                            </Row>
                          </View>
                        ) : (
                          <View style={{ backgroundColor: '#16a34a0a', borderWidth: 1, borderColor: '#16a34a25', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                            <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13, marginLeft: 8 }}>All {total} attendees checked in</Text>
                          </View>
                        )}
                      </Card>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ─── RSVP History Sub-Modal ─── */}
            {historyModal === 'rsvp' && renderRsvpHistoryModal()}

            {/* ─── Check-In History Sub-Modal ─── */}
            {historyModal === 'checkin' && renderCheckinHistoryModal()}

          </ScrollView>
        </View>
      </View>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: RSVP HISTORY SUB-MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const renderRsvpHistoryModal = () => {
    if (!selectedGuest) return null;
    const g = selectedGuest;
    return (
      <View style={{ marginTop: spacing.xl }}>
        <View style={[s.between, { marginBottom: spacing.md }]}>
          <Text style={font.h3}>Full RSVP History</Text>
          <TouchableOpacity onPress={() => setHistoryModal(null)}>
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={s.tableContainer}>
          <View style={[s.tableRow, { backgroundColor: colors.surfaceHover, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[s.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Event</Text>
            <Text style={[s.tableHeaderCell, { flex: 1.5 }]}>RSVP Date</Text>
            <Text style={[s.tableHeaderCell, { flex: 1 }]}>RSVP Count</Text>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Status</Text>
          </View>
          {g.history.map((h, i) => (
            <View key={i} style={[s.tableRow, i < g.history.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[s.tableCell, { flex: 2, textAlign: 'left', fontWeight: '600' }]} numberOfLines={1}>{h.event}</Text>
              <Text style={[s.tableCell, { flex: 1.5, color: colors.textMuted }]}>{h.rsvpDate}</Text>
              <Text style={[s.tableCell, { flex: 1, fontWeight: '700' }]}>{h.rsvpCount}</Text>
              <View style={{ flex: 1, alignItems: 'flex-end', paddingVertical: 10, paddingHorizontal: 6 }}>
                <View style={{ backgroundColor: colors.primaryTint, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.full }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>Confirmed</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: colors.surfaceHover, borderRadius: 10, padding: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
            Each RSVP record tracks: <Text style={{ fontWeight: '700', color: colors.text }}>initial RSVP count</Text>, <Text style={{ fontWeight: '700', color: colors.text }}>updated count</Text>, full <Text style={{ fontWeight: '700', color: colors.text }}>modification history</Text>, event type, and the event organizer.
          </Text>
        </View>
      </View>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: CHECK-IN HISTORY SUB-MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const renderCheckinHistoryModal = () => {
    if (!selectedGuest || !insight) return null;
    const g = selectedGuest;
    const trust = getTrustBadge(g.trustScore);
    return (
      <View style={{ marginTop: spacing.xl }}>
        <View style={[s.between, { marginBottom: spacing.md }]}>
          <Text style={font.h3}>Check-In History</Text>
          <TouchableOpacity onPress={() => setHistoryModal(null)}>
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={s.tableContainer}>
          <View style={[s.tableRow, { backgroundColor: colors.surfaceHover, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[s.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Event</Text>
            <Text style={[s.tableHeaderCell, { flex: 1 }]}>RSVP</Text>
            <Text style={[s.tableHeaderCell, { flex: 1 }]}>Checked-In</Text>
            <Text style={[s.tableHeaderCell, { flex: 1 }]}>Attendance %</Text>
          </View>
          {g.history.map((h, i) => {
            const pct = Math.round((h.actual / (h.rsvpCount || 1)) * 100);
            const pc = pct >= 80 ? '#16a34a' : pct >= 40 ? '#eab308' : '#ef4444';
            return (
              <View key={i} style={[s.tableRow, i < g.history.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[s.tableCell, { flex: 2, textAlign: 'left', fontWeight: '600' }]} numberOfLines={1}>{h.event}</Text>
                <Text style={[s.tableCell, { flex: 1 }]}>{h.rsvpCount}</Text>
                <Text style={[s.tableCell, { flex: 1, fontWeight: '700' }]}>{h.actual}</Text>
                <Text style={[s.tableCell, { flex: 1, fontWeight: '800', color: pc }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>
        {/* Summary stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Lifetime Accuracy', value: `${insight.accuracy}%`, color: trust.color },
            { label: 'Total RSVP Seats', value: g.totalAttendees },
            { label: 'Total Attended', value: g.actualAttendees },
          ].map((item, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: colors.surfaceHover, borderRadius: 10, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: item.color || colors.text }}>{item.value}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 5 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: MAIN SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Screen scroll={false} style={{ padding: 0 }} contentStyle={{ padding: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* ── Header ── */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={font.h1}>Guest Directory</Text>
        <Text style={[font.small, { marginTop: 4, lineHeight: 18 }]}>
          Audience intelligence {'—'} track habits, reliability, and engagement.
        </Text>
      </View>

      {/* ── Summary Stats (2x2 grid) ── */}
      <View style={{ marginBottom: spacing.lg }}>
        <Row style={{ marginBottom: spacing.md }}>
          <StatMini label="Total Guests" value={stats.total} icon="people-outline" color={colors.primary} />
          <View style={{ width: spacing.md }} />
          <StatMini label="High Trust" value={stats.highTrust} icon="checkmark-circle-outline" color="#16a34a" />
        </Row>
        <Row>
          <StatMini label="At-Risk" value={stats.atRisk} icon="alert-circle-outline" color="#ef4444" />
          <View style={{ width: spacing.md }} />
          <StatMini label="Reminded" value={stats.reminded} icon="notifications-outline" color="#eab308" />
        </Row>
      </View>

      {/* ── Search Bar ── */}
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by name, email, phone…"
          placeholderTextColor={colors.textMuted}
          style={s.searchInput}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter Chips: Trust ── */}
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 6 }}>Trust Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            {trustChipOptions.map((opt) => {
              const isActive = filterReliability === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setFilterReliability(opt.key)}
                  activeOpacity={0.85}
                  style={[s.chip, isActive && s.chipActive]}
                >
                  <Text style={{ color: isActive ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5 }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Filter Chips: Pattern ── */}
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 6 }}>Pattern</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            {patternChipOptions.map((opt) => {
              const isActive = filterPattern === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setFilterPattern(opt.key)}
                  activeOpacity={0.85}
                  style={[s.chip, isActive && s.chipActive]}
                >
                  <Text style={{ color: isActive ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5 }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Filter Chips: Events ── */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 6 }}>Events (Multi-select)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            {events.map((evt) => {
              const isSelected = selectedEvents.includes(evt.id);
              return (
                <TouchableOpacity
                  key={evt.id}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedEvents(selectedEvents.filter(id => id !== evt.id));
                    } else {
                      setSelectedEvents([...selectedEvents, evt.id]);
                    }
                  }}
                  activeOpacity={0.85}
                  style={[s.chip, isSelected && s.chipActive]}
                >
                  <Text style={{ color: isSelected ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 12.5 }}>{evt.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Filter status row ── */}
      <Row style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }}>
          {filteredGuests.length} of {MOCK_GUESTS.length} guests
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters} style={{ marginLeft: spacing.sm }}>
            <Badge tone="primary" label="Reset Filters" />
          </TouchableOpacity>
        )}
      </Row>

      {/* ── Guest List ── */}
      {filteredGuests.length === 0 ? (
        <EmptyState icon="people-outline" title="No guests match your filters" subtitle="Try adjusting your search or filter criteria." />
      ) : (
        <View style={{ gap: 12 }}>
          {filteredGuests.map((guest) => {
            const trust = getTrustBadge(guest.trustScore);
            const pattern = getPatternBadge(guest.pattern);
            return (
              <Card key={guest.id}>
                {/* Top row: Avatar + Name + Reminder badge */}
                <Row style={{ marginBottom: spacing.sm }}>
                  <Avatar seed={guest.name} size={44} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Row>
                      <Text style={[font.h3, { flex: 1 }]} numberOfLines={1}>{guest.name}</Text>
                      {guest.remindersSent > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eab30822', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, marginLeft: 6 }}>
                          <Ionicons name="notifications" size={10} color="#eab308" />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#eab308', marginLeft: 3 }}>{guest.remindersSent}</Text>
                        </View>
                      )}
                    </Row>
                    <Text style={[font.small, { marginTop: 2 }]}>{guest.email}</Text>
                    <Text style={[font.tiny, { marginTop: 1 }]}>{guest.phone}</Text>
                  </View>
                </Row>

                {/* Events count */}
                <Row style={{ marginBottom: spacing.sm }}>
                  <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 }}>{guest.eventsRsvpd} events</Text>
                </Row>

                {/* Trust Score row */}
                <View style={{ marginBottom: spacing.sm }}>
                  <Row style={{ gap: 8 }}>
                    <TrustBar score={guest.trustScore} color={trust.color} />
                    <Text style={{ fontWeight: '800', fontSize: 14, color: trust.color }}>{guest.trustScore}%</Text>
                    <View style={{ backgroundColor: trust.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: trust.color, marginRight: 4 }} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: trust.color }}>{trust.text}</Text>
                    </View>
                  </Row>
                </View>

                {/* Pattern badge */}
                <Row style={[s.between, { marginTop: 4 }]}>
                  <View style={{ backgroundColor: pattern.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: pattern.color, marginRight: 5 }} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: pattern.color }}>{guest.pattern}</Text>
                  </View>
                  {/* View button */}
                  <Button
                    label="View"
                    variant="outline"
                    icon="eye-outline"
                    small
                    onPress={() => {
                      setSelectedGuest(guest);
                      setShowCheckinPanel(false);
                      setCheckinState({});
                      setArrivingNow(1);
                      setHistoryModal(null);
                    }}
                    style={{ paddingHorizontal: 14, paddingVertical: 7, minHeight: 0 }}
                  />
                </Row>
              </Card>
            );
          })}
        </View>
      )}
      </ScrollView>

      {/* ── Guest Detail Modal ── */}
      {renderDetailModal()}
    </Screen>
  );
}

// =============================================================================
// STYLES
// =============================================================================
const s = StyleSheet.create({
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statMini: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
    fontFamily: 'Inter_400Regular',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // ── Modal ──
  modalOverlay: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Verdict banner ──
  verdictBanner: {
    borderRadius: 14,
    padding: 18,
    marginBottom: spacing.lg,
  },
  // ── Grids ──
  gridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    width: '47%',
    backgroundColor: colors.surfaceHover,
    borderRadius: 10,
    padding: 14,
  },
  insightTile: {
    width: '47%',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  // ── Table ──
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderCell: {
    paddingVertical: 9,
    paddingHorizontal: 6,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  // ── Communication item ──
  commItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
  },
  // ── Notes input ──
  notesInput: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  // ── Action button ──
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  // ── Check-in panel ──
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  allBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
