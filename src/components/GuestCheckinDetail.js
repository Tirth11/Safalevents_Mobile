// Complete post-scan guest detail panel — mirrors the web app 1:1.
// Used by BOTH Staff check-in and Host event-manage check-in so the experience
// is identical. Shows: entry verdict, identity (+age), partial check-in
// controls, this-event timeline, party members, and cross-event intelligence.
//
// Props:
//   rsvp           the scanned RSVP record (required)
//   event          the event record (required)
//   result         optional validateScan() result { ok, code, message }
//   scannerName    label written into the check-in log (e.g. "Host" or "Sam (Staff)")
//   canCheckin     show the +/- check-in controls (permission)
//   canViewHistory show the cross-event attendance intelligence (permission)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme/theme';
import { Card, Badge, Avatar, Button, Row, Divider } from './ui';
import {
  getCheckinState,
  getCheckedInCount,
  getGuestHistorySummary,
  recordArrival,
  resetArrival,
  addWalkinGuests,
  calcAge,
  meetsAge,
} from '../data/mock';

const GREEN = '#16a34a';
const RED = '#dc2626';
const AMBER = '#d97706';

export default function GuestCheckinDetail({
  rsvp,
  event,
  result,
  scannerName = 'Host',
  canCheckin = true,
  canViewHistory = true,
}) {
  const total = rsvp.guestCount || 1;
  const walkins = rsvp.walkinCount || 0;
  const checked = getCheckedInCount(rsvp);
  const remaining = Math.max(0, total - checked);
  const actualAttendance = checked + walkins;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const state = getCheckinState(rsvp);
  const [walkinCount, setWalkinCount] = useState(1);

  const firstScan = checked === 0;               // nobody checked in yet → whole party pre-selected
  // Stepper defaults to ALL present. `selRaw` high sentinel → clamps to the max so the
  // full party (or all remaining) is selected by default; admin taps − to deselect absentees.
  const maxSel = firstScan ? total : remaining;
  const [selRaw, setSelRaw] = useState(9999);
  const sel = Math.max(1, Math.min(selRaw, maxSel));

  // Entry verdict — denied vs valid vs all-in.
  const denied = result && !result.ok && result.code !== 'duplicate';
  const allIn = !denied && checked >= total;

  const log = rsvp.checkInLog || [];
  const hist = canViewHistory ? getGuestHistorySummary(rsvp.email) : null;

  // Age verification badge
  let ageBadge = null;
  if (event.ageRestricted) {
    const min = event.minimumAge || 18;
    if (rsvp.dob) {
      const ok = meetsAge(rsvp.dob, min);
      ageBadge = { color: ok ? GREEN : RED, text: ok ? `🔒 ${min}+ verified (${calcAge(rsvp.dob)} yrs)` : `🔒 Under ${min} — deny entry` };
    } else if (rsvp.ageVerified) {
      ageBadge = { color: GREEN, text: `🔒 Age verified · ${min}+` };
    } else {
      ageBadge = { color: AMBER, text: '⚠️ Age unverified — check physical ID' };
    }
  }

  const doArrival = (n) => {
    recordArrival(rsvp.id, n, scannerName);
    setSelRaw(9999); // reset stepper back to "all" for the next scan
  };

  return (
    <View style={{ gap: spacing.md }}>
      {/* ── 1. ENTRY VERDICT ── */}
      <View
        style={[
          styles.verdict,
          denied
            ? { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: RED }
            : allIn
            ? { backgroundColor: 'rgba(34,197,94,0.10)', borderColor: GREEN }
            : { backgroundColor: colors.primaryTint, borderColor: colors.primary },
        ]}
      >
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
          <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 14, color: denied ? RED : allIn ? GREEN : colors.primary, flex: 1 }}>
            {denied ? '✕ ENTRY DENIED' : allIn ? '✓ ALL ATTENDEES IN' : '✓ VALID — READY TO CHECK IN'}
          </Text>
          <Badge label={state.label} tone={state.state === 'full' ? 'green' : state.state === 'partial' ? 'amber' : 'gray'} />
        </Row>
        {denied && result?.message ? <Text style={[font.small, { marginTop: spacing.xs, color: RED, lineHeight: 18 }]}>{result.message}</Text> : null}
      </View>

      {/* ── 2. GUEST IDENTITY ── */}
      <Card>
        <Row style={{ alignItems: 'flex-start' }}>
          <Avatar seed={rsvp.name} size={50} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 17, color: colors.text }}>{rsvp.name}</Text>
            <Text style={font.tiny} numberOfLines={1}>{rsvp.email}</Text>
            {rsvp.phone ? <Text style={font.tiny} numberOfLines={1}>{rsvp.phone}</Text> : null}
            <Text style={[font.tiny, { marginTop: spacing.xs }]} numberOfLines={2}>
              {event.title} · {rsvp.ticketType || 'General Admission'}
            </Text>
            {ageBadge ? (
              <Text style={{ marginTop: spacing.xs, fontWeight: '700', fontSize: 12, color: ageBadge.color }}>{ageBadge.text}</Text>
            ) : null}
          </View>
        </Row>
      </Card>

      {/* ── 3. CURRENT ATTENDANCE / PARTIAL CHECK-IN ── */}
      {!denied && (
        <Card>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Row style={{ alignItems: 'center', flex: 1 }}>
              <Ionicons name="people" size={16} color={colors.primary} />
              <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 15, color: colors.text, marginLeft: spacing.sm, flex: 1 }}>Current Attendance</Text>
            </Row>
            <Badge label={state.state === 'full' ? 'Complete' : state.state === 'partial' ? 'Partial' : 'Not in'} tone={state.state === 'full' ? 'green' : state.state === 'partial' ? 'amber' : 'gray'} />
          </Row>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Stat label="RSVP Count" value={total} color={colors.text} />
            <Stat label="Checked-In" value={checked} color={GREEN} />
            <Stat label="Remaining" value={remaining} color={remaining > 0 ? AMBER : colors.textMuted} />
            <Stat label="Walk-Ins" value={walkins > 0 ? `+${walkins}` : 0} color={walkins > 0 ? GREEN : colors.textMuted} />
            {walkins > 0 ? <Stat label="Actual Total" value={actualAttendance} color={colors.primary} /> : null}
          </View>

          {/* progress */}
          <View style={{ marginTop: spacing.md }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={[font.tiny, { fontWeight: '700', color: colors.text }]}>Attendance Progress</Text>
              <Text style={[font.tiny, { fontWeight: '700', color: colors.text }]}>{pct}%</Text>
            </Row>
            <View style={styles.track}>
              <View style={{ height: 10, width: `${pct}%`, backgroundColor: checked >= total ? GREEN : colors.primary, borderRadius: 5 }} />
            </View>
          </View>

          {/* repeat-scan indicator — same QR scanned again mid-event */}
          {canCheckin && !firstScan && remaining > 0 ? (
            <View style={styles.repeatBanner}>
              <Ionicons name="refresh-circle" size={18} color={'#a16207'} />
              <Text style={{ marginLeft: spacing.sm, flex: 1, fontWeight: '700', fontSize: 12.5, color: '#a16207', lineHeight: 17 }}>
                Already partially checked in — {checked} of {total} arrived. Continue with the remaining {remaining}.
              </Text>
            </View>
          ) : null}

          {/* check-in controls — whole party pre-selected; admin taps − to deselect absentees */}
          {canCheckin && remaining > 0 ? (
            <View style={styles.stepperWrap}>
              <Text style={[font.small, { fontWeight: '700', marginBottom: 2 }]}>
                {firstScan ? 'Attendees present now' : 'Remaining attendees present now'}
              </Text>
              <Text style={[font.tiny, { color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 16 }]}>
                All {maxSel} selected by default — tap − to deselect anyone who didn't arrive.
              </Text>
              <Row style={{ gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
                <Row style={styles.stepper}>
                  <TouchableOpacity activeOpacity={0.8} hitSlop={8} onPress={() => setSelRaw(Math.max(1, sel - 1))} style={styles.stepBtn}>
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={{ minWidth: 32, textAlign: 'center', fontWeight: '800', fontSize: 16 }}>{sel}</Text>
                  <TouchableOpacity activeOpacity={0.8} hitSlop={8} onPress={() => setSelRaw(Math.min(maxSel, sel + 1))} style={styles.stepBtn}>
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </Row>
                <View style={{ flex: 1, minWidth: 150 }}>
                  <Button
                    label={sel >= maxSel ? `Check In All ${sel}` : `Check In ${sel}`}
                    variant="accent"
                    icon="checkmark-circle"
                    small
                    onPress={() => doArrival(sel)}
                  />
                </View>
              </Row>
            </View>
          ) : null}

          {checked >= total ? (
            <View style={styles.complete}>
              <Ionicons name="checkmark-circle" size={18} color={GREEN} />
              <Text style={{ marginLeft: spacing.sm, fontWeight: '700', color: GREEN, fontSize: 13, flex: 1, lineHeight: 18 }}>
                All {total} attendee{total > 1 ? 's' : ''} checked in — complete attendance recorded.
              </Text>
              {canCheckin ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => resetArrival(rsvp.id)} hitSlop={8} style={{ marginLeft: spacing.sm }}>
                  <Text style={{ color: RED, fontWeight: '700', fontSize: 12 }}>Undo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {canCheckin ? (
            <View style={styles.walkinWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <Ionicons name="person-add-outline" size={15} color={colors.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[font.small, { fontWeight: '700', color: colors.text }]}>Add Additional Guest (walk-in)</Text>
              </View>
              <Text style={[font.tiny, { color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 16 }]}>
                No personal info needed — enter guest count only. They're checked in immediately.
              </Text>
              <Row style={{ gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
                <Row style={styles.stepper}>
                  <TouchableOpacity activeOpacity={0.8} hitSlop={8} onPress={() => setWalkinCount((n) => Math.max(1, n - 1))} style={styles.stepBtn}>
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={{ minWidth: 32, textAlign: 'center', fontWeight: '800', fontSize: 16 }}>{walkinCount}</Text>
                  <TouchableOpacity activeOpacity={0.8} hitSlop={8} onPress={() => setWalkinCount((n) => n + 1)} style={styles.stepBtn}>
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </Row>
                <View style={{ flex: 1, minWidth: 150 }}>
                  <Button
                    label={`+ Add & Check-In ${walkinCount}`}
                    variant="primary"
                    icon="person-add-outline"
                    small
                    onPress={() => { addWalkinGuests(rsvp.id, walkinCount, scannerName); setWalkinCount(1); }}
                  />
                </View>
              </Row>
            </View>
          ) : null}

          {!canCheckin ? (
            <Text style={[font.small, { marginTop: spacing.sm, lineHeight: 18 }]}>Your role can view this guest but not check them in.</Text>
          ) : null}
        </Card>
      )}

      {/* ── 4. THIS-EVENT TIMELINE ── */}
      {log.length > 0 ? (
        <Card>
          <Row style={{ alignItems: 'center', marginBottom: spacing.md }}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 15, color: colors.text, marginLeft: spacing.sm, flex: 1 }}>This Event — Check-In Timeline</Text>
          </Row>
          <View style={{ paddingLeft: 18 }}>
            <View style={styles.timeLine} />
            {(() => {
              let cumChecked = 0;
              let cumWalk = 0;
              return log.map((l, i) => {
                let title;
                if (l.walkin) {
                  cumWalk += l.count;
                  title = `+${l.count} walk-in guest${l.count > 1 ? 's' : ''} added`;
                } else {
                  const isFirst = cumChecked === 0;
                  cumChecked += l.count;
                  if (isFirst) {
                    const extra = l.count - 1;
                    title = extra > 0
                      ? `Primary guest + ${extra} additional guest${extra > 1 ? 's' : ''} checked in`
                      : 'Primary guest checked in';
                  } else {
                    title = `${l.count} additional guest${l.count > 1 ? 's' : ''} checked in`;
                  }
                }
                const totalLine = l.walkin
                  ? `Total attendance: ${cumChecked + cumWalk}`
                  : `Total checked-in: ${cumChecked}`;
                return (
                  <View key={i} style={{ paddingBottom: i < log.length - 1 ? spacing.md : 0, position: 'relative' }}>
                    <View style={[styles.timeDot, l.walkin && { backgroundColor: '#16a34a' }]} />
                    <Text style={[font.tiny, { fontWeight: '600' }]} numberOfLines={1}>{l.time}{l.by ? ` · ${l.by}` : ''}</Text>
                    <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text }}>{title}</Text>
                    <Text style={[font.tiny, { color: colors.textMuted, marginTop: 1 }]}>{totalLine}</Text>
                  </View>
                );
              });
            })()}
          </View>
          <Divider style={{ marginVertical: spacing.sm }} />
          <Text style={[font.small, { fontWeight: '700' }]}>
            Total Attendance:{' '}
            <Text style={{ color: colors.text }}>
              {checked} of {total}{walkins > 0 ? ` + ${walkins} walk-in${walkins > 1 ? 's' : ''} = ${actualAttendance} actual` : ''}
            </Text>
          </Text>
        </Card>
      ) : null}



      {/* ── 6 + 7. CROSS-EVENT INTELLIGENCE + VERDICT ── */}
      {hist ? (
        <Card>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Row style={{ alignItems: 'center', flex: 1 }}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
              <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 15, color: colors.text, marginLeft: spacing.sm, flex: 1 }}>Guest Attendance History</Text>
            </Row>
            {hist.hasWarning ? <Badge tone="red" label="⚠ Over-RSVP" /> : null}
          </Row>

          {hist.found ? (
            <>
              {/* verdict banner */}
              {hist.trustScore >= 70 ? (
                <View style={[styles.bigVerdict, { backgroundColor: GREEN }]}>
                  <Text style={styles.bigVerdictTitle}>🛡  Reliable Guest</Text>
                  <Text style={styles.bigVerdictStat}>{hist.accuracy}% <Text style={styles.bigVerdictSub}>attendance accuracy</Text></Text>
                  <Text style={styles.bigVerdictNote}>Consistent attendance across {hist.totalEventsRsvpd} events.</Text>
                </View>
              ) : hist.trustScore < 50 || hist.pattern === 'Over-RSVP Pattern' ? (
                <View style={[styles.bigVerdict, { backgroundColor: RED }]}>
                  <Text style={styles.bigVerdictTitle}>⚠  {hist.pattern === 'Over-RSVP Pattern' ? 'Over-RSVP Pattern Detected' : 'High No-Show Risk'}</Text>
                  <Text style={styles.bigVerdictStat}>{hist.accuracy}% <Text style={styles.bigVerdictSub}>attendance accuracy</Text></Text>
                  <Text style={styles.bigVerdictNote}>🍽 Food &amp; capacity planning risk</Text>
                </View>
              ) : (
                <View style={[styles.amberVerdict]}>
                  <Text style={{ fontWeight: '800', fontSize: 13.5, color: '#a16207' }}>⚠ Partial Attendance</Text>
                  <Text style={[font.small, { color: colors.text, marginTop: spacing.xs, lineHeight: 18 }]}>{hist.accuracy}% accuracy across {hist.totalEventsRsvpd} events — monitor future RSVPs.</Text>
                </View>
              )}

              {/* summary stats */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
                <Stat label="Events" value={hist.totalEventsRsvpd} color={colors.text} small />
                <Stat label="Accuracy" value={`${hist.accuracy}%`} color={hist.accuracy >= 80 ? GREEN : hist.accuracy >= 50 ? AMBER : RED} small />
                <Stat label="No-Shows" value={hist.noShow} color={hist.noShow > 0 ? RED : colors.text} small />
                <Stat label="Partials" value={hist.partial} color={hist.partial > 0 ? AMBER : colors.text} small />
              </View>

              {/* recent table */}
              {hist.recent.length > 0 ? (
                <View style={styles.histTable}>
                  <Row style={[styles.histHead]}>
                    <Text style={[styles.hCell, { flex: 2 }]}>EVENT</Text>
                    <Text style={[styles.hCell, styles.hCenter]}>RSVP</Text>
                    <Text style={[styles.hCell, styles.hCenter]}>ACTUAL</Text>
                    <Text style={[styles.hCell, styles.hCenter]}>Δ</Text>
                  </Row>
                  {hist.recent.map((h, i) => {
                    const diff = h.actual - h.rsvpCount;
                    return (
                      <Row key={i} style={[styles.histRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                        <Text style={{ flex: 2, fontSize: 12.5, fontWeight: '600', color: colors.text }} numberOfLines={1}>{h.event}</Text>
                        <Text style={[styles.bCenter]}>{h.rsvpCount}</Text>
                        <Text style={[styles.bCenter, { fontWeight: '700' }]}>{h.actual}</Text>
                        <Text style={[styles.bCenter, { fontWeight: '700', color: diff < 0 ? RED : diff > 0 ? GREEN : colors.textMuted }]}>{diff === 0 ? '—' : diff}</Text>
                      </Row>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="shield-checkmark-outline" size={28} color={colors.textMuted} style={{ opacity: 0.5 }} />
              <Text style={[font.small, { textAlign: 'center', marginTop: spacing.sm, lineHeight: 18 }]}>First-time attendee — no past attendance history yet.</Text>
            </View>
          )}
        </Card>
      ) : null}
    </View>
  );
}

function Stat({ label, value, color, small }) {
  return (
    <View style={[styles.stat, small && { padding: 8 }, { minWidth: small ? '45%' : '28%', flexGrow: 1, flexShrink: 1 }]}>
      <Text style={{ fontSize: small ? 17 : 21, fontWeight: '800', color, fontFamily: 'Inter_800ExtraBold' }}>{value}</Text>
      <Text style={[font.tiny, { marginTop: 3, textAlign: 'center' }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  verdict: { borderWidth: 1.5, borderRadius: radius.md, padding: 14 },
  stat: { flex: 1, backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  track: { height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  stepperWrap: { backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 14, marginTop: spacing.md },
  walkinWrap: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, padding: 14, marginTop: spacing.md },
  repeatBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eab30815', borderWidth: 1, borderColor: '#eab30840', borderLeftWidth: 4, borderLeftColor: '#eab308', borderRadius: radius.md, padding: 12, marginTop: spacing.md },
  stepper: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center' },
  stepBtn: { padding: 10 },
  complete: { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN + '12', borderWidth: 1, borderColor: GREEN + '40', borderRadius: radius.md, padding: 12, marginTop: spacing.md },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, color: colors.textMuted, marginBottom: 10 },
  memberRow: { backgroundColor: colors.surfaceHover, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8 },
  memberDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timeLine: { position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, backgroundColor: colors.border },
  timeDot: { position: 'absolute', left: -18, top: 3, width: 11, height: 11, borderRadius: 6, backgroundColor: GREEN, borderWidth: 2, borderColor: colors.surface },
  bigVerdict: { borderRadius: 14, padding: 16 },
  bigVerdictTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 6 },
  bigVerdictStat: { color: '#fff', fontWeight: '800', fontSize: 24 },
  bigVerdictSub: { fontSize: 13, fontWeight: '600', opacity: 0.9 },
  bigVerdictNote: { color: '#fff', fontSize: 12.5, opacity: 0.92, marginTop: 6 },
  amberVerdict: { backgroundColor: '#eab30815', borderWidth: 1, borderColor: '#eab30840', borderLeftWidth: 4, borderLeftColor: '#eab308', borderRadius: radius.md, padding: 14 },
  histTable: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.md },
  histHead: { backgroundColor: colors.surfaceHover, paddingHorizontal: 12, paddingVertical: 9, alignItems: 'center' },
  histRow: { paddingHorizontal: 12, paddingVertical: 9, alignItems: 'center' },
  hCell: { fontSize: 10.5, fontWeight: '700', color: colors.textMuted },
  hCenter: { flex: 1, textAlign: 'center' },
  bCenter: { flex: 1, textAlign: 'center', fontSize: 12.5, color: colors.text },
  empty: { alignItems: 'center', backgroundColor: colors.surfaceHover, borderRadius: radius.md, padding: 24 },
});
