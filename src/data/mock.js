// Mock data + a tiny in-memory live store for the prototype. Arrays below are the
// seed; the store layer at the bottom lets staff check-in mutate state and have
// the host dashboard reflect it (no real backend / persistence).
import { useState, useEffect } from 'react';

export const HOST = {
  name: 'Alex Rivera',
  email: 'alex@safalevent.com',
  phone: '+1 (555) 999-8888',
  avatarSeed: 'Alex Rivera',
};

export const GUEST = {
  name: 'Alice Vance',
  email: 'alice@example.com',
  phone: '+1 (555) 123-4567',
  avatarSeed: 'Alice Vance',
};

// ─── Accounts (unified login / signup) ──────────────────────────────────────
// Registered host/guest accounts. status: ACTIVE | PENDING_ADMIN_APPROVAL | REJECTED.
// Staff are NOT here — they join via an Invite ID (see `staff` + loginAsStaff).
export const users = [
  { role: 'host', hostType: 'individual', name: 'Alex Rivera', email: 'alex@safalevent.com', phone: '+1 (555) 999-8888', status: 'ACTIVE', avatarSeed: 'Alex Rivera' },
  {
    role: 'host',
    hostType: 'organization',
    orgName: 'Safal Foundation',
    name: 'Safal Foundation',
    email: 'org@safalevent.com',
    phone: '+1 (555) 777-6666',
    status: 'PENDING_ADMIN_APPROVAL',
    avatarSeed: 'Safal Foundation',
    // Org hosts upload verification docs INSIDE the app (never at signup).
    orgDocsUploaded: false,
    orgProfile: { orgName: 'Safal Foundation', orgType: 'NGO', website: 'https://safalfoundation.org', city: 'New York', state: 'NY', docs: [] },
  },
  { role: 'guest', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'ACTIVE' },
];

export const events = [
  {
    id: '1',
    title: 'Summer Rooftop Mixer',
    date: '2026-08-15',
    time: '19:00',
    location: 'Penthouse Lounge, Manhattan, NY',
    city: 'New York City',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description:
      'Cocktails, high-fidelity music, and networking under the stars. Meet creatives, developers, and designers. Premium dress code.',
    eventType: 'Party',
    status: 'Published',
    capacity: 100,
    approvalRequired: false,
    messagingEnabled: true,
    enablePayments: false,
    ticketPrice: 0,
    hostName: 'Alex Rivera',
    hostEmail: 'alex@safalevent.com',
    rating: 4.8,
    questions: ['Any food allergies?', 'Song request for the DJ?'],
  },
  {
    id: '2',
    title: 'Tech Startup Meetup',
    date: '2026-09-02',
    time: '18:30',
    location: 'Venture Hub HQ, San Francisco, CA',
    city: 'San Francisco',
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    description:
      'Pitch your startup, find co-founders, talk to VCs. Free pizza & drinks. RSVP required for building security.',
    eventType: 'Meetup',
    status: 'Published',
    capacity: 6,
    approvalRequired: true,
    messagingEnabled: true,
    enablePayments: false,
    ticketPrice: 0,
    hostName: 'Jordan Chen',
    hostEmail: 'jordan@startup.com',
    rating: 4.5,
    questions: ['What are you building?', 'Looking for funding?'],
  },
  {
    id: '3',
    title: 'Community Yoga Session',
    date: '2026-06-25',
    time: '08:00',
    location: 'Central Park Great Lawn, NY',
    city: 'New York City',
    cover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    description: 'A relaxing morning yoga session for all skill levels. Bring your own mat and water.',
    eventType: 'Fitness',
    status: 'Published',
    capacity: 40,
    approvalRequired: false,
    messagingEnabled: false,
    enablePayments: false,
    ticketPrice: 0,
    hostName: 'Priya Patel',
    hostEmail: 'priya@yogalife.com',
    rating: 4.9,
    questions: ['Do you need a yoga mat?'],
  },
  {
    id: '5',
    title: 'Stand-up Comedy Night',
    date: '2026-07-10',
    time: '20:30',
    location: 'The Comedy Club, Manhattan, NY',
    city: 'New York City',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80',
    description: 'Five national touring headliners. Craft beers and cocktails available. Strictly 21+.',
    eventType: 'Comedy',
    status: 'Published',
    capacity: 80,
    approvalRequired: false,
    messagingEnabled: true,
    enablePayments: true,
    ticketPrice: 25,
    hostName: 'Riley Morgan',
    hostEmail: 'riley@comedyclub.com',
    rating: 4.7,
    questions: [],
  },
];

// approvalState: UNDER_APPROVAL | APPROVED | REJECTED  (orthogonal to status)
export const rsvps = [
  { id: 'r1', eventId: '1', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'going', approvalState: 'APPROVED', checkedIn: true, guestCount: 2, timestamp: '2026-06-01T12:00:00Z', answers: { 'Any food allergies?': 'None', 'Song request for the DJ?': 'Levitating' } },
  { id: 'r2', eventId: '1', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 234-5678', status: 'going', approvalState: 'APPROVED', checkedIn: false, guestCount: 1, timestamp: '2026-06-02T14:30:00Z', answers: { 'Any food allergies?': 'Gluten-free' } },
  { id: 'r3', eventId: '1', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 345-6789', status: 'going', approvalState: 'APPROVED', checkedIn: false, guestCount: 1, timestamp: '2026-06-03T09:15:00Z', answers: {} },
  // Event 2 — approval required: a mix of pending / approved / waitlisted-pending
  { id: 'r6', eventId: '2', name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '+1 (555) 678-9012', status: 'going', approvalState: 'UNDER_APPROVAL', checkedIn: false, guestCount: 1, timestamp: '2026-06-05T11:00:00Z', answers: { 'What are you building?': 'EcoClean Tech', 'Looking for funding?': 'Yes, seed' } },
  { id: 'r7', eventId: '2', name: 'George Costanza', email: 'george@example.com', phone: '+1 (555) 789-0123', status: 'going', approvalState: 'APPROVED', checkedIn: false, guestCount: 1, timestamp: '2026-06-06T15:20:00Z', answers: { 'What are you building?': 'Vandelay Industries' } },
  { id: 'r8', eventId: '2', name: 'Harvey Specter', email: 'harvey@example.com', phone: '+1 (555) 890-1234', status: 'waitlist', approvalState: 'UNDER_APPROVAL', checkedIn: false, guestCount: 1, timestamp: '2026-06-07T08:45:00Z', answers: { 'What are you building?': 'Pearson LegalTech' } },
  { id: 'r9', eventId: '2', name: 'Donna Paulsen', email: 'donna@example.com', phone: '+1 (555) 901-2345', status: 'going', approvalState: 'REJECTED', checkedIn: false, guestCount: 1, timestamp: '2026-06-07T10:00:00Z', rejectionReason: 'Event is for founders only.', answers: {} },
];

// What the demo guest (Alice) has RSVP'd to — used by the guest "My Tickets" screen.
export const myRsvps = [
  { ...rsvps[0], event: events[0] }, // Rooftop mixer — approved/confirmed
  { id: 'rg2', eventId: '2', name: 'Alice Vance', email: 'alice@example.com', status: 'going', approvalState: 'UNDER_APPROVAL', guestCount: 1, event: events[1], timestamp: '2026-06-08T10:00:00Z', answers: {} },
  { id: 'rg3', eventId: '5', name: 'Alice Vance', email: 'alice@example.com', status: 'waitlist', approvalState: 'UNDER_APPROVAL', guestCount: 1, event: events[3], timestamp: '2026-06-09T10:00:00Z', answers: {} },
];

export const conversations = [
  {
    id: 'c1',
    eventId: '1',
    eventTitle: 'Summer Rooftop Mixer',
    guestName: 'Alice Vance',
    hostName: 'Alex Rivera',
    unread: false,
    messages: [
      { sender: 'guest', text: 'Hi! Is there a dress code for the rooftop mixer?', time: 'Jun 2, 4:12 PM' },
      { sender: 'host', text: 'Hi Alice! Smart-casual is perfect. See you there!', time: 'Jun 2, 4:20 PM' },
    ],
  },
  {
    id: 'c2',
    eventId: '1',
    eventTitle: 'Summer Rooftop Mixer',
    guestName: 'Bob Smith',
    hostName: 'Alex Rivera',
    unread: true,
    messages: [{ sender: 'guest', text: 'Is there parking near the venue?', time: 'Jun 7, 2:30 PM' }],
  },
];

export const roles = [
  { id: 'role_coordinator', name: 'Coordinator', description: 'Runs the event: guests, approvals, check-in, messaging.', builtIn: true, permissions: { guests_view: true, guests_approve: true, guests_edit: true, guests_export: true, checkin: true, messaging_view: true, messaging_reply: true, history_view: true, settings_view: true, settings_edit: false, staff_manage: false } },
  { id: 'role_frontdesk', name: 'Front-desk', description: 'Check-in and door duty.', builtIn: true, permissions: { guests_view: true, guests_approve: false, guests_edit: true, guests_export: false, checkin: true, messaging_view: true, messaging_reply: false, history_view: true, settings_view: false, settings_edit: false, staff_manage: false } },
  { id: 'role_scanner', name: 'QR Scanner', description: 'Gate check-in only — scan guest QR codes to mark arrivals.', builtIn: true, permissions: { guests_view: false, guests_approve: false, guests_edit: false, guests_export: false, checkin: true, messaging_view: false, messaging_reply: false, history_view: false, settings_view: false, settings_edit: false, staff_manage: false } },
  { id: 'role_viewer', name: 'Viewer', description: 'Read-only access.', builtIn: true, permissions: { guests_view: true, guests_approve: false, guests_edit: false, guests_export: false, checkin: false, messaging_view: true, messaging_reply: false, history_view: true, settings_view: false, settings_edit: false, staff_manage: false } },
];

export const PERMISSION_LABELS = [
  { key: 'guests_view', label: 'View guest list' },
  { key: 'guests_approve', label: 'Approve / reject RSVPs' },
  { key: 'guests_edit', label: 'Edit guests & manual add' },
  { key: 'checkin', label: 'Gate check-in (QR scan)' },
  { key: 'guests_export', label: 'Export guest list' },
  { key: 'messaging_view', label: 'View messages' },
  { key: 'messaging_reply', label: 'Reply to guests' },
  { key: 'history_view', label: 'View history' },
  { key: 'settings_view', label: 'View settings' },
  { key: 'settings_edit', label: 'Edit settings' },
  { key: 'staff_manage', label: 'Manage staff & roles' },
];

export const staff = [
  { id: 'st_1', eventId: '1', name: 'Sam Carter', email: 'sam@safalevent.com', roleId: 'role_coordinator', roleName: 'Coordinator', inviteId: 'INV-SAM-2026', status: 'ACTIVE' },
  { id: 'st_2', eventId: '1', name: 'Gabe Nguyen', email: 'gabe@safalevent.com', roleId: 'role_scanner', roleName: 'QR Scanner', inviteId: 'INV-GATE-1', status: 'ACTIVE' },
  { id: 'st_3', eventId: '1', name: 'Maria Lopez', email: 'maria@safalevent.com', roleId: 'role_frontdesk', roleName: 'Front-desk', inviteId: 'INV-MARIA-9', status: 'INVITED' },
];

export const notifications = [
  { id: 'n1', type: 'rsvp', title: 'RSVP Awaiting Approval', message: 'Fiona Gallagher requested to join Tech Startup Meetup.', time: '30m ago', read: false },
  { id: 'n2', type: 'rsvp', title: 'Spot Opened — Review Waitlist', message: 'A spot opened for Tech Startup Meetup. Approve a waitlisted guest.', time: '1h ago', read: false },
  { id: 'n3', type: 'message', title: 'New Guest Message', message: 'Bob Smith messaged you about Summer Rooftop Mixer.', time: '2h ago', read: false },
  { id: 'n4', type: 'checkin', title: 'Guest Checked In', message: 'Alice Vance checked in to Summer Rooftop Mixer.', time: '4h ago', read: true },
];

export const auditTrail = [
  { id: 'a1', actor: 'Alex Rivera (Host)', action: 'Approved RSVP for George Costanza', time: 'Jun 8, 9:10 AM' },
  { id: 'a2', actor: 'Alice Vance (Guest)', action: 'RSVP registered with status: going', time: 'Jun 1, 12:00 PM' },
  { id: 'a3', actor: 'System', action: 'Promoted note: spot opened on Tech Startup Meetup', time: 'Jun 8, 9:05 AM' },
];

export const outbox = [
  { id: 'o1', to: 'fiona@example.com', channel: 'Email', subject: 'We received your RSVP — pending approval', time: 'Jun 5, 11:00 AM' },
  { id: 'o2', to: 'george@example.com', channel: 'Email', subject: "You're approved for Tech Startup Meetup!", time: 'Jun 8, 9:10 AM' },
  { id: 'o3', to: 'alice@example.com', channel: 'SMS', subject: 'RSVP Confirmation', time: 'Jun 1, 12:01 PM' },
];

export const payouts = [
  { id: 'po1', date: '2026-06-01', amount: 450.0, status: 'Paid', bank: 'Chase Bank (...1234)' },
  { id: 'po2', date: '2026-06-08', amount: 320.0, status: 'Processing', bank: 'Chase Bank (...1234)' },
];

// ─── Manage-event extras (Phase 3) ──────────────────────────────────────────
// Polls keyed by eventId. Each poll has options with a vote count.
export const polls = [
  {
    id: 'poll1',
    eventId: '1',
    question: 'Which welcome drink should we feature?',
    status: 'Published',
    options: [
      { id: 'op1', text: 'Aperol Spritz', votes: 14 },
      { id: 'op2', text: 'Classic Mojito', votes: 9 },
      { id: 'op3', text: 'Non-alcoholic Punch', votes: 6 },
    ],
  },
];

// Public event comments keyed by eventId.
export const comments = [
  { id: 'cm1', eventId: '1', name: 'Alice Vance', text: 'So excited for this! Is there a coat check?', time: 'Jun 6, 5:12 PM' },
  { id: 'cm2', eventId: '1', name: 'Bob Smith', text: 'The rooftop view last year was unreal. Count me in.', time: 'Jun 7, 9:40 AM' },
];

// Cover image presets (reuse the Unsplash URLs already used by seed events).
export const COVER_PRESETS = events.map((e) => e.cover).filter(Boolean);

// Named accent gradients used when creating an event.
export const ACCENT_THEMES = [
  { key: 'sunset', name: 'Sunset Coral', colors: ['#F2541B', '#F59E0B'] },
  { key: 'ocean', name: 'Ocean Indigo', colors: ['#0ea5e9', '#6366f1'] },
  { key: 'emerald', name: 'Emerald Forest', colors: ['#00A63E', '#0d9488'] },
  { key: 'midnight', name: 'Midnight', colors: ['#1e293b', '#7c3aed'] },
];

export const EVENT_TYPES = ['Party', 'Meetup', 'Meeting', 'Webinar', 'Workshop', 'Religious', 'Wedding', 'Other'];

// Helpers
export const getEvent = (id) => events.find((e) => e.id === id);
export const getRsvps = (eventId) => rsvps.filter((r) => r.eventId === eventId);
export const getRoleById = (id) => roles.find((r) => r.id === id) || null;
export const getPolls = (eventId) => polls.filter((p) => p.eventId === eventId);
export const getComments = (eventId) => comments.filter((c) => c.eventId === eventId);

// ─── Live store layer ─────────────────────────────────────────────────────────
// Minimal pub/sub so a staff check-in re-renders the host dashboard live.
let _version = 0;
const _subs = new Set();
function _notify() {
  _version += 1;
  _subs.forEach((fn) => fn(_version));
}

// Components call useStore() to re-render whenever store data changes.
export function useStore() {
  const [, set] = useState(_version);
  useEffect(() => {
    const fn = (v) => set(v);
    _subs.add(fn);
    return () => _subs.delete(fn);
  }, []);
  return _version;
}

// The signed-in staff member (set on "Login as Staff"). null otherwise.
let _currentStaff = null;
export const setCurrentStaff = (s) => { _currentStaff = s; _notify(); };
export const getCurrentStaff = () => _currentStaff;

// ─── Current host account ────────────────────────────────────────────────────
// Host screens read this instead of the hardcoded HOST. Default is the individual
// host (Alex Rivera, ACTIVE) so the normal full experience shows out of the box.
// Switching to the org demo account surfaces the verification gate.
const _individualHost = users.find((u) => u.email === 'alex@safalevent.com');
const _orgHost = users.find((u) => u.email === 'org@safalevent.com');
export const ORG_HOST_EMAIL = 'org@safalevent.com';
export const INDIVIDUAL_HOST_EMAIL = 'alex@safalevent.com';

let _currentHost = _individualHost || { ...HOST, role: 'host', hostType: 'individual', status: 'ACTIVE' };
export const getCurrentHost = () => _currentHost;
export const setCurrentHost = (account) => { _currentHost = account; _notify(); };

// Convenience: jump straight to one of the two demo host personas.
export const useIndividualHost = () => setCurrentHost(_individualHost);
export const useOrgHost = () => setCurrentHost(_orgHost);

export const isOrgHost = (account) => !!account && account.hostType === 'organization';

// A host can do host activity only when individual, OR (org docs uploaded AND admin-approved).
export const hostFullyVerified = (account) =>
  !!account && (account.hostType !== 'organization' || (!!account.orgDocsUploaded && account.status === 'ACTIVE'));

// Org host uploads/submits documents from inside their profile (never at signup).
export const saveOrgDocuments = (docNames) => {
  const h = _currentHost;
  if (!h) return;
  if (!h.orgProfile) h.orgProfile = { docs: [] };
  h.orgProfile.docs = Array.isArray(docNames) ? [...docNames] : [];
  h.orgDocsUploaded = h.orgProfile.docs.length > 0;
  // Submitting moves the org into the admin-review queue (still gated until ACTIVE).
  if (h.orgDocsUploaded && h.status !== 'ACTIVE') h.status = 'PENDING_ADMIN_APPROVAL';
  _notify();
};

// Demo-only: approve the current org host (so the unlocked experience is reachable
// without a real admin console).
export const approveCurrentOrgHost = () => {
  const h = _currentHost;
  if (h && h.hostType === 'organization' && h.orgDocsUploaded) { h.status = 'ACTIVE'; _notify(); }
};

// ─── Create event (Phase 2) ─────────────────────────────────────────────────
// Prepends a new event using the current host's identity; returns the record.
export const createEvent = (data, asDraft = false) => {
  const host = _currentHost || {};
  const record = {
    id: 'e_' + Math.random().toString(36).slice(2, 8),
    title: data.title || 'Untitled event',
    date: data.date || '',
    time: data.time || '',
    location: data.location || '',
    city: data.city || '',
    cover: data.cover || COVER_PRESETS[0],
    description: data.description || '',
    eventType: data.eventType || 'Other',
    accentTheme: data.accentTheme || 'sunset',
    status: asDraft ? 'Draft' : 'Published',
    privacy: data.privacy || 'Public',
    rsvpStatus: data.rsvpStatus || 'Open',
    capacity: Number(data.capacity) || 0,
    maxGuestsPerRsvp: Number(data.maxGuestsPerRsvp) || 1,
    rsvpDeadline: data.rsvpDeadline || '',
    approvalRequired: !!data.approvalRequired,
    messagingEnabled: data.messagingEnabled !== false,
    allowSelfEdit: !!data.allowSelfEdit,
    allowSelfCancellation: !!data.allowSelfCancellation,
    cancellationCutoff: Number(data.cancellationCutoff) || 0,
    requireCancellationReason: !!data.requireCancellationReason,
    allowComments: !!data.allowComments,
    sendRsvpConfirmationEmail: data.sendRsvpConfirmationEmail !== false,
    sendRsvpConfirmationSms: !!data.sendRsvpConfirmationSms,
    sendPreEventReminders: data.sendPreEventReminders !== false,
    sendPostEventFeedbackEmail: !!data.sendPostEventFeedbackEmail,
    enablePayments: !!data.enablePayments,
    ticketPrice: Number(data.ticketPrice) || 0,
    bank: data.bank || null,
    seriesType: data.seriesType || 'None',
    hostName: host.name || HOST.name,
    hostEmail: host.email || HOST.email,
    questions: Array.isArray(data.questions) ? data.questions.filter((q) => (q || '').trim()) : [],
    rating: 0,
  };
  events.unshift(record);
  _notify();
  return record;
};

// ─── Create poll (Phase 3) ──────────────────────────────────────────────────
export const createPoll = (eventId, question, optionTexts) => {
  const poll = {
    id: 'poll_' + Math.random().toString(36).slice(2, 8),
    eventId,
    question: question || 'Untitled poll',
    status: 'Published',
    options: (optionTexts || [])
      .filter((t) => (t || '').trim())
      .map((t, i) => ({ id: 'op_' + Math.random().toString(36).slice(2, 6) + i, text: t.trim(), votes: 0 })),
  };
  polls.unshift(poll);
  _notify();
  return poll;
};

// ─── Comments (Phase 3) ─────────────────────────────────────────────────────
export const addComment = (eventId, name, text) => {
  const c = { id: 'cm_' + Math.random().toString(36).slice(2, 8), eventId, name: name || 'Host', text: text || '', time: 'just now' };
  comments.unshift(c);
  _notify();
  return c;
};
export const deleteComment = (commentId) => {
  const i = comments.findIndex((c) => c.id === commentId);
  if (i >= 0) comments.splice(i, 1);
  _notify();
};

// ─── Add guest manually / invitations (Phase 3) ─────────────────────────────
// Creates an APPROVED rsvp, respecting capacity. Returns {ok, error?, rsvp?}.
export const addManualGuest = (eventId, data) => {
  const ev = getEvent(eventId);
  if (!ev) return { ok: false, error: 'Event not found.' };
  const going = rsvps.filter((r) => r.eventId === eventId && r.status === 'going' && r.approvalState === 'APPROVED');
  const seats = going.reduce((n, r) => n + (r.guestCount || 1), 0);
  const want = Number(data.guestCount) || 1;
  if (ev.capacity && seats + want > ev.capacity)
    return { ok: false, error: `Adding ${want} would exceed capacity (${seats}/${ev.capacity}).` };
  const rsvp = {
    id: 'r_' + Math.random().toString(36).slice(2, 8),
    eventId,
    name: data.name || 'Guest',
    email: data.email || '',
    phone: data.phone || '',
    status: 'going',
    approvalState: 'APPROVED',
    checkedIn: false,
    guestCount: want,
    timestamp: new Date().toISOString(),
    answers: {},
    manual: true,
  };
  rsvps.push(rsvp);
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: rsvp.email || rsvp.name,
    channel: 'Email',
    subject: `You've been added to ${ev.title}`,
    time: 'just now',
  });
  _notify();
  return { ok: true, rsvp };
};

// ─── Broadcast to all guests (Phase 3) ──────────────────────────────────────
// Logs one outbox entry per confirmed guest; returns the number reached.
export const broadcast = (eventId, subject, channel = 'Email') => {
  const ev = getEvent(eventId);
  const recipients = rsvps.filter((r) => r.eventId === eventId && r.status === 'going');
  recipients.forEach((r) => {
    outbox.unshift({
      id: 'o_' + Math.random().toString(36).slice(2, 8),
      to: r.email || r.name,
      channel,
      subject: subject || `Update for ${ev ? ev.title : 'your event'}`,
      time: 'just now',
    });
  });
  _notify();
  return recipients.length;
};

// ─── Edit / delete event (Phase 3 Settings) ─────────────────────────────────
export const updateEvent = (eventId, patch) => {
  const ev = getEvent(eventId);
  if (!ev) return null;
  Object.assign(ev, patch);
  _notify();
  return ev;
};
export const deleteEvent = (eventId) => {
  const i = events.findIndex((e) => e.id === eventId);
  if (i >= 0) events.splice(i, 1);
  _notify();
};

// Resolve a staff member's permission set from their role.
export const getStaffPermissions = (staffMember) => {
  const role = staffMember && getRoleById(staffMember.roleId);
  return (role && role.permissions) || {};
};
export const staffCan = (perm) => {
  if (!_currentStaff) return false;
  return !!getStaffPermissions(_currentStaff)[perm];
};

// Find a registered host/guest account by email or phone.
const _digits = (s) => (s || '').replace(/\D/g, '');
export const findUser = (contact) => {
  const c = (contact || '').trim().toLowerCase();
  if (!c) return null;
  const d = _digits(c);
  return users.find((u) => u.email.toLowerCase() === c || (d && _digits(u.phone) === d)) || null;
};

// UC-12/US-ACCESS-002: unified login — look up the account and route by its stored
// type. US-AUTH-006: pending/rejected hosts are blocked with a clear reason.
export const loginByContact = (contact) => {
  const user = findUser(contact);
  if (!user) return { success: false, error: 'No account found with this email/phone. Sign up below.' };
  if (user.role === 'host' && user.status === 'PENDING_ADMIN_APPROVAL')
    return { success: false, error: 'Your organization application is under admin review. You’ll get an email once it’s approved.' };
  if (user.status === 'REJECTED')
    return { success: false, error: `Your host registration was not approved.${user.rejectReason ? ' Reason: ' + user.rejectReason : ''}` };
  return { success: true, user };
};

// US-ACCESS-001 / US-AUTH-002/003: register a new account. Organization hosts land
// PENDING_ADMIN_APPROVAL (cannot enter the host dashboard yet); everyone else ACTIVE.
export const registerUser = (u) => {
  if (findUser(u.email)) return { success: false, error: 'An account with this email already exists. Try logging in instead.' };
  const status = u.role === 'host' && u.hostType === 'organization' ? 'PENDING_ADMIN_APPROVAL' : 'ACTIVE';
  const record = { ...u, status };
  users.push(record);
  return { success: true, user: record };
};

// UC-13: validate an Invite ID against the email/phone it was issued to.
export const loginAsStaff = (inviteId, contact) => {
  const code = (inviteId || '').trim().toLowerCase();
  const c = (contact || '').trim().toLowerCase();
  if (!code || !c) return { success: false, error: 'Enter your Invite ID and email/phone.' };
  const matches = staff.filter((s) => (s.inviteId || '').toLowerCase() === code);
  if (!matches.length) return { success: false, error: 'Invite ID not found. Ask your host to resend it.' };
  const matched = matches.find((s) => s.email.toLowerCase() === c);
  if (!matched) return { success: false, error: 'This Invite ID was issued to a different email/phone.' };
  matched.status = 'ACTIVE';
  setCurrentStaff(matched);
  return { success: true, staff: matched };
};

// Look up an rsvp by booking/pass id within a given event (the "QR" payload).
export const getRsvpByPass = (eventId, passId) =>
  rsvps.find((r) => r.eventId === eventId && r.id.toLowerCase() === (passId || '').trim().toLowerCase()) || null;

// UC-11: validate a scanned pass against the event's APPROVED guest list.
export const validateScan = (eventId, passId) => {
  const rsvp = getRsvpByPass(eventId, passId);
  if (!rsvp) return { ok: false, code: 'invalid', message: 'Not valid for this event.', rsvp: null };
  if (rsvp.approvalState === 'REJECTED') return { ok: false, code: 'rejected', message: 'Guest was not approved. Entry denied.', rsvp };
  if (rsvp.approvalState === 'UNDER_APPROVAL' || rsvp.status === 'waitlist')
    return { ok: false, code: 'pending', message: 'Guest is still Under Approval — not admitted.', rsvp };
  if (rsvp.status !== 'going') return { ok: false, code: 'notgoing', message: 'Guest is not confirmed for the event.', rsvp };
  if (rsvp.checkedIn) {
    const when = rsvp.checkedInAt ? new Date(rsvp.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'earlier';
    return { ok: false, code: 'duplicate', message: `Already scanned at ${when}.`, rsvp };
  }
  return { ok: true, code: 'valid', message: 'Valid — ready to check in.', rsvp };
};

// Mark a guest as arrived: mutates state, triggers a guest email + host
// notification + audit entry, and notifies subscribers so the host UI updates.
export const checkInGuest = (rsvpId, scannerName = 'Gate Staff') => {
  const rsvp = rsvps.find((r) => r.id === rsvpId);
  if (!rsvp) return null;
  rsvp.checkedIn = true;
  rsvp.checkedInAt = new Date().toISOString();
  const ev = getEvent(rsvp.eventId);
  const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // "Email" to the guest (shows up in delivery logs / outbox)
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: rsvp.email,
    channel: 'Email',
    subject: `Welcome! You're checked in to ${ev ? ev.title : 'the event'}`,
    time: 'just now',
  });
  // Host dashboard notification
  notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    type: 'checkin',
    title: 'Guest Checked In',
    message: `${rsvp.name} checked in to ${ev ? ev.title : 'the event'} (scanned by ${scannerName}).`,
    time: 'just now',
    read: false,
  });
  // Audit trail
  auditTrail.unshift({
    id: 'a_' + Math.random().toString(36).slice(2, 8),
    actor: scannerName,
    action: `Checked in ${rsvp.name} via QR scan`,
    time: stamp,
  });
  _notify();
  return rsvp;
};
