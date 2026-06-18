import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, shadow, avatarUrl } from '../../theme/theme';
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
  ToggleRow,
  Tabs,
  EmptyState,
  ScreenHeader,
  ApprovalBadge,
  ListItemIcon,
} from '../../components/ui';
import {
  events,
  conversations,
  roles,
  staff,
  auditTrail,
  PERMISSION_LABELS,
  getEvent,
  getRsvps,
  useStore,
  checkInGuest,
} from '../../data/mock';

const MANAGE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'guests', label: 'Guests' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'staff', label: 'Staff & Roles' },
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
  useStore(); // reflect live check-ins done by staff at the gate
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

  return (
    <Screen>
      <ScreenHeader title={event.title} subtitle={event.date} onBack={() => navigation.goBack()} />
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
              <Text style={font.small}>
                {goingApproved.length} / {event.capacity}
              </Text>
            </Row>
            <View style={styles.capTrack}>
              <View
                style={[
                  styles.capFill,
                  { width: `${Math.min(100, (goingApproved.length / event.capacity) * 100)}%` },
                ]}
              />
            </View>
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
                    <Text style={font.tiny}>
                      {a.actor} · {a.time}
                    </Text>
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
                      <Text style={[font.tiny, { marginTop: 2 }]}>
                        {r.status} · {r.guestCount} guest(s)
                      </Text>
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
            <Text style={[font.small, { marginBottom: spacing.md }]}>
              Event at capacity ({goingApproved.length}/{event.capacity})
            </Text>
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
                        <Button
                          label="Approve & Allow In"
                          variant="accent"
                          small
                          onPress={() => alert('Approve & Allow In', r.name)}
                        />
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
            <Text style={[font.h3, { marginBottom: spacing.md }]}>Confirmed attendees</Text>
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
                          <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>{r.name}</Text>
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
                          <Button label="Check in" small variant="accent" onPress={() => checkInGuest(r.id, 'Alex Rivera (Host)')} />
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

      {active === 'messaging' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <ToggleRow label="Allow guest messaging" value={event.messagingEnabled} icon="chatbubbles-outline" />
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
                              <Text style={{ fontWeight: '700', fontSize: 14, color: colors.text }}>
                                {c.guestName}
                              </Text>
                              {c.unread ? <View style={styles.unreadDot} /> : null}
                            </Row>
                            <Text style={font.tiny} numberOfLines={1}>
                              {last ? last.text : ''}
                            </Text>
                          </View>
                        </Row>
                      </View>
                    );
                  })
              )}
            </Card>
          ) : (
            <Card>
              <Text style={[font.small, { textAlign: 'center' }]}>
                Messaging is off for this event — guests don't see the message option.
              </Text>
            </Card>
          )}
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
            <Text style={[font.small, { fontWeight: '700', color: colors.text, marginBottom: spacing.sm }]}>
              Invite a team member
            </Text>
            <Field label="Name" placeholder="Full name" />
            <Field label="Email" placeholder="name@email.com" keyboardType="email-address" />
            <Text style={[font.tiny, { fontWeight: '700', color: colors.text, marginBottom: 6 }]}>Role</Text>
            <Tabs
              tabs={roles.map((r) => ({ key: r.name, label: r.name }))}
              active={inviteRole}
              onChange={setInviteRole}
            />
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
                      <Text style={[font.tiny, { marginTop: 2, color: colors.primary, fontWeight: '700' }]}>
                        {permCount} perms
                      </Text>
                    </View>
                    <Button label="Edit" variant="outline" small onPress={() => alert('Edit role', r.name)} />
                  </Row>
                </View>
              );
            })}
            <Button
              label="New role"
              variant="outline"
              icon="add"
              style={{ marginTop: spacing.md }}
              onPress={() => alert('New role')}
            />
            <Divider />
            <TouchableOpacity onPress={() => setShowPerms((v) => !v)} activeOpacity={0.8}>
              <Row style={styles.between}>
                <Text style={[font.small, { fontWeight: '700', color: colors.text }]}>
                  Example permission checklist
                </Text>
                <Ionicons name={showPerms ? 'chevron-forward' : 'chevron-forward'} size={16} color={colors.textMuted} />
              </Row>
            </TouchableOpacity>
            {showPerms &&
              PERMISSION_LABELS.map((p) => {
                const on = roles[0].permissions[p.key];
                return (
                  <Row key={p.key} style={{ marginTop: spacing.sm }}>
                    <Ionicons
                      name={on ? 'checkmark-circle' : 'ellipse'}
                      size={15}
                      color={on ? colors.accent : colors.border}
                    />
                    <Text style={[font.small, { marginLeft: 6, color: colors.text }]}>{p.label}</Text>
                  </Row>
                );
              })}
          </Card>
        </View>
      )}

      {active === 'settings' && (
        <View>
          <Card style={{ marginBottom: spacing.lg }}>
            <Field label="Event title" value={event.title} />
            <Field label="Date" value={event.date} />
            <Field label="Time" value={event.time} />
            <Field label="Location" value={event.location} />
            <Field label="Capacity" value={String(event.capacity)} keyboardType="numeric" />
            <Field label="Description" value={event.description} multiline />
          </Card>
          <Card style={{ marginBottom: spacing.lg }}>
            <ToggleRow label="Require RSVP approval" value={event.approvalRequired} icon="shield-checkmark-outline" />
            <ToggleRow label="Allow guest messaging" value={event.messagingEnabled} icon="chatbubbles-outline" />
            <ToggleRow label="Allow guest self-edit" value icon="create-outline" />
            <ToggleRow label="Paid ticket" value={event.enablePayments} icon="card-outline" />
          </Card>
          <Button
            label="Save settings"
            variant="primary"
            icon="checkmark-circle"
            style={{ marginBottom: spacing.md }}
            onPress={() => alert('Save settings')}
          />
          <Button
            label="Delete event"
            variant="danger"
            icon="trash-outline"
            onPress={() => alert('Delete event')}
          />
        </View>
      )}

      {active === 'checkin' && (
        <View>
          <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
            <View style={[styles.qrTile]}>
              <Ionicons name="qr-code-outline" size={64} color={colors.primary} />
            </View>
            <Button
              label="Scan QR code"
              variant="primary"
              icon="qr-code-outline"
              style={{ marginTop: spacing.md }}
              onPress={() => Alert.alert('Scan QR code', 'Camera unavailable in prototype')}
            />
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
                      <Button label="Check in" small variant="accent" onPress={() => checkInGuest(r.id, 'Alex Rivera (Host)')} />
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
  capTrack: {
    height: 10,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  capFill: { height: 10, backgroundColor: colors.primary, borderRadius: radius.full },
  qrTile: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
