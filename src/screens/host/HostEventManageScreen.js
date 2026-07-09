import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Linking, Share, Platform, ScrollView } from 'react-native';
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
  Field,
  TextField,
  Toggle,
  ToggleRow,
  Tabs,
  Chips,
  ApprovalBadge,
} from '../../components/ui';
import GuestCheckinDetail from '../../components/GuestCheckinDetail';
import {
  events,
  conversations,
  auditTrail,
  outbox,
  getEvent,
  getRsvps,
  getPolls,
  getComments,
  useStore,
  checkInGuest,
  createPoll,
  addComment,
  deleteComment,
  addManualGuest,
  broadcast,
  updateEvent,
  deleteEvent,
  calcAge,
  meetsAge,
  getEventPhotos,
  uploadPhoto,
  approvePhoto,
  rejectPhoto,
  deletePhoto,
  DRESS_CODES,
  DRESS_CODE_COVER_PRESETS,
  EVENT_TYPES,
  MEETING_PLATFORMS,
  validateScan,
  getCheckinState,
  getCheckedInCount,
  recordArrival,
  resetArrival,
  getPartyMembers,
  getGuestHistorySummary,
  approveRsvp,
  rejectRsvp,
  approveFromWaitlist,
  reopenRsvp,
  removeRsvp,
  approveAllPending,
} from '../../data/mock';

const MANAGE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'guests', label: 'Guests' },
  { key: 'invites', label: 'Invitations' },
  { key: 'photos', label: 'Photos' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'polls', label: 'Polls' },
  { key: 'comments', label: 'Comments' },
  { key: 'payments', label: 'Payments' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'logs', label: 'Notification Logs' },
  { key: 'settings', label: 'Settings' },
  { key: 'checkin', label: 'Check-in' },
];

const GUEST_TABS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'approval', label: 'Approval' },
  { key: 'waitlist', label: 'Waitlist' },
  { key: 'rejected', label: 'Rejected' },
];

function Answers({ answers }) {
  const entries = Object.entries(answers || {});
  if (!entries.length) return null;
  return (
    <View style={{ marginTop: spacing.sm }}>
      {entries.map(([q, a]) => (
        <Text key={q} style={[font.tiny, { lineHeight: 16 }]}>
          <Text style={{ fontWeight: '700' }}>{q} </Text>
          {a}
        </Text>
      ))}
    </View>
  );
}

// Multi-channel picker for broadcasts (Email / SMS / WhatsApp)
const BROADCAST_CHANNELS = [
  { key: 'Email', icon: 'mail-outline', color: colors.primary },
  { key: 'SMS', icon: 'chatbubble-outline', color: colors.blue },
  { key: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
];
function ChannelPicker({ selected, onToggle }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[font.tiny, { fontWeight: '700', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.3 }]}>Channel</Text>
      <Row style={{ gap: spacing.sm, flexWrap: 'wrap' }}>
        {BROADCAST_CHANNELS.map((ch) => {
          const on = selected.includes(ch.key);
          return (
            <TouchableOpacity
              key={ch.key}
              activeOpacity={0.8}
              onPress={() => onToggle(ch.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full,
                borderWidth: on ? 2 : 1, borderColor: on ? ch.color : colors.border,
                backgroundColor: on ? ch.color + '14' : colors.surface,
              }}
            >
              <Ionicons name={ch.icon} size={15} color={on ? ch.color : colors.textMuted} />
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: on ? ch.color : colors.textMuted }}>{ch.key}</Text>
              {on ? <Ionicons name="checkmark" size={13} color={ch.color} /> : null}
            </TouchableOpacity>
          );
        })}
      </Row>
    </View>
  );
}

// Attendee-level inline check-in controls (used in Guests tab + Check-in going list)
function AttendeeCheckinControls({ r }) {
  const cs = getCheckinState(r);
  const remaining = cs.total - cs.inCount;
  return (
    <Row style={{ flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
      <View style={[styles.csBadge, { backgroundColor: cs.bg }]}>
        <Text style={{ color: cs.color, fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>{cs.label}</Text>
      </View>
      {remaining > 0 ? (
        <>
          <Button label="+1" small variant="accent" onPress={() => recordArrival(r.id, 1, 'Host')} />
          {remaining > 1 ? (
            <Button label={`All ${remaining}`} small variant="outline" onPress={() => recordArrival(r.id, remaining, 'Host')} />
          ) : null}
        </>
      ) : (
        <TouchableOpacity onPress={() => resetArrival(r.id)} activeOpacity={0.8} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>Undo</Text>
        </TouchableOpacity>
      )}
    </Row>
  );
}

export default function HostEventManageScreen({ navigation, route }) {
  useStore(); // reflect live check-ins / mutations
  const event = getEvent(route.params?.eventId) || events[0];
  const eventRsvps = getRsvps(event.id);
  const [active, setActive] = useState('overview');
  const [guestSubTab, setGuestSubTab] = useState('confirmed'); // sub-tab for Guests view
  const [scanResult, setScanResult] = useState(null); // result of QR validate
  const [arriving, setArriving] = useState(1);         // stepper for arrivals
  const [passInput, setPassInput] = useState('');      // manual pass id entry
  const [scanning, setScanning] = useState(false);     // scan simulation panel

  const goingApproved = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');

  const pending = eventRsvps.filter((r) => r.approvalState === 'UNDER_APPROVAL' && r.status !== 'waitlist');
  const waitlist = eventRsvps.filter((r) => r.status === 'waitlist');
  const rejected = eventRsvps.filter((r) => r.approvalState === 'REJECTED');

  const eventPhotos = getEventPhotos(event.id);
  const pendingPhotos = eventPhotos.filter((p) => p.status === 'PENDING');
  const approvedPhotos = eventPhotos.filter((p) => p.status === 'APPROVED');

  const alert = (t, m) => Alert.alert(t, m || 'Prototype — not wired.');

  // ── Manual guest form ──
  const [mg, setMg] = useState({ name: '', email: '', phone: '', guestCount: '1' });
  const submitManual = () => {
    if (!mg.name.trim()) { Alert.alert('Name required', 'Enter the guest name.'); return; }
    const res = addManualGuest(event.id, mg);
    if (!res.ok) { Alert.alert('Could not add guest', res.error); return; }
    setMg({ name: '', email: '', phone: '', guestCount: '1' });
    Alert.alert('Guest added', `${res.rsvp.name} was added as an approved guest.`);
  };
  const shareInvite = async () => {
    const link = `https://safalevents.app/e/${event.id}`;
    const msg = `You're invited to ${event.title} on ${event.date}! RSVP: ${link}`;
    try {
      if (Platform.OS === 'web' && !navigator.share) { Alert.alert('Share invite', msg); return; }
      await Share.share({ message: msg });
    } catch {
      Alert.alert('Share invite', msg);
    }
  };
  const whatsappInvite = () => {
    const msg = `You're invited to ${event.title} on ${event.date}! RSVP: https://safalevents.app/e/${event.id}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`).catch(() => Alert.alert('WhatsApp', msg));
  };

  // ── Poll form ──
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['', '']);
  const submitPoll = () => {
    const opts = pollOpts.filter((o) => o.trim());
    if (!pollQ.trim() || opts.length < 2) { Alert.alert('Incomplete poll', 'Add a question and at least two options.'); return; }
    createPoll(event.id, pollQ, opts);
    setPollQ(''); setPollOpts(['', '']);
  };

  // ── Comment add ──
  const [commentText, setCommentText] = useState('');
  const submitComment = () => {
    if (!commentText.trim()) return;
    addComment(event.id, event.hostName || 'Host', commentText.trim());
    setCommentText('');
  };

  // ── Broadcast (multi-channel: Email / SMS / WhatsApp) ──
  const [bcast, setBcast] = useState('');
  const [bcastChannels, setBcastChannels] = useState(['Email']);
  const toggleBcastChannel = (ch) =>
    setBcastChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  const sendBroadcast = () => {
    if (!bcast.trim()) { Alert.alert('Empty message', 'Write a message to send.'); return; }
    if (bcastChannels.length === 0) { Alert.alert('Pick a channel', 'Select at least one channel (Email, SMS or WhatsApp).'); return; }
    const n = broadcast(event.id, bcast.trim(), bcastChannels);
    setBcast('');
    Alert.alert('Broadcast sent', `Message queued to ${n} guest(s) via ${bcastChannels.join(', ')}. See Notification Logs.`);
  };

  // ── Settings edit ──
  const [edit, setEdit] = useState({
    title: event.title, date: event.date, time: event.time, location: event.location,
    capacity: String(event.capacity || ''), description: event.description,
    seriesType: event.seriesType || 'None',
    approvalRequired: !!event.approvalRequired, autoCheckIn: !!event.autoCheckIn, messagingEnabled: event.messagingEnabled !== false,
    allowSelfEdit: !!event.allowSelfEdit, enablePayments: !!event.enablePayments,
    ageRestricted: !!event.ageRestricted, minimumAge: String(event.minimumAge || 18),
    dressCode: event.dressCode || 'No Dress Code',
    customDressCode: event.customDressCode || '',
    dressCodeDescription: event.dressCodeDescription || '',
    dressCodeAvoid: event.dressCodeAvoid || '',
    dressCodeInstructions: event.dressCodeInstructions || '',
    dressCodeCover: event.dressCodeCover || '',
    eventType: event.eventType || 'Birthday Party',
    customEventType: event.customEventType || '',
    eventMode: event.eventMode || 'Onsite',
    venueName: event.venueName || '',
    venueAddressLine1: event.venueAddressLine1 || '',
    venueAddressLine2: event.venueAddressLine2 || '',
    venueCity: event.venueCity || '',
    venueState: event.venueState || '',
    venueCountry: event.venueCountry || '',
    venuePostalCode: event.venuePostalCode || '',
    venueMapLink: event.venueMapLink || '',
    venueInstructions: event.venueInstructions || '',
    meetingPlatform: event.meetingPlatform || 'Zoom',
    meetingLink: event.meetingLink || '',
    meetingId: event.meetingId || '',
    meetingPasscode: event.meetingPasscode || '',
    meetingInstructions: event.meetingInstructions || '',
  });
  const setE = (k, v) => setEdit((p) => ({ ...p, [k]: v }));
  const saveSettings = () => {
    if (!edit.title.trim()) { Alert.alert('Required', 'Please enter an event title.'); return; }
    if (!edit.eventType) { Alert.alert('Required', 'Please select an event type.'); return; }
    if (!edit.eventMode) { Alert.alert('Required', 'Please select an event mode.'); return; }
    if (edit.eventMode === 'Onsite' || edit.eventMode === 'Hybrid') {
      if (!edit.venueName.trim()) { Alert.alert('Required', 'Please enter a venue name.'); return; }
      if (!edit.venueAddressLine1.trim()) { Alert.alert('Required', 'Please enter an address.'); return; }
      if (!edit.venueCity.trim()) { Alert.alert('Required', 'Please enter a city.'); return; }
      if (!edit.venueState.trim()) { Alert.alert('Required', 'Please enter a state.'); return; }
      if (!edit.venueCountry.trim()) { Alert.alert('Required', 'Please enter a country.'); return; }
      if (!edit.venuePostalCode.trim()) { Alert.alert('Required', 'Please enter a postal code.'); return; }
    }
    if (edit.eventMode === 'Virtual' || edit.eventMode === 'Hybrid') {
      if (!edit.meetingLink.trim()) { Alert.alert('Required', 'Please enter a virtual meeting link.'); return; }
    }
    if (!edit.date.trim()) { Alert.alert('Required', 'Please enter a date.'); return; }
    if (!edit.time.trim()) { Alert.alert('Required', 'Please enter a time.'); return; }

    let locationString = '';
    let cityString = '';
    if (edit.eventMode === 'Virtual') {
      locationString = 'Virtual Event';
      cityString = 'Online';
    } else {
      locationString = `${edit.venueName}, ${edit.venueCity}, ${edit.venueState}`;
      cityString = edit.venueCity;
    }

    updateEvent(event.id, {
      title: edit.title, date: edit.date, time: edit.time, 
      location: locationString,
      city: cityString,
      capacity: Number(edit.capacity) || 0, description: edit.description, seriesType: edit.seriesType,
      approvalRequired: edit.approvalRequired, autoCheckIn: edit.autoCheckIn, messagingEnabled: edit.messagingEnabled,
      allowSelfEdit: edit.allowSelfEdit, enablePayments: edit.enablePayments,
      ageRestricted: edit.ageRestricted, minimumAge: Number(edit.minimumAge) || 18,
      dressCode: edit.dressCode,
      customDressCode: edit.customDressCode,
      dressCodeDescription: edit.dressCodeDescription,
      dressCodeAvoid: edit.dressCodeAvoid,
      dressCodeInstructions: edit.dressCodeInstructions,
      dressCodeCover: edit.dressCodeCover,
      eventType: edit.eventType,
      customEventType: edit.customEventType,
      eventMode: edit.eventMode,
      venueName: edit.venueName,
      venueAddressLine1: edit.venueAddressLine1,
      venueAddressLine2: edit.venueAddressLine2,
      venueCity: edit.venueCity,
      venueState: edit.venueState,
      venueCountry: edit.venueCountry,
      venuePostalCode: edit.venuePostalCode,
      venueMapLink: edit.venueMapLink,
      venueInstructions: edit.venueInstructions,
      meetingPlatform: edit.meetingPlatform,
      meetingLink: edit.meetingLink,
      meetingId: edit.meetingId,
      meetingPasscode: edit.meetingPasscode,
      meetingInstructions: edit.meetingInstructions,
    });
    Alert.alert('Saved', 'Event settings updated.');
  };
  const removeEvent = () => {
    Alert.alert('Delete event', `Delete "${event.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteEvent(event.id); navigation.goBack(); } },
    ]);
  };

  // ── Payments (bank) ──
  const [bank, setBank] = useState({
    bankName: (event.bank && event.bank.bankName) || '', holderName: (event.bank && event.bank.holderName) || '',
    routingNumber: (event.bank && event.bank.routing) || '', accountNumber: (event.bank && event.bank.account) || '',
  });
  const saveBank = () => {
    updateEvent(event.id, { bank: { bankName: bank.bankName, holderName: bank.holderName, routing: bank.routingNumber, account: bank.accountNumber }, enablePayments: true });
    Alert.alert('Bank account saved', 'Payout details stored for this event.');
  };

  // ── Export ──
  const exportGuests = () => {
    const header = 'Name,Email,Phone,Status,RSVP Count,Checked-In Count,Attendance';
    const rows = eventRsvps.map((r) => {
      const total = r.guestCount || 1;
      const inCount = getCheckedInCount(r);
      const attendance = inCount >= total ? 'Full' : inCount > 0 ? `Partial (${inCount}/${total})` : 'None';
      return `${r.name},${r.email},${r.phone || ''},${r.status},${total},${inCount},${attendance}`;
    });
    const csv = [header, ...rows].join('\n');
    Alert.alert('Export guest list (demo)', `${eventRsvps.length} rows would download as CSV:\n\n${csv.slice(0, 200)}${csv.length > 200 ? '…' : ''}`);
  };

  return (
    <Screen>
      <Row style={[styles.between, { marginBottom: spacing.md }]}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={font.h2} numberOfLines={1}>{event.title}</Text>
          <Text style={font.small}>{event.date}{event.seriesType && event.seriesType !== 'None' ? ` · ${event.seriesType} series` : ''}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -spacing.sm }}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </TouchableOpacity>
      </Row>
      <Tabs tabs={MANAGE_TABS} active={active} onChange={setActive} />

      {active === 'overview' && (
        <View>
          <Row style={{ marginBottom: spacing.md }}>
            <StatCard label="RSVPs" value={eventRsvps.length} icon="people-outline" color={colors.primary} />
            <View style={{ width: spacing.md }} />
            <StatCard label="Going" value={goingApproved.length} icon="checkmark-circle" color={colors.accent} />
          </Row>
          <Row style={{ marginBottom: spacing.lg }}>
            <StatCard label="Pending" value={pending.length} icon="time-outline" color={colors.amber} />
            <View style={{ width: spacing.md }} />
            <StatCard label="Waitlist" value={waitlist.length} icon="people-outline" color={colors.blue} />
          </Row>

          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={styles.between}>
              <Text style={[font.small, { fontWeight: '700', color: colors.text }]}>Capacity</Text>
              <Text style={font.small}>{goingApproved.length} / {event.capacity}</Text>
            </Row>
            <View style={styles.capTrack}>
              <View style={[styles.capFill, { width: `${event.capacity ? Math.min(100, (goingApproved.length / event.capacity) * 100) : 0}%` }]} />
            </View>
          </Card>

          {/* Broadcast + Export quick actions */}
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Message all guests</Text>
            <ChannelPicker selected={bcastChannels} onToggle={toggleBcastChannel} />
            <TextField value={bcast} onChangeText={setBcast} placeholder="Compose a broadcast to all confirmed guests…" multiline />
            <Row style={{ gap: spacing.md, alignItems: 'stretch' }}>
              <View style={{ flex: 1 }}><Button label="Send broadcast" variant="primary" icon="megaphone-outline" onPress={sendBroadcast} /></View>
              <View style={{ flex: 1 }}><Button label="Export guests" variant="outline" icon="download-outline" onPress={exportGuests} /></View>
            </Row>
          </Card>

          <SectionTitle>Recent activity</SectionTitle>
          <Card>
            {auditTrail.map((a, i) => (
              <View key={a.id}>
                <Row>
                  <View style={[styles.iconTile, { backgroundColor: colors.primaryTint }]}>
                    <Ionicons name="ellipse" size={10} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }} numberOfLines={1}>{a.action}</Text>
                    <Text style={[font.tiny, { marginTop: spacing.xs }]} numberOfLines={1}>{a.actor} · {a.time}</Text>
                  </View>
                </Row>
                {i < auditTrail.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </Card>
        </View>
      )}

      {active === 'guests' && (
        <View>
          <Tabs tabs={GUEST_TABS} active={guestSubTab} onChange={setGuestSubTab} />

          {guestSubTab === 'approval' && (
            <Card style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
            <Row style={[styles.between, { marginBottom: spacing.md }]}>
              <Row>
                <Text style={[font.h3, { marginRight: spacing.sm }]}>Under Approval</Text>
                <Badge tone="amber" label={String(pending.length)} />
              </Row>
              <Button label="Approve all" variant="accent" small onPress={() => { const n = approveAllPending(event.id); Alert.alert('Approved', `${n} pending request(s) approved.`); }} />
            </Row>
            {pending.length === 0 ? (
              <Text style={font.small}>No pending requests.</Text>
            ) : (
              pending.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Avatar seed={r.name} size={40} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}</Text>
                      <Text style={font.tiny} numberOfLines={1}>{r.email}</Text>
                      <Text style={[font.tiny, { marginTop: spacing.xs }]}>{r.status} · {r.guestCount} guest(s)</Text>
                      <Answers answers={r.answers} />
                      <Row style={{ marginTop: spacing.sm }}>
                        <Button label="Approve" variant="accent" small onPress={() => { approveRsvp(r.id); Alert.alert('Approved', `${r.name} is confirmed.`); }} />
                        <View style={{ width: spacing.sm }} />
                        <Button label="Reject" variant="danger" small onPress={() => Alert.alert('Reject RSVP', `Reject ${r.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => rejectRsvp(r.id) }])} />
                      </Row>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
          )}

          {guestSubTab === 'waitlist' && (
            <Card style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: 4 }]}>Waitlist — Under Approval</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>Event at capacity ({goingApproved.length}/{event.capacity})</Text>
            {waitlist.length === 0 ? (
              <Text style={font.small}>No one on the waitlist.</Text>
            ) : (
              waitlist.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Avatar seed={r.name} size={40} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}</Text>
                      <Text style={font.tiny} numberOfLines={1}>{r.email}</Text>
                      <Answers answers={r.answers} />
                      <Row style={{ marginTop: spacing.sm }}>
                        <Button label="Approve & Allow In" variant="accent" small onPress={() => { approveFromWaitlist(r.id); Alert.alert('Approved', `${r.name} is in — confirmed off the waitlist.`); }} />
                        <View style={{ width: spacing.sm }} />
                        <Button label="Reject" variant="danger" small onPress={() => Alert.alert('Reject RSVP', `Reject ${r.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => rejectRsvp(r.id) }])} />
                      </Row>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
          )}

          {guestSubTab === 'rejected' && rejected.length > 0 && (
            <Card style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
              <Text style={[font.h3, { marginBottom: spacing.md }]}>Rejected</Text>
              {rejected.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={[styles.between, { alignItems: 'flex-start' }]}>
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}</Text>
                      <Text style={[font.tiny, { marginTop: spacing.xs, lineHeight: 16 }]} numberOfLines={2}>{r.rejectionReason || 'No reason given.'}</Text>
                    </View>
                    <Button label="Re-open" variant="outline" small onPress={() => { reopenRsvp(r.id); Alert.alert('Re-opened', 'Re-opened — back under review.'); }} />
                  </Row>
                </View>
              ))}
            </Card>
          )}

          {guestSubTab === 'confirmed' && (
            <Card style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
            <Row style={[styles.between, { marginBottom: spacing.md }]}>
              <Text style={font.h3}>Confirmed attendees</Text>
              <Button label="Export" variant="ghost" icon="download-outline" small onPress={exportGuests} />
            </Row>
            <Field placeholder="Search attendees…" />
            
            {goingApproved.length === 0 ? (
              <Text style={font.small}>No confirmed attendees yet.</Text>
            ) : (
              goingApproved.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Avatar seed={r.name} size={40} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Row style={[styles.between, { alignItems: 'flex-start' }]}>
                        <View style={{ flex: 1, paddingRight: spacing.sm }}>
                          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}{r.manual ? '  ·  added manually' : ''}</Text>
                          <Text style={font.tiny} numberOfLines={1}>{r.email}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -spacing.sm, marginRight: -spacing.sm }} onPress={() => Alert.alert('Remove guest', `Remove ${r.name} from this event?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeRsvp(r.id) }])}>
                          <Ionicons name="trash-outline" size={18} color={colors.red} />
                        </TouchableOpacity>
                      </Row>
                      <Answers answers={r.answers} />

                      {/* Age verification + party members (US-EVENT-016) */}
                      {event.ageRestricted ? (
                        <View style={{ marginTop: spacing.sm }}>
                          {r.dob ? (
                            <Badge
                              tone={meetsAge(r.dob, event.minimumAge) ? 'green' : 'red'}
                              label={`${meetsAge(r.dob, event.minimumAge) ? '✅' : '❌'} Age ${calcAge(r.dob)} · ${event.minimumAge}+`}
                            />
                          ) : r.ageVerified ? (
                            <Badge tone="green" label={`✅ Age Verified · ${event.minimumAge}+`} />
                          ) : (
                            <Badge tone="amber" label="⚠️ Age unverified — check ID" />
                          )}
                          {(r.guestCount || 1) > 1 ? (
                            <Text style={[font.tiny, { marginTop: spacing.sm, color: colors.textMuted }]}>
                              +{(r.guestCount || 1) - 1} accompanying guest{(r.guestCount || 1) - 1 > 1 ? 's' : ''} · ages verified at the door
                            </Text>
                          ) : null}
                        </View>
                      ) : null}

                      <View style={{ marginTop: spacing.sm }}>
                        <AttendeeCheckinControls r={r} />
                      </View>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
          )}
        </View>
      )}

      {active === 'invites' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Add guest manually</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>Creates an approved RSVP (respects capacity).</Text>
            <TextField label="Name" value={mg.name} onChangeText={(t) => setMg({ ...mg, name: t })} placeholder="Full name" />
            <TextField label="Email" value={mg.email} onChangeText={(t) => setMg({ ...mg, email: t })} placeholder="name@email.com" keyboardType="email-address" />
            <Row style={{ gap: spacing.md }}>
              <TextField half label="Phone" value={mg.phone} onChangeText={(t) => setMg({ ...mg, phone: t })} placeholder="+1 (555) 000-0000" />
              <TextField half label="Guest count" value={mg.guestCount} onChangeText={(t) => setMg({ ...mg, guestCount: t })} placeholder="1" keyboardType="numeric" />
            </Row>
            <Button label="Add guest" variant="primary" icon="person-add-outline" onPress={submitManual} />
          </Card>

          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Share invitation</Text>
            <Button label="Share via WhatsApp" variant="accent" icon="logo-whatsapp" style={{ marginBottom: spacing.sm }} onPress={whatsappInvite} />
            <Button label="Share link" variant="outline" icon="share-social-outline" onPress={shareInvite} />
          </Card>

          <Card>
            <Text style={[font.h3, { marginBottom: spacing.md }]}>Invitation outbox</Text>
            {outbox.length === 0 ? (
              <Text style={font.small}>No invitations sent yet.</Text>
            ) : (
              outbox.map((o, i) => (
                <View key={o.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={styles.between}>
                    <View style={{ flex: 1, paddingRight: spacing.sm }}>
                      <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }} numberOfLines={1}>{o.subject}</Text>
                      <Text style={[font.tiny, { marginTop: spacing.xs }]} numberOfLines={1}>{o.to} · {o.time}</Text>
                    </View>
                    <Badge tone={o.channel === 'WhatsApp' ? 'green' : o.channel === 'SMS' ? 'blue' : 'primary'} label={o.channel} />
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'photos' && (
        <View>
          {!event.enablePhotoAlbum ? (
            <Card>
              <Row style={{ marginBottom: spacing.sm }}>
                <Ionicons name="images-outline" size={18} color={colors.primary} />
                <Text style={[font.h3, { marginLeft: spacing.sm }]}>Photo album is off</Text>
              </Row>
              <Text style={[font.small, { lineHeight: 18 }]}>
                Turn on “Guest photo uploads” in Settings to create a shared album for this event.
              </Text>
            </Card>
          ) : (
            <>
              <Card style={{ marginBottom: spacing.lg }}>
                <Row style={[styles.between, { alignItems: 'flex-start' }]}>
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text style={font.h3}>Photo Album</Text>
                    <Text style={[font.tiny, { marginTop: 2 }]}>
                      Uploads: {event.photoUploadPermission === 'guests' ? 'Host + RSVPed guests' : 'Host only'}
                      {event.requirePhotoApproval ? ' · approval required' : ''}
                    </Text>
                  </View>
                  <Button
                    label="Add photo"
                    icon="camera"
                    small
                    onPress={() => { uploadPhoto(event.id, { uploader: 'Alex Rivera', role: 'host' }); }}
                  />
                </Row>
              </Card>

              {pendingPhotos.length > 0 && (
                <Card style={{ marginBottom: spacing.lg }}>
                  <Row style={[styles.between, { marginBottom: spacing.md }]}>
                    <Text style={font.h3}>Pending approval</Text>
                    <Badge tone="amber" label={String(pendingPhotos.length)} />
                  </Row>
                  {pendingPhotos.map((p, i) => (
                    <View key={p.id}>
                      {i > 0 ? <Divider /> : null}
                      <Row style={{ alignItems: 'flex-start' }}>
                        <Image source={{ uri: p.url }} style={styles.photoThumb} />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }} numberOfLines={1}>{p.uploader}</Text>
                          {p.caption ? <Text style={[font.tiny, { marginTop: spacing.xs, lineHeight: 16 }]} numberOfLines={2}>“{p.caption}”</Text> : null}
                          <Row style={{ marginTop: spacing.sm }}>
                            <Button label="Approve" variant="accent" small onPress={() => setPhotoStatus(p.id, 'APPROVED')} />
                            <View style={{ width: spacing.sm }} />
                            <Button label="Reject" variant="danger" small onPress={() => setPhotoStatus(p.id, 'REJECTED')} />
                          </Row>
                        </View>
                      </Row>
                    </View>
                  ))}
                </Card>
              )}

              <Card>
                <Row style={[styles.between, { marginBottom: spacing.md }]}>
                  <Text style={font.h3}>Album</Text>
                  <Badge tone="green" label={`${approvedPhotos.length} photos`} />
                </Row>
                {approvedPhotos.length === 0 ? (
                  <Text style={font.small}>No photos yet. Tap “Add photo” to start the album.</Text>
                ) : (
                  <View style={styles.photoGrid}>
                    {approvedPhotos.map((p) => (
                      <View key={p.id} style={styles.photoCell}>
                        <Image source={{ uri: p.url }} style={styles.photoImg} />
                        <TouchableOpacity activeOpacity={0.8} hitSlop={8} style={styles.photoDel} onPress={() => deletePhoto(p.id)}>
                          <Ionicons name="trash" size={13} color="#fff" />
                        </TouchableOpacity>
                        {p.role === 'guest' ? (
                          <View style={styles.photoTag}><Text style={styles.photoTagTxt}>Guest</Text></View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </>
          )}
        </View>
      )}

      {active === 'messaging' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <ToggleRow label="Allow guest messaging" value={event.messagingEnabled} icon="chatbubbles-outline" />
          </Card>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Broadcast to all guests</Text>
            <ChannelPicker selected={bcastChannels} onToggle={toggleBcastChannel} />
            <TextField value={bcast} onChangeText={setBcast} placeholder="Type a message for all confirmed guests…" multiline />
            <Button label="Send broadcast" variant="primary" icon="megaphone-outline" onPress={sendBroadcast} />
          </Card>
          {event.messagingEnabled ? (
            <Card>
              <Text style={[font.h3, { marginBottom: spacing.md }]}>Conversations</Text>
              {conversations.filter((c) => c.eventId === event.id).length === 0 ? (
                <Text style={font.small}>No conversations yet.</Text>
              ) : (
                conversations
                  .filter((c) => c.eventId === event.id)
                  .map((c, i) => {
                    const last = c.messages[c.messages.length - 1];
                    return (
                      <View key={c.id}>
                        {i > 0 ? <Divider /> : null}
                        <Row>
                          <Avatar seed={c.guestName} size={40} />
                          <View style={{ flex: 1, marginLeft: spacing.md }}>
                            <Row style={styles.between}>
                              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text, flex: 1, paddingRight: spacing.sm }} numberOfLines={1}>{c.guestName}</Text>
                              {c.unread ? <View style={styles.unreadDot} /> : null}
                            </Row>
                            <Text style={font.tiny} numberOfLines={1}>{last ? last.text : ''}</Text>
                          </View>
                        </Row>
                      </View>
                    );
                  })
              )}
            </Card>
          ) : (
            <Card>
              <Text style={[font.small, { textAlign: 'center' }]}>Messaging is off for this event — guests don't see the message option.</Text>
            </Card>
          )}
        </View>
      )}

      {active === 'polls' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Create a poll</Text>
            <TextField label="Question" value={pollQ} onChangeText={setPollQ} placeholder="e.g. Which theme do you prefer?" />
            {pollOpts.map((o, i) => (
              <Row key={i} style={{ alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <TextField value={o} onChangeText={(t) => setPollOpts((p) => p.map((x, idx) => (idx === i ? t : x)))} placeholder={`Option ${i + 1}`} />
                </View>
                {pollOpts.length > 2 ? (
                  <TouchableOpacity onPress={() => setPollOpts((p) => p.filter((_, idx) => idx !== i))} activeOpacity={0.8} style={{ marginTop: 14, marginLeft: spacing.sm, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </Row>
            ))}
            <Button label="Add option" variant="outline" icon="add" small style={{ alignSelf: 'flex-start', marginBottom: spacing.md }} onPress={() => setPollOpts((p) => [...p, ''])} />
            <Button label="Publish poll" variant="primary" icon="bar-chart-outline" onPress={submitPoll} />
          </Card>

          <SectionTitle>Active polls</SectionTitle>
          {getPolls(event.id).length === 0 ? (
            <Card><Text style={font.small}>No polls yet.</Text></Card>
          ) : (
            getPolls(event.id).map((poll) => {
              const total = poll.options.reduce((n, o) => n + o.votes, 0);
              return (
                <Card key={poll.id} style={{ marginBottom: spacing.md }}>
                  <Row style={[styles.between, { marginBottom: spacing.sm }]}>
                    <Text style={[font.h3, { flex: 1, paddingRight: spacing.sm }]}>{poll.question}</Text>
                    <Badge tone="green" label={poll.status} />
                  </Row>
                  {poll.options.map((o) => {
                    const pct = total ? Math.round((o.votes / total) * 100) : 0;
                    return (
                      <View key={o.id} style={{ marginBottom: spacing.sm }}>
                        <Row style={styles.between}>
                          <Text style={{ fontSize: 13, color: colors.text }}>{o.text}</Text>
                          <Text style={font.tiny}>{o.votes} · {pct}%</Text>
                        </Row>
                        <View style={styles.pollTrack}><View style={[styles.pollFill, { width: `${pct}%` }]} /></View>
                      </View>
                    );
                  })}
                  <Text style={[font.tiny, { marginTop: 4 }]}>{total} vote(s)</Text>
                </Card>
              );
            })
          )}
        </View>
      )}

      {active === 'comments' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Add a comment</Text>
            <TextField value={commentText} onChangeText={setCommentText} placeholder="Post an update or reply…" multiline />
            <Button label="Post comment" variant="primary" icon="chatbox-outline" onPress={submitComment} />
          </Card>
          <SectionTitle>Comments</SectionTitle>
          <Card>
            {getComments(event.id).length === 0 ? (
              <Text style={font.small}>No comments yet.</Text>
            ) : (
              getComments(event.id).map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ alignItems: 'flex-start' }}>
                    <Avatar seed={c.name} size={36} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Row style={styles.between}>
                        <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }} numberOfLines={1}>{c.name}</Text>
                        <TouchableOpacity onPress={() => deleteComment(c.id)} activeOpacity={0.8} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -spacing.sm, marginRight: -spacing.sm }}>
                          <Ionicons name="trash-outline" size={16} color={colors.red} />
                        </TouchableOpacity>
                      </Row>
                      <Text style={[font.small, { color: colors.text, marginTop: spacing.xs, lineHeight: 18 }]}>{c.text}</Text>
                      <Text style={[font.tiny, { marginTop: spacing.xs }]}>{c.time}</Text>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'payments' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={styles.between}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={font.h3}>Payments</Text>
                <Text style={[font.small, { marginTop: spacing.xs }]} numberOfLines={1}>{event.enablePayments ? `Paid event · $${event.ticketPrice || 0} per ticket` : 'Free event'}</Text>
              </View>
              <Badge tone={event.enablePayments ? 'green' : 'gray'} label={event.enablePayments ? 'Enabled' : 'Off'} />
            </Row>
          </Card>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Payout bank account</Text>
            <TextField label="Bank name" value={bank.bankName} onChangeText={(t) => setBank({ ...bank, bankName: t })} placeholder="Chase Bank" />
            <TextField label="Account holder name" value={bank.holderName} onChangeText={(t) => setBank({ ...bank, holderName: t })} placeholder="Alex Rivera" />
            <Row style={{ gap: spacing.md }}>
              <TextField half label="Routing number" value={bank.routingNumber} onChangeText={(t) => setBank({ ...bank, routingNumber: t })} placeholder="021000021" keyboardType="numeric" />
              <TextField half label="Account number" value={bank.accountNumber} onChangeText={(t) => setBank({ ...bank, accountNumber: t })} placeholder="••••1234" keyboardType="numeric" />
            </Row>
            <Button label="Save bank account" variant="primary" icon="save-outline" onPress={saveBank} />
          </Card>
          <Card>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Connect a processor</Text>
            <Button label="Connect payments" variant="outline" icon="card-outline" onPress={() => Alert.alert('Connect payments', 'Prototype — payment processor connection is simulated.')} />
          </Card>
        </View>
      )}

      {active === 'feedback' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.xs }]}>Event Feedback</Text>
            <Text style={[font.small, { color: colors.textMuted, marginBottom: spacing.md }]}>
              Build a form with up to 5 custom questions, set expected outcomes, publish, send invites and review analytics.
            </Text>
            <Button label="Open feedback builder" variant="primary" icon="chatbox-ellipses-outline"
              onPress={() => navigation.navigate('HostFeedback', { eventId: event.id })} />
          </Card>
        </View>
      )}

      {active === 'logs' && (
        <View>
          <SectionTitle>Notification logs</SectionTitle>
          <Card>
            {outbox.length === 0 ? (
              <Text style={font.small}>No notifications dispatched yet.</Text>
            ) : (
              outbox.map((o, i) => (
                <View key={o.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ alignItems: 'flex-start' }}>
                    <View style={[styles.iconTile, { backgroundColor: o.channel === 'WhatsApp' ? '#25D36618' : o.channel === 'SMS' ? colors.blueTint : colors.primaryTint }]}>
                      <Ionicons name={o.channel === 'WhatsApp' ? 'logo-whatsapp' : o.channel === 'SMS' ? 'call-outline' : 'mail-outline'} size={14} color={o.channel === 'WhatsApp' ? '#25D366' : o.channel === 'SMS' ? colors.blue : colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }} numberOfLines={1}>{o.subject}</Text>
                      <Text style={[font.tiny, { marginTop: spacing.xs }]} numberOfLines={1}>To {o.to} · {o.channel} · {o.time}</Text>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'settings' && (
        <View>
          <SectionTitle>Edit event</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <TextField label="Event title *" value={edit.title} onChangeText={(t) => setE('title', t)} />
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Event type *</Text>
            <Chips options={EVENT_TYPES} value={edit.eventType} onChange={(v) => setE('eventType', v)} />
            {edit.eventType === 'Other' && (
              <TextField label="Custom Event Type *" value={edit.customEventType} onChangeText={(t) => setE('customEventType', t)} placeholder="e.g. Pet Adoption Drive" />
            )}
            <View style={{ height: spacing.md }} />
            <Row style={{ gap: spacing.md }}>
              <TextField half label="Date *" value={edit.date} onChangeText={(t) => setE('date', t)} placeholder="YYYY-MM-DD" />
              <TextField half label="Time *" value={edit.time} onChangeText={(t) => setE('time', t)} placeholder="19:00" />
            </Row>
            <TextField label="Capacity" value={edit.capacity} onChangeText={(t) => setE('capacity', t)} keyboardType="numeric" />
            <TextField label="Description" value={edit.description} onChangeText={(t) => setE('description', t)} multiline />
            
            <Divider />

            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Event Mode *</Text>
            <Chips options={['Onsite', 'Virtual', 'Hybrid']} value={edit.eventMode} onChange={(v) => setE('eventMode', v)} />
            
            {(edit.eventMode === 'Onsite' || edit.eventMode === 'Hybrid') && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Physical Venue Details</Text>
                <TextField label="Venue Name *" value={edit.venueName} onChangeText={(t) => setE('venueName', t)} placeholder="e.g. The Grand Ballroom" />
                <TextField label="Address Line 1 *" value={edit.venueAddressLine1} onChangeText={(t) => setE('venueAddressLine1', t)} placeholder="Street address" />
                <TextField label="Address Line 2 (Optional)" value={edit.venueAddressLine2} onChangeText={(t) => setE('venueAddressLine2', t)} placeholder="Apartment, suite, unit, etc." />
                <Row style={{ gap: spacing.md }}>
                  <TextField half label="City *" value={edit.venueCity} onChangeText={(t) => setE('venueCity', t)} placeholder="City" />
                  <TextField half label="State *" value={edit.venueState} onChangeText={(t) => setE('venueState', t)} placeholder="State" />
                </Row>
                <Row style={{ gap: spacing.md }}>
                  <TextField half label="Country *" value={edit.venueCountry} onChangeText={(t) => setE('venueCountry', t)} placeholder="Country" />
                  <TextField half label="Postal Code *" value={edit.venuePostalCode} onChangeText={(t) => setE('venuePostalCode', t)} placeholder="ZIP/Postal Code" />
                </Row>
                <TextField label="Location Map Link (Optional)" value={edit.venueMapLink} onChangeText={(t) => setE('venueMapLink', t)} placeholder="e.g. https://maps.google.com/?q=..." />
                <TextField label="Additional Venue Info (Optional)" value={edit.venueInstructions} onChangeText={(t) => setE('venueInstructions', t)} placeholder="e.g. Parking instructions, gate number" multiline />
              </View>
            )}

            {(edit.eventMode === 'Virtual' || edit.eventMode === 'Hybrid') && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Virtual Meeting Details</Text>
                <Text style={[font.tiny, { fontWeight: '700', marginBottom: spacing.xs, color: colors.textMuted }]}>Meeting Platform</Text>
                <Chips options={MEETING_PLATFORMS} value={edit.meetingPlatform} onChange={(v) => setE('meetingPlatform', v)} />
                <View style={{ height: spacing.xs }} />
                <TextField label="Meeting Link *" value={edit.meetingLink} onChangeText={(t) => setE('meetingLink', t)} placeholder="e.g. Zoom or Meet URL" />
                <Row style={{ gap: spacing.md }}>
                  <TextField half label="Meeting ID (Optional)" value={edit.meetingId} onChangeText={(t) => setE('meetingId', t)} placeholder="ID" />
                  <TextField half label="Passcode (Optional)" value={edit.meetingPasscode} onChangeText={(t) => setE('meetingPasscode', t)} placeholder="Passcode" />
                </Row>
                <TextField label="Joining Instructions (Optional)" value={edit.meetingInstructions} onChangeText={(t) => setE('meetingInstructions', t)} placeholder="e.g. Please join 10 minutes early" multiline />
              </View>
            )}
          </Card>

          <SectionTitle>Dress Code</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { fontWeight: '700', marginBottom: spacing.sm, color: colors.text }]}>Attire Type</Text>
            <Chips options={DRESS_CODES} value={edit.dressCode} onChange={(v) => setE('dressCode', v)} />
            
            {edit.dressCode === 'Other' && (
              <TextField label="Custom Dress Code" value={edit.customDressCode} onChangeText={(t) => setE('customDressCode', t)} placeholder="e.g. Wear something blue, Neon Party" />
            )}
            
            {edit.dressCode !== 'No Dress Code' && (
              <>
                <TextField label="Dress Code Description" value={edit.dressCodeDescription} onChangeText={(t) => setE('dressCodeDescription', t)} placeholder="Describe the style or vibe…" multiline />
                <TextField label="Things to Avoid" value={edit.dressCodeAvoid} onChangeText={(t) => setE('dressCodeAvoid', t)} placeholder="e.g. Please avoid shorts and flip-flops" />
                <TextField label="Additional Instructions" value={edit.dressCodeInstructions} onChangeText={(t) => setE('dressCodeInstructions', t)} placeholder="e.g. All guests are requested to wear white attire" />

                <Text style={[font.small, { fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm, color: colors.text }]}>Outfit Inspiration Reference Photo</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
                  {DRESS_CODE_COVER_PRESETS.map((url) => {
                    const on = edit.dressCodeCover === url;
                    return (
                      <TouchableOpacity key={url} activeOpacity={0.85} onPress={() => setE('dressCodeCover', url)} style={{ width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden', borderWidth: on ? 3 : 0, borderColor: colors.primary }}>
                        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </Card>

          <SectionTitle>Recurrence</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { marginBottom: spacing.sm }]}>Repeat this event as a series.</Text>
            <Chips options={['None', 'Weekly', 'Monthly']} value={edit.seriesType} onChange={(v) => setE('seriesType', v)} />
          </Card>

          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Require RSVP approval" value={edit.approvalRequired} onValueChange={(v) => setE('approvalRequired', v)} icon="shield-checkmark-outline" />
            <Toggle label="Automatic Check-In" desc="Scan QR to instantly check in all guests" value={edit.autoCheckIn} onValueChange={(v) => setE('autoCheckIn', v)} icon="flash-outline" />
            <Toggle label="Allow guest messaging" value={edit.messagingEnabled} onValueChange={(v) => setE('messagingEnabled', v)} icon="chatbubbles-outline" />
            <Toggle label="Allow guest self-edit" value={edit.allowSelfEdit} onValueChange={(v) => setE('allowSelfEdit', v)} icon="create-outline" />
            <Toggle label="Paid ticket" value={edit.enablePayments} onValueChange={(v) => setE('enablePayments', v)} icon="card-outline" />
            <Toggle label="Age restriction" desc="Collect DOB at RSVP; block guests under the minimum age" value={edit.ageRestricted} onValueChange={(v) => setE('ageRestricted', v)} icon="lock-closed-outline" />
            {edit.ageRestricted ? (
              <>
                <TextField label="Minimum age" value={edit.minimumAge} onChangeText={(t) => setE('minimumAge', t)} placeholder="18" keyboardType="numeric" />
                <Chips options={['13', '16', '18', '21']} value={edit.minimumAge} onChange={(v) => setE('minimumAge', v)} />
              </>
            ) : null}
          </Card>
          <Button label="Save settings" variant="primary" icon="checkmark-circle" style={{ marginBottom: spacing.md }} onPress={saveSettings} />
          <Button label="Delete event" variant="danger" icon="trash-outline" onPress={removeEvent} />
        </View>
      )}

      {active === 'checkin' && (
        <View>
          {/* A. Scan / Verify card */}
          <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
            <View style={[styles.qrTile]}>
              <Ionicons name="qr-code-outline" size={64} color={colors.primary} />
            </View>
            <Button
              label={scanning ? 'Scanning…' : 'Scan QR code'}
              variant="primary"
              icon="qr-code-outline"
              style={{ marginTop: spacing.md }}
              onPress={() => { setScanning(true); setScanResult(null); }}
            />

            {scanning ? (
              <View style={{ width: '100%', marginTop: spacing.md }}>
                <View style={styles.viewfinder}>
                  <Ionicons name="qr-code-outline" size={88} color={colors.primary} />
                  <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
                  <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
                </View>
                <Text style={[font.tiny, { marginTop: spacing.md, marginBottom: spacing.sm, fontWeight: '700', color: colors.text, lineHeight: 16 }]}>
                  Demo (no camera): tap a guest to simulate scanning their QR pass
                </Text>
                {eventRsvps.filter((r) => r.status === 'going').map((r) => {
                  const rcs = getCheckinState(r);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      activeOpacity={0.8}
                      style={styles.scanPassRow}
                      onPress={() => { setScanResult(validateScan(event.id, r.id)); setScanning(false); setArriving(1); }}
                    >
                      <Avatar seed={r.name} size={32} />
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}</Text>
                        <Text style={font.tiny} numberOfLines={1}>Pass {r.id} · {rcs.label}</Text>
                      </View>
                      <Ionicons name="scan-outline" size={20} color={colors.primary} style={{ marginLeft: spacing.sm }} />
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={() => setScanning(false)} activeOpacity={0.8} hitSlop={8} style={{ alignSelf: 'center', marginTop: spacing.md, minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md }}>
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Close scanner</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <Divider />
            <View style={{ width: '100%' }}>
              <TextField label="Enter pass ID manually" value={passInput} onChangeText={setPassInput} placeholder="e.g. r1024" />
              <Button
                label="Verify"
                variant="outline"
                icon="checkmark-circle"
                onPress={() => {
                  const res = validateScan(event.id, passInput);
                  setScanResult(res);
                  setArriving(1);
                }}
              />
            </View>
          </Card>

          {/* B. Scan result */}
          {scanResult && scanResult.rsvp ? (
            <View style={{ marginTop: spacing.lg }}>
              <GuestCheckinDetail
                rsvp={scanResult.rsvp}
                event={event}
                result={scanResult}
                scannerName="Host"
                canCheckin
                canViewHistory
              />
              <Button label="Scan next guest" variant="primary" icon="qr-code-outline" style={{ marginTop: spacing.lg }} onPress={() => { setScanResult(null); setPassInput(''); }} />
            </View>
          ) : null}

          {scanResult && !scanResult.rsvp ? (
            <Card style={[styles.scanResultCard, { marginBottom: spacing.lg, borderColor: colors.red, backgroundColor: colors.redTint }]}>
              <Row style={{ marginBottom: spacing.sm }}>
                <Ionicons name="close-circle" size={22} color={colors.red} />
                <Text style={[font.h3, { marginLeft: spacing.sm, color: colors.text }]}>Entry denied</Text>
              </Row>
              <Text style={[font.small, { color: colors.text }]}>{scanResult.message}</Text>
              <Button label="Scan another" variant="outline" small style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} onPress={() => { setScanResult(null); setPassInput(''); }} />
            </Card>
          ) : null}

          {/* C. Going guests list */}
          <SectionTitle>Going guests</SectionTitle>
          <Card>
            {eventRsvps.filter((r) => r.status === 'going').length === 0 ? (
              <Text style={font.small}>No going guests yet.</Text>
            ) : (
              eventRsvps
                .filter((r) => r.status === 'going')
                .map((r, i) => (
                  <View key={r.id}>
                    {i > 0 ? <Divider /> : null}
                    <Row style={{ marginBottom: spacing.sm }}>
                      <Avatar seed={r.name} size={36} />
                      <View style={{ marginLeft: spacing.md, flex: 1 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }} numberOfLines={1}>{r.name}</Text>
                        <Text style={font.tiny} numberOfLines={1}>{r.email}</Text>
                      </View>
                    </Row>
                    <AttendeeCheckinControls r={r} />
                  </View>
                ))
            )}
          </Card>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  iconTile: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red },
  capTrack: { height: 10, backgroundColor: colors.surfaceHover, borderRadius: radius.full, marginTop: spacing.sm, overflow: 'hidden' },
  capFill: { height: 10, backgroundColor: colors.primary, borderRadius: radius.full },
  pollTrack: { height: 8, backgroundColor: colors.surfaceHover, borderRadius: radius.full, marginTop: 4, overflow: 'hidden' },
  pollFill: { height: 8, backgroundColor: colors.primary, borderRadius: radius.full },
  qrTile: { width: 120, height: 120, borderRadius: radius.lg, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { height: 184, borderRadius: radius.md, backgroundColor: '#0f0f14', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.primary },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3 },
  scanPassRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  csBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
  scanResultCard: { borderWidth: 1 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceHover },
  roleChipOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  roleChipTxt: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  roleChipTxtOn: { color: colors.primary },
  checkinStat: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceHover, borderRadius: radius.md, paddingVertical: spacing.sm },
  checkinStatNum: { fontSize: 22, fontWeight: '800', color: colors.text },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHover },
  histChip: { alignItems: 'center', backgroundColor: colors.surfaceHover, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minWidth: 72 },
  histChipNum: { fontSize: 18, fontWeight: '800', color: colors.text },
  photoThumb: { width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.surfaceHover },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  photoCell: { width: '33.33%', aspectRatio: 1, padding: 4, position: 'relative' },
  photoImg: { width: '100%', height: '100%', borderRadius: radius.sm, backgroundColor: colors.surfaceHover },
  photoDel: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  photoTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  photoTagTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
