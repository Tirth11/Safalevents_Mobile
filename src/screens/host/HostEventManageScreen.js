import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Linking, Share, Platform } from 'react-native';
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
} from '../../components/ui';
import {
  events,
  conversations,
  roles,
  staff,
  auditTrail,
  outbox,
  PERMISSION_LABELS,
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
} from '../../data/mock';

const MANAGE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'guests', label: 'Guests' },
  { key: 'invites', label: 'Invitations' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'polls', label: 'Polls' },
  { key: 'comments', label: 'Comments' },
  { key: 'staff', label: 'Staff & Roles' },
  { key: 'payments', label: 'Payments' },
  { key: 'logs', label: 'Notification Logs' },
  { key: 'settings', label: 'Settings' },
  { key: 'checkin', label: 'Check-in' },
];

function Answers({ answers }) {
  const entries = Object.entries(answers || {});
  if (!entries.length) return null;
  return (
    <View style={{ marginTop: 6 }}>
      {entries.map(([q, a]) => (
        <Text key={q} style={font.tiny}>
          <Text style={{ fontWeight: '700' }}>{q} </Text>
          {a}
        </Text>
      ))}
    </View>
  );
}

export default function HostEventManageScreen({ navigation, route }) {
  useStore(); // reflect live check-ins / mutations
  const event = getEvent(route.params?.eventId) || events[0];
  const eventRsvps = getRsvps(event.id);
  const [active, setActive] = useState('overview');
  const [showPerms, setShowPerms] = useState(false);
  const [inviteRole, setInviteRole] = useState(roles[0]?.name);

  const goingApproved = eventRsvps.filter((r) => r.status === 'going' && r.approvalState === 'APPROVED');
  const pending = eventRsvps.filter((r) => r.approvalState === 'UNDER_APPROVAL' && r.status !== 'waitlist');
  const waitlist = eventRsvps.filter((r) => r.status === 'waitlist');
  const rejected = eventRsvps.filter((r) => r.approvalState === 'REJECTED');

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

  // ── Broadcast ──
  const [bcast, setBcast] = useState('');
  const sendBroadcast = () => {
    if (!bcast.trim()) { Alert.alert('Empty message', 'Write a message to send.'); return; }
    const n = broadcast(event.id, bcast.trim());
    setBcast('');
    Alert.alert('Broadcast sent', `Message queued to ${n} guest(s). See Notification Logs.`);
  };

  // ── Settings edit ──
  const [edit, setEdit] = useState({
    title: event.title, date: event.date, time: event.time, location: event.location,
    capacity: String(event.capacity || ''), description: event.description,
    seriesType: event.seriesType || 'None',
    approvalRequired: !!event.approvalRequired, messagingEnabled: event.messagingEnabled !== false,
    allowSelfEdit: !!event.allowSelfEdit, enablePayments: !!event.enablePayments,
  });
  const setE = (k, v) => setEdit((p) => ({ ...p, [k]: v }));
  const saveSettings = () => {
    updateEvent(event.id, {
      title: edit.title, date: edit.date, time: edit.time, location: edit.location,
      capacity: Number(edit.capacity) || 0, description: edit.description, seriesType: edit.seriesType,
      approvalRequired: edit.approvalRequired, messagingEnabled: edit.messagingEnabled,
      allowSelfEdit: edit.allowSelfEdit, enablePayments: edit.enablePayments,
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
    const header = 'Name,Email,Phone,Status,Guests,CheckedIn';
    const rows = eventRsvps.map((r) => `${r.name},${r.email},${r.phone || ''},${r.status},${r.guestCount || 1},${r.checkedIn ? 'Yes' : 'No'}`);
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
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
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
            <TextField value={bcast} onChangeText={setBcast} placeholder="Compose a broadcast to all confirmed guests…" multiline />
            <Row style={{ gap: 10 }}>
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
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{a.action}</Text>
                    <Text style={font.tiny}>{a.actor} · {a.time}</Text>
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
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={[styles.between, { marginBottom: spacing.md }]}>
              <Row>
                <Text style={[font.h3, { marginRight: spacing.sm }]}>Under Approval</Text>
                <Badge tone="amber" label={String(pending.length)} />
              </Row>
              <Button label="Approve all" variant="accent" small onPress={() => alert('Approve all')} />
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
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                      <Text style={font.tiny}>{r.email}</Text>
                      <Text style={[font.tiny, { marginTop: 2 }]}>{r.status} · {r.guestCount} guest(s)</Text>
                      <Answers answers={r.answers} />
                      <Row style={{ marginTop: spacing.sm }}>
                        <Button label="Approve" variant="accent" small onPress={() => alert('Approve', r.name)} />
                        <View style={{ width: spacing.sm }} />
                        <Button label="Reject" variant="danger" small onPress={() => alert('Reject', r.name)} />
                      </Row>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>

          <Card style={{ marginBottom: spacing.lg }}>
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
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                      <Text style={font.tiny}>{r.email}</Text>
                      <Answers answers={r.answers} />
                      <Row style={{ marginTop: spacing.sm }}>
                        <Button label="Approve & Allow In" variant="accent" small onPress={() => alert('Approve & Allow In', r.name)} />
                        <View style={{ width: spacing.sm }} />
                        <Button label="Reject" variant="danger" small onPress={() => alert('Reject', r.name)} />
                      </Row>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>

          {rejected.length > 0 && (
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={[font.h3, { marginBottom: spacing.md }]}>Rejected</Text>
              {rejected.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={[styles.between, { alignItems: 'flex-start' }]}>
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                      <Text style={font.tiny}>{r.rejectionReason || 'No reason given.'}</Text>
                    </View>
                    <Button label="Re-open" variant="outline" small onPress={() => alert('Re-open', r.name)} />
                  </Row>
                </View>
              ))}
            </Card>
          )}

          <Card>
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
                      <Row style={styles.between}>
                        <View style={{ flex: 1, paddingRight: spacing.sm }}>
                          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}{r.manual ? '  ·  added manually' : ''}</Text>
                          <Text style={font.tiny}>{r.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => alert('Remove guest', r.name)}>
                          <Ionicons name="trash-outline" size={18} color={colors.red} />
                        </TouchableOpacity>
                      </Row>
                      <Answers answers={r.answers} />
                      <View style={{ marginTop: spacing.sm }}>
                        {r.checkedIn ? (
                          <Badge tone="green" dot label={`Arrived${r.checkedInAt ? ' · ' + new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`} />
                        ) : (
                          <Button label="Check in" small variant="accent" onPress={() => checkInGuest(r.id, 'Host')} />
                        )}
                      </View>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'invites' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Add guest manually</Text>
            <Text style={[font.small, { marginBottom: spacing.md }]}>Creates an approved RSVP (respects capacity).</Text>
            <TextField label="Name" value={mg.name} onChangeText={(t) => setMg({ ...mg, name: t })} placeholder="Full name" />
            <TextField label="Email" value={mg.email} onChangeText={(t) => setMg({ ...mg, email: t })} placeholder="name@email.com" keyboardType="email-address" />
            <Row style={{ gap: 10 }}>
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
                      <Text style={font.tiny}>{o.to} · {o.time}</Text>
                    </View>
                    <Badge tone={o.channel === 'SMS' ? 'blue' : 'primary'} label={o.channel} />
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'messaging' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <ToggleRow label="Allow guest messaging" value={event.messagingEnabled} icon="chatbubbles-outline" />
          </Card>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Broadcast to all guests</Text>
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
                              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{c.guestName}</Text>
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
                  <TouchableOpacity onPress={() => setPollOpts((p) => p.filter((_, idx) => idx !== i))} style={{ marginTop: 14, marginLeft: 8 }} hitSlop={8}>
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
                        <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }}>{c.name}</Text>
                        <TouchableOpacity onPress={() => deleteComment(c.id)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={16} color={colors.red} />
                        </TouchableOpacity>
                      </Row>
                      <Text style={[font.small, { color: colors.text, marginTop: 2 }]}>{c.text}</Text>
                      <Text style={font.tiny}>{c.time}</Text>
                    </View>
                  </Row>
                </View>
              ))
            )}
          </Card>
        </View>
      )}

      {active === 'staff' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.md }]}>Team members</Text>
            {staff.filter((s) => s.eventId === event.id).length === 0 ? (
              <Text style={[font.small, { marginBottom: spacing.md }]}>No team members yet.</Text>
            ) : (
              staff
                .filter((s) => s.eventId === event.id)
                .map((s, i) => (
                  <View key={s.id}>
                    {i > 0 ? <Divider /> : null}
                    <Row style={styles.between}>
                      <Row style={{ flex: 1 }}>
                        <Avatar seed={s.name} size={40} />
                        <View style={{ marginLeft: spacing.md, flex: 1 }}>
                          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{s.name}</Text>
                          <Text style={font.tiny}>{s.roleName}</Text>
                        </View>
                      </Row>
                      <Badge tone={s.status === 'ACTIVE' ? 'green' : 'amber'} label={s.status} />
                      <TouchableOpacity style={{ marginLeft: spacing.md }} onPress={() => alert('Remove staff', s.name)}>
                        <Ionicons name="trash-outline" size={18} color={colors.red} />
                      </TouchableOpacity>
                    </Row>
                  </View>
                ))
            )}
            <Divider />
            <Text style={[font.small, { fontWeight: '700', color: colors.text, marginBottom: spacing.sm }]}>Invite a team member</Text>
            <Field label="Name" placeholder="Full name" />
            <Field label="Email" placeholder="name@email.com" keyboardType="email-address" />
            <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 6 }]}>Role</Text>
            <Tabs tabs={roles.map((r) => ({ key: r.name, label: r.name }))} active={inviteRole} onChange={setInviteRole} />
            <Button label="Send invite" variant="primary" icon="mail-outline" onPress={() => alert('Send invite')} />
          </Card>

          <Card>
            <Text style={[font.h3, { marginBottom: spacing.md }]}>Roles & permissions</Text>
            {roles.map((r, i) => {
              const permCount = Object.values(r.permissions).filter(Boolean).length;
              return (
                <View key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={[styles.between, { alignItems: 'flex-start' }]}>
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                      <Text style={font.tiny}>{r.description}</Text>
                      <Text style={[font.tiny, { marginTop: 2, color: colors.primary, fontWeight: '700' }]}>{permCount} perms</Text>
                    </View>
                    <Button label="Edit" variant="outline" small onPress={() => alert('Edit role', r.name)} />
                  </Row>
                </View>
              );
            })}
            <Button label="New role" variant="outline" icon="add" style={{ marginTop: spacing.md }} onPress={() => alert('New role')} />
            <Divider />
            <TouchableOpacity onPress={() => setShowPerms((v) => !v)} activeOpacity={0.8}>
              <Row style={styles.between}>
                <Text style={[font.small, { fontWeight: '700', color: colors.text }]}>Example permission checklist</Text>
                <Ionicons name={showPerms ? 'chevron-down' : 'chevron-forward'} size={16} color={colors.textMuted} />
              </Row>
            </TouchableOpacity>
            {showPerms &&
              PERMISSION_LABELS.map((p) => {
                const on = roles[0].permissions[p.key];
                return (
                  <Row key={p.key} style={{ marginTop: spacing.sm }}>
                    <Ionicons name={on ? 'checkmark-circle' : 'ellipse'} size={15} color={on ? colors.accent : colors.border} />
                    <Text style={[font.small, { marginLeft: 6, color: colors.text }]}>{p.label}</Text>
                  </Row>
                );
              })}
          </Card>
        </View>
      )}

      {active === 'payments' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Row style={styles.between}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={font.h3}>Payments</Text>
                <Text style={font.small}>{event.enablePayments ? `Paid event · $${event.ticketPrice || 0} per ticket` : 'Free event'}</Text>
              </View>
              <Badge tone={event.enablePayments ? 'green' : 'gray'} label={event.enablePayments ? 'Enabled' : 'Off'} />
            </Row>
          </Card>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Payout bank account</Text>
            <TextField label="Bank name" value={bank.bankName} onChangeText={(t) => setBank({ ...bank, bankName: t })} placeholder="Chase Bank" />
            <TextField label="Account holder name" value={bank.holderName} onChangeText={(t) => setBank({ ...bank, holderName: t })} placeholder="Alex Rivera" />
            <Row style={{ gap: 10 }}>
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
                    <View style={[styles.iconTile, { backgroundColor: o.channel === 'SMS' ? colors.blueTint : colors.primaryTint }]}>
                      <Ionicons name={o.channel === 'SMS' ? 'call-outline' : 'mail-outline'} size={14} color={o.channel === 'SMS' ? colors.blue : colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={{ fontWeight: '700', fontSize: 13.5, color: colors.text }} numberOfLines={1}>{o.subject}</Text>
                      <Text style={font.tiny}>To {o.to} · {o.channel} · {o.time}</Text>
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
            <TextField label="Event title" value={edit.title} onChangeText={(t) => setE('title', t)} />
            <Row style={{ gap: 10 }}>
              <TextField half label="Date" value={edit.date} onChangeText={(t) => setE('date', t)} placeholder="YYYY-MM-DD" />
              <TextField half label="Time" value={edit.time} onChangeText={(t) => setE('time', t)} placeholder="19:00" />
            </Row>
            <TextField label="Location" value={edit.location} onChangeText={(t) => setE('location', t)} />
            <TextField label="Capacity" value={edit.capacity} onChangeText={(t) => setE('capacity', t)} keyboardType="numeric" />
            <TextField label="Description" value={edit.description} onChangeText={(t) => setE('description', t)} multiline />
          </Card>

          <SectionTitle>Recurrence</SectionTitle>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[font.small, { marginBottom: spacing.sm }]}>Repeat this event as a series.</Text>
            <Chips options={['None', 'Weekly', 'Monthly']} value={edit.seriesType} onChange={(v) => setE('seriesType', v)} />
          </Card>

          <Card style={{ marginBottom: spacing.lg }}>
            <Toggle label="Require RSVP approval" value={edit.approvalRequired} onValueChange={(v) => setE('approvalRequired', v)} icon="shield-checkmark-outline" />
            <Toggle label="Allow guest messaging" value={edit.messagingEnabled} onValueChange={(v) => setE('messagingEnabled', v)} icon="chatbubbles-outline" />
            <Toggle label="Allow guest self-edit" value={edit.allowSelfEdit} onValueChange={(v) => setE('allowSelfEdit', v)} icon="create-outline" />
            <Toggle label="Paid ticket" value={edit.enablePayments} onValueChange={(v) => setE('enablePayments', v)} icon="card-outline" />
          </Card>
          <Button label="Save settings" variant="primary" icon="checkmark-circle" style={{ marginBottom: spacing.md }} onPress={saveSettings} />
          <Button label="Delete event" variant="danger" icon="trash-outline" onPress={removeEvent} />
        </View>
      )}

      {active === 'checkin' && (
        <View>
          <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
            <View style={[styles.qrTile]}>
              <Ionicons name="qr-code-outline" size={64} color={colors.primary} />
            </View>
            <Button label="Scan QR code" variant="primary" icon="qr-code-outline" style={{ marginTop: spacing.md }} onPress={() => Alert.alert('Scan QR code', 'Camera unavailable in prototype')} />
            <Divider />
            <View style={{ width: '100%' }}>
              <Field label="Enter pass ID manually" placeholder="e.g. PASS-1024" />
              <Button label="Verify" variant="outline" icon="checkmark-circle" onPress={() => alert('Verify')} />
            </View>
          </Card>

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
                    <Row style={{ marginBottom: 6 }}>
                      <Avatar seed={r.name} size={36} />
                      <View style={{ marginLeft: spacing.md, flex: 1 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
                        <Text style={font.tiny}>{r.email}</Text>
                      </View>
                    </Row>
                    {r.checkedIn ? (
                      <Badge tone="green" dot label={`Arrived${r.checkedInAt ? ' · ' + new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`} />
                    ) : (
                      <Button label="Check in" small variant="accent" onPress={() => checkInGuest(r.id, 'Host')} />
                    )}
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
});
