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
    ageRestricted: true,
    minimumAge: 18,
    enablePhotoAlbum: true,
    photoUploadPermission: 'guests',
    requirePhotoApproval: true,
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
    enablePhotoAlbum: true,
    photoUploadPermission: 'host_only',
    requirePhotoApproval: false,
    hostName: 'Riley Morgan',
    hostEmail: 'riley@comedyclub.com',
    rating: 4.7,
    ageRestricted: true,
    minimumAge: 21,
    questions: [],
  },
];

// approvalState: UNDER_APPROVAL | APPROVED | REJECTED  (orthogonal to status)
export const rsvps = [
  { id: 'r1', eventId: '1', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'going', approvalState: 'APPROVED', checkedIn: true, guestCount: 2, dob: '1996-04-12', ageVerified: true, additionalGuests: [{ firstName: 'Jane', lastName: 'Doe', dob: '1998-09-30' }], timestamp: '2026-06-01T12:00:00Z', answers: { 'Any food allergies?': 'None', 'Song request for the DJ?': 'Levitating' } },
  { id: 'r2', eventId: '1', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 234-5678', status: 'going', approvalState: 'APPROVED', checkedIn: false, guestCount: 4, dob: '2000-02-20', ageVerified: true, additionalGuests: [], timestamp: '2026-06-02T14:30:00Z', answers: { 'Any food allergies?': 'Gluten-free' } },
  { id: 'r3', eventId: '1', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 345-6789', status: 'going', approvalState: 'APPROVED', checkedIn: false, guestCount: 3, timestamp: '2026-06-03T09:15:00Z', answers: {} },
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

// ─── Event photo albums (EP-001) ──────────────────────────────────────────────
// status: APPROVED | PENDING | REJECTED. role: host | guest.
export let photos = [
  { id: 'ph1', eventId: '1', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', caption: 'Setting up the rooftop ✨', uploader: 'Alex Rivera', role: 'host', status: 'APPROVED', time: 'Aug 14' },
  { id: 'ph2', eventId: '1', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=600&q=80', caption: 'Great crowd tonight!', uploader: 'Alice Vance', role: 'guest', status: 'APPROVED', time: 'Aug 15' },
  { id: 'ph3', eventId: '1', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', caption: 'Dance floor 🔥', uploader: 'Bob Smith', role: 'guest', status: 'PENDING', time: 'Aug 15' },
  { id: 'ph5', eventId: '5', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=600&q=80', caption: 'Headliner on stage', uploader: 'Riley Morgan', role: 'host', status: 'APPROVED', time: 'Jul 10' },
];

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&q=80',
];

// Helpers
export const getEvent = (id) => events.find((e) => e.id === id);
export const getRsvps = (eventId) => rsvps.filter((r) => r.eventId === eventId);
export const getRoleById = (id) => roles.find((r) => r.id === id) || null;
export const getPolls = (eventId) => polls.filter((p) => p.eventId === eventId);
export const getComments = (eventId) => comments.filter((c) => c.eventId === eventId);

// ─── Age helpers (age-restricted events: US-EVENT-013/014/015) ─────────────────
// DOB is stored as 'YYYY-MM-DD'. calcAge returns full years or null.
export function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
export const meetsAge = (dob, min) => {
  const a = calcAge(dob);
  return a !== null && a >= min;
};

// ─── Subscription & pricing (US-UI-002) ───────────────────────────────────────
export const plans = [
  { id: 'ind_free', name: 'Free', emoji: '🌱', monthlyPrice: 0, commission: 0, limits: { activeEvents: 1, attendeesPerEvent: 50, staffMembers: 0, photos: 0 } },
  { id: 'ind_basic', name: 'Basic', emoji: '⭐', monthlyPrice: 3.99, commission: 5, limits: { activeEvents: 3, attendeesPerEvent: 200, staffMembers: 0, photos: 20 } },
  { id: 'ind_advanced', name: 'Advanced', emoji: '🚀', monthlyPrice: 9.99, commission: 3, popular: true, limits: { activeEvents: 10, attendeesPerEvent: 500, staffMembers: 1, photos: 100 } },
  { id: 'ind_premium', name: 'Premium', emoji: '💎', monthlyPrice: 24.99, commission: 2, limits: { activeEvents: -1, attendeesPerEvent: 1500, staffMembers: 2, photos: 500 } },
  { id: 'ind_premium_plus', name: 'Premium Plus', emoji: '👑', monthlyPrice: 49.99, commission: 1, limits: { activeEvents: -1, attendeesPerEvent: 5000, staffMembers: 5, photos: -1 } },
];

export const hostSubscription = { planId: 'ind_advanced', billingCycle: 'monthly', status: 'ACTIVE', renews: 'Jul 15, 2026' };
export const hostUsage = { activeEvents: 3, staffMembers: 1, photos: 60 };

export const topUps = [
  { id: 't_photos', name: 'Photo Pack', desc: '+50 guest photo uploads', price: 0.99, icon: '📸' },
  { id: 't_attendees', name: 'Extra 250 Attendees', desc: 'Add 250 to one event', price: 2.99, icon: '👥' },
  { id: 't_event', name: 'Extra Event Slot', desc: 'One more active event', price: 1.99, icon: '📅' },
  { id: 't_staff', name: 'Assistant Pass', desc: 'One extra staff member', price: 1.49, icon: '🎫' },
];

export const transactions = [
  { id: 'tx1', date: 'Jun 1, 2026', type: 'Subscription', desc: 'Advanced Plan — Monthly', amount: 9.99, status: 'Success' },
  { id: 'tx2', date: 'May 5, 2026', type: 'Top-Up', desc: 'Extra 250 Attendees', amount: 2.99, status: 'Success' },
  { id: 'tx3', date: 'May 1, 2026', type: 'Subscription', desc: 'Advanced Plan — Monthly', amount: 9.99, status: 'Success' },
];

export const getPlanById = (id) => plans.find((p) => p.id === id) || null;

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
    autoCheckIn: !!data.autoCheckIn,
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

// Update RSVP status: updates in both memory arrays and notifies subscribers
export const updateRsvpStatus = (rsvpId, status) => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (r) {
    r.status = status;
  }
  const myR = myRsvps.find((x) => x.id === rsvpId);
  if (myR) {
    myR.status = status;
  }
  _notify();
};

export const updateRsvpDetails = (rsvpId, patch) => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (r) {
    Object.assign(r, patch);
  }
  const myR = myRsvps.find((x) => x.id === rsvpId);
  if (myR) {
    Object.assign(myR, patch);
  }
  _notify();
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

// ─── Guest Intelligence (trust scores, patterns, attendance history) ─────────
export const MOCK_GUESTS = [
  {
    id: 1, name: 'Alice Vance', email: 'alice@example.com', phone: '+1 555-0101',
    eventsRsvpd: 8, totalAttendees: 10, actualAttendees: 10, trustScore: 92,
    pattern: 'Consistent Attendee', remindersSent: 0, firstRsvp: 'Jan 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer', rsvpCount: 2, actual: 2, date: '22 Jun 2026', rsvpDate: '15 Jun 2026' },
      { event: 'Startup Meetup', rsvpCount: 1, actual: 1, date: '15 May 2026', rsvpDate: '08 May 2026' },
      { event: 'Founder Dinner', rsvpCount: 2, actual: 2, date: '12 Apr 2026', rsvpDate: '02 Apr 2026' },
    ],
    communications: [],
  },
  {
    id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 555-0102',
    eventsRsvpd: 12, totalAttendees: 68, actualAttendees: 24, trustScore: 35,
    pattern: 'Over-RSVP Pattern', remindersSent: 2, firstRsvp: 'Mar 2025',
    notes: 'Frequently reserves large groups. Typically attends with 1-3 guests. Monitor future RSVPs.',
    history: [
      { event: 'Summer Mixer', rsvpCount: 10, actual: 2, date: '22 Jun 2026', rsvpDate: '14 Jun 2026' },
      { event: 'Startup Meetup', rsvpCount: 8, actual: 1, date: '15 May 2026', rsvpDate: '06 May 2026' },
      { event: 'Product Launch', rsvpCount: 12, actual: 0, date: '12 Apr 2026', rsvpDate: '05 Apr 2026' },
      { event: 'Founder Dinner', rsvpCount: 6, actual: 2, date: '08 Mar 2026', rsvpDate: '01 Mar 2026' },
    ],
    communications: [
      { type: 'Reminder Email', date: '22 Jun 2026', status: 'Delivered' },
      { type: 'Attendance Reminder', date: '15 May 2026', status: 'Opened' },
      { type: 'SMS Reminder', date: '10 Apr 2026', status: 'Delivered' },
    ],
  },
  {
    id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 555-0103',
    eventsRsvpd: 6, totalAttendees: 12, actualAttendees: 8, trustScore: 65,
    pattern: 'Partial Attendance', remindersSent: 1, firstRsvp: 'Feb 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer', rsvpCount: 4, actual: 2, date: '22 Jun 2026', rsvpDate: '16 Jun 2026' },
      { event: 'Startup Meetup', rsvpCount: 2, actual: 1, date: '15 May 2026', rsvpDate: '09 May 2026' },
    ],
    communications: [
      { type: 'Attendance Reminder', date: '14 May 2026', status: 'Opened' },
    ],
  },
  {
    id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '+1 555-0104',
    eventsRsvpd: 3, totalAttendees: 3, actualAttendees: 0, trustScore: 10,
    pattern: 'Frequent No-Show', remindersSent: 3, firstRsvp: 'Apr 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer', rsvpCount: 1, actual: 0, date: '22 Jun 2026', rsvpDate: '18 Jun 2026' },
      { event: 'Startup Meetup', rsvpCount: 1, actual: 0, date: '15 May 2026', rsvpDate: '11 May 2026' },
      { event: 'Product Launch', rsvpCount: 1, actual: 0, date: '12 Apr 2026', rsvpDate: '07 Apr 2026' },
    ],
    communications: [
      { type: 'Reminder Email', date: '21 Jun 2026', status: 'Delivered' },
      { type: 'Attendance Reminder', date: '14 May 2026', status: 'Not Opened' },
      { type: 'SMS Reminder', date: '11 Apr 2026', status: 'Delivered' },
    ],
  },
  {
    id: 5, name: 'Ethan Cole', email: 'ethan@example.com', phone: '+1 555-0105',
    eventsRsvpd: 5, totalAttendees: 7, actualAttendees: 7, trustScore: 88,
    pattern: 'Consistent Attendee', remindersSent: 0, firstRsvp: 'May 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer', rsvpCount: 3, actual: 3, date: '22 Jun 2026', rsvpDate: '15 Jun 2026' },
      { event: 'Product Launch', rsvpCount: 2, actual: 2, date: '12 Apr 2026', rsvpDate: '04 Apr 2026' },
    ],
    communications: [],
  },
];

export const getTrustBadge = (score) => {
  if (score >= 85) return { color: '#16a34a', bg: '#16a34a22', text: 'Excellent' };
  if (score >= 70) return { color: '#22c55e', bg: '#22c55e22', text: 'Good' };
  if (score >= 50) return { color: '#eab308', bg: '#eab30822', text: 'Moderate' };
  return { color: '#ef4444', bg: '#ef444422', text: 'High Risk' };
};

export const getPatternBadge = (pattern) => {
  switch (pattern) {
    case 'Consistent Attendee': return { color: '#16a34a', bg: '#16a34a22' };
    case 'Partial Attendance':
    case 'Frequent Partial Attendance': return { color: '#eab308', bg: '#eab30822' };
    case 'Frequent No-Show': return { color: '#f97316', bg: '#f9731622' };
    case 'Over-RSVP Pattern': return { color: '#ef4444', bg: '#ef444422' };
    default: return { color: '#94a3b8', bg: '#94a3b822' };
  }
};

export const getEventStatus = (rsvpCount, actual) => {
  if (actual === 0) return { label: 'No Show', icon: '✕', color: '#ef4444', bg: '#ef444422' };
  if (actual >= rsvpCount) return { label: 'Fully Attended', icon: '✓', color: '#16a34a', bg: '#16a34a22' };
  return { label: 'Partial', icon: '⚠', color: '#eab308', bg: '#eab30822' };
};

const PARTY_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Skyler'];
export const getPartyMembers = (guestName, count) => {
  if (count <= 1) return [guestName];
  const lastName = guestName.split(' ').pop();
  return [guestName, ...Array.from({ length: count - 1 }, (_, i) => `${PARTY_NAMES[i % PARTY_NAMES.length]} ${lastName} (+1)`)];
};

// ─── Attendee-level partial check-in (mirrors web app) ───────────────────────
// A guest's RSVP may have `guestCount` attendees. Each can arrive incrementally.
// checkedInCount = how many have arrived; fullyCheckedIn = all in; checkInLog = trail.
export const getCheckedInCount = (r) =>
  r.checkedInCount != null ? r.checkedInCount : (r.checkedIn ? (r.guestCount || 1) : 0);

export const getCheckinState = (r) => {
  const total = r.guestCount || 1;
  const inCount = getCheckedInCount(r);
  if (inCount >= total) return { inCount, total, label: `All ${total} in`, state: 'full', color: '#16a34a', bg: '#16a34a22' };
  if (inCount > 0) return { inCount, total, label: `${inCount}/${total} arrived`, state: 'partial', color: '#d97706', bg: '#d9770622' };
  return { inCount, total, label: 'Not arrived', state: 'none', color: '#6e6e73', bg: '#f5f5f7' };
};

// Record a batch of arriving attendees against an RSVP. Updates count/log; only
// fires the full check-in side-effects (guest email, host notification, audit)
// once everyone in the party has arrived.
export const recordArrival = (rsvpId, count, scannerName = 'Host') => {
  const rsvp = rsvps.find((r) => r.id === rsvpId);
  if (!rsvp) return null;
  const total = rsvp.guestCount || 1;
  const current = getCheckedInCount(rsvp);
  const next = Math.min(total, current + (count || 1));
  if (next === current) return rsvp;

  const stamp = new Date();
  const entry = {
    time: stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    iso: stamp.toISOString(),
    count: next - current,
    by: scannerName,
  };
  rsvp.checkedInCount = next;
  rsvp.fullyCheckedIn = next >= total;
  rsvp.checkedIn = next > 0;
  rsvp.checkedInAt = stamp.toISOString();
  rsvp.checkInLog = [...(rsvp.checkInLog || []), entry];

  const ev = getEvent(rsvp.eventId);
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: rsvp.email,
    channel: 'Email',
    subject: rsvp.fullyCheckedIn
      ? `Welcome: Check-in completed for ${ev ? ev.title : 'the event'}`
      : `Update: Partial Check-in for ${ev ? ev.title : 'the event'}`,
    body: rsvp.fullyCheckedIn
      ? `Hi ${rsvp.name},\n\nYour check-in for "${ev ? ev.title : 'the event'}" has been successfully completed.\n\nGuests Checked In: ${next} of ${total}\n\nEnjoy the event!`
      : `Hi ${rsvp.name},\n\nYour check-in for "${ev ? ev.title : 'the event'}" has been recorded.\n\nGuests Checked In: ${next} of ${total}\n\nThe remaining guests in your RSVP can still check in using the same QR code.\n\nEnjoy the event!`,
    time: 'just now',
  });
  notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    type: 'checkin',
    title: rsvp.fullyCheckedIn ? 'Party Fully Checked In' : 'Partial Arrival',
    message: `${rsvp.name}: ${next}/${total} attendees arrived (by ${scannerName}).`,
    time: 'just now',
    read: false,
  });
  auditTrail.unshift({
    id: 'a_' + Math.random().toString(36).slice(2, 8),
    actor: scannerName,
    action: `Checked in ${next - current} of ${rsvp.name}'s party (${next}/${total})`,
    time: entry.time,
  });
  _notify();
  return rsvp;
};

export const getEventCapacityStatus = (eventId) => {
  const event = getEvent(eventId);
  if (!event) return { capacity: 0, currentGoing: 0, remaining: 0, full: false };
  
  const currentGoingCount = rsvps
    .filter(r => r.eventId === eventId && r.status === 'going' && r.approvalState !== 'REJECTED')
    .reduce((sum, r) => sum + (r.guestCount || 1), 0);
    
  const capacity = event.capacity || 100;
  return {
    capacity,
    currentGoing: currentGoingCount,
    remaining: Math.max(0, capacity - currentGoingCount),
    full: currentGoingCount >= capacity
  };
};

export const waitlistWalkins = (eventId, primaryRsvpId, walkinCount, scannerName = 'Staff') => {
  const primaryRsvp = rsvps.find(r => r.id === primaryRsvpId);
  if (!primaryRsvp) return null;
  const ev = getEvent(eventId);
  if (!ev) return null;

  const newRsvp = {
    id: 'r_' + Math.random().toString(36).slice(2, 8),
    eventId,
    name: `Walk-ins (${primaryRsvp.name})`,
    email: primaryRsvp.email,
    phone: primaryRsvp.phone,
    linkedTo: primaryRsvpId,
    checkedIn: false,
    timestamp: new Date().toISOString(),
    answers: {},
    guestCount: walkinCount,
    preferredChannel: primaryRsvp.preferredChannel || 'Email',
    status: 'waitlist',
    approvalState: 'UNDER_APPROVAL'
  };
  rsvps.push(newRsvp);

  // Host notification
  notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    type: 'rsvp',
    title: 'New Walk-In Approval Request',
    message: `Requested by: ${scannerName} (Check-In Staff). ${primaryRsvp.name} requested ${walkinCount} additional guests. Approve or Reject in Waitlist.`,
    time: 'just now',
    read: false,
  });

  // Guest notification
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: primaryRsvp.email,
    channel: 'Email',
    subject: `Update: Walk-ins waitlisted for ${ev.title}`,
    body: `Hi ${primaryRsvp.name},\n\nYour check-in for "${ev.title}" has been completed.\n\n${walkinCount} additional guest(s) could not be checked in because the event has reached capacity.\n\nThey have been added to the event waitlist and are awaiting host approval.\n\nYou will be notified once a decision has been made.`,
    time: 'just now',
  });

  _notify();
  return newRsvp;
};

// Reset a guest's arrivals (undo) — clears partial check-in state.
export const resetArrival = (rsvpId) => {
  const rsvp = rsvps.find((r) => r.id === rsvpId);
  if (!rsvp) return null;
  rsvp.checkedInCount = 0;
  rsvp.fullyCheckedIn = false;
  rsvp.checkedIn = false;
  rsvp.checkInLog = [];
  _notify();
  return rsvp;
};

// Add walk-in guests to an existing RSVP during check-in. No personal info required —
// only a count. Walk-ins are immediately counted as checked in.
export const addWalkinGuests = (rsvpId, count, scannerName = 'Host') => {
  const rsvp = rsvps.find((r) => r.id === rsvpId);
  if (!rsvp || count < 1) return null;
  const stamp = new Date();
  const entry = {
    time: stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    iso: stamp.toISOString(),
    count,
    by: scannerName,
    walkin: true,
  };
  rsvp.walkinCount = (rsvp.walkinCount || 0) + count;
  rsvp.checkInLog = [...(rsvp.checkInLog || []), entry];
  const ev = getEvent(rsvp.eventId);
  notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    type: 'checkin',
    title: 'Walk-in Guests Added',
    message: `+${count} additional guest(s) added to ${rsvp.name}'s party.`,
    time: 'just now',
    read: false,
  });
  auditTrail.unshift({
    id: 'a_' + Math.random().toString(36).slice(2, 8),
    actor: scannerName,
    action: `+${count} walk-in guest(s) added to ${rsvp.name}'s check-in${ev ? ` at ${ev.title}` : ''}`,
    time: entry.time,
  });
  _notify();
  return rsvp;
};

// Cross-event guest intelligence by email — accuracy, no-shows, partials, recent.
export const getGuestHistorySummary = (email) => {
  const guest = MOCK_GUESTS.find((g) => g.email === email);
  if (!guest) {
    return { found: false, trustScore: 100, accuracy: 100, totalEventsRsvpd: 0, noShow: 0, partial: 0, pattern: null, recent: [], hasWarning: false };
  }
  const accuracy = Math.round((guest.actualAttendees / (guest.totalAttendees || 1)) * 100);
  const noShow = guest.history.filter((h) => h.actual === 0).length;
  const partial = guest.history.filter((h) => h.actual > 0 && h.actual < h.rsvpCount).length;
  return {
    found: true,
    trustScore: guest.trustScore,
    accuracy,
    totalEventsRsvpd: guest.eventsRsvpd,
    noShow,
    partial,
    pattern: guest.pattern,
    recent: guest.history.slice(0, 3),
    hasWarning: guest.pattern === 'Over-RSVP Pattern' || guest.trustScore < 50,
  };
};

// ─── Guest RSVP creation (makes "My Tickets" real) ──────────────────────────
// Creates a real RSVP for the demo guest, pushes it into both the event guest
// list and the guest's "My Tickets". Approval-required events land pending.
export const createGuestRsvp = (eventId, data = {}) => {
  const ev = getEvent(eventId);
  if (!ev) return { ok: false, error: 'Event not found.' };

  // Capacity check (approved going seats).
  const going = rsvps.filter((r) => r.eventId === eventId && r.status === 'going' && r.approvalState === 'APPROVED');
  const seats = going.reduce((n, r) => n + (r.guestCount || 1), 0);
  const want = Number(data.guestCount) || 1;
  const atCapacity = ev.capacity && seats + want > ev.capacity;

  const approvalState = ev.approvalRequired ? 'UNDER_APPROVAL' : 'APPROVED';
  const status = atCapacity ? 'waitlist' : 'going';

  const record = {
    id: 'r_' + Math.random().toString(36).slice(2, 8),
    eventId,
    name: data.name || GUEST.name,
    email: data.email || GUEST.email,
    phone: data.phone || GUEST.phone,
    status,
    approvalState,
    checkedIn: false,
    checkedInCount: 0,
    guestCount: want,
    dob: data.dob || null,
    ageVerified: data.ageVerified != null ? data.ageVerified : (data.dob ? meetsAge(data.dob, ev.minimumAge || 0) : false),
    additionalGuests: data.additionalGuests || [],
    timestamp: new Date().toISOString(),
    answers: data.answers || {},
  };
  rsvps.push(record);

  // Mirror into the guest's My Tickets (dedupe by event).
  const existingIdx = myRsvps.findIndex((r) => r.eventId === eventId);
  const ticket = { ...record, event: ev };
  if (existingIdx >= 0) myRsvps[existingIdx] = ticket;
  else myRsvps.unshift(ticket);

  // Confirmation to the guest.
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: record.email,
    channel: ev.sendRsvpConfirmationSms ? 'SMS' : 'Email',
    subject: approvalState === 'UNDER_APPROVAL'
      ? `We received your RSVP for ${ev.title} — pending approval`
      : `You're confirmed for ${ev.title}!`,
    time: 'just now',
  });
  // Notify the host.
  notifications.unshift({
    id: 'n_' + Math.random().toString(36).slice(2, 8),
    type: 'rsvp',
    title: approvalState === 'UNDER_APPROVAL' ? 'New RSVP — needs approval' : 'New RSVP',
    message: `${record.name} RSVP'd to ${ev.title} (${want} guest${want > 1 ? 's' : ''}).`,
    time: 'just now',
    read: false,
  });
  _notify();
  return { ok: true, rsvp: record, waitlisted: status === 'waitlist', pending: approvalState === 'UNDER_APPROVAL' };
};

// ─── RSVP approval workflow (host management) ────────────────────────────────
const _rsvpEmail = (rsvpId, subject) => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (!r) return;
  outbox.unshift({ id: 'o_' + Math.random().toString(36).slice(2, 8), to: r.email || r.name, channel: 'Email', subject, time: 'just now' });
};
const _audit = (actor, action) => {
  auditTrail.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), actor, action, time: 'just now' });
};

export const approveRsvp = (rsvpId, actor = 'Host') => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (!r) return null;
  r.approvalState = 'APPROVED';
  if (r.status !== 'going') r.status = 'going';
  const ev = getEvent(r.eventId);
  _rsvpEmail(rsvpId, `You're approved for ${ev ? ev.title : 'the event'}!`);
  _audit(actor, `Approved RSVP for ${r.name}`);
  _notify();
  return r;
};

export const rejectRsvp = (rsvpId, reason = '', actor = 'Host') => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (!r) return null;
  r.approvalState = 'REJECTED';
  r.rejectionReason = reason || 'Not approved by host.';
  const ev = getEvent(r.eventId);
  _rsvpEmail(rsvpId, `Update on your RSVP for ${ev ? ev.title : 'the event'}`);
  _audit(actor, `Rejected RSVP for ${r.name}`);
  _notify();
  return r;
};

// Approve a waitlisted guest and move them into the confirmed list.
export const approveFromWaitlist = (rsvpId, actor = 'Host') => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (!r) return null;
  r.status = 'going';
  r.approvalState = 'APPROVED';
  const ev = getEvent(r.eventId);
  _rsvpEmail(rsvpId, `A spot opened — you're in for ${ev ? ev.title : 'the event'}!`);
  _audit(actor, `Promoted ${r.name} from waitlist`);
  _notify();
  return r;
};

export const reopenRsvp = (rsvpId, actor = 'Host') => {
  const r = rsvps.find((x) => x.id === rsvpId);
  if (!r) return null;
  r.approvalState = 'UNDER_APPROVAL';
  r.rejectionReason = undefined;
  _audit(actor, `Re-opened RSVP for ${r.name}`);
  _notify();
  return r;
};

export const removeRsvp = (rsvpId, actor = 'Host') => {
  const i = rsvps.findIndex((x) => x.id === rsvpId);
  if (i < 0) return;
  const r = rsvps[i];
  rsvps.splice(i, 1);
  _audit(actor, `Removed ${r.name} from the guest list`);
  _notify();
};

// Approve every pending (UNDER_APPROVAL, going) request for an event. Returns count.
export const approveAllPending = (eventId, actor = 'Host') => {
  const pending = rsvps.filter((r) => r.eventId === eventId && r.approvalState === 'UNDER_APPROVAL' && r.status === 'going');
  pending.forEach((r) => approveRsvp(r.id, actor));
  return pending.length;
};

// ─── Account settings (host + guest) — controlled & persistent in-session ────
export const hostSettings = {
  emailConfirmations: true,
  smsConfirmations: false,
  preEventReminders: true,
  dailyDigest: false,
};
export const guestSettings = {
  emailReminders: true,
  smsReminders: false,
  newMessageAlerts: true,
};
export const updateHostSettings = (patch) => { Object.assign(hostSettings, patch); _notify(); return hostSettings; };
export const updateGuestSettings = (patch) => { Object.assign(guestSettings, patch); _notify(); return guestSettings; };

// ─── Integrations (connect / disconnect) ─────────────────────────────────────
export const integrations = [
  { id: 'gcal', name: 'Google Calendar', desc: 'Sync events & RSVPs to your calendar', icon: 'calendar-outline', color: '#4285F4', connected: true },
  { id: 'stripe', name: 'Stripe', desc: 'Collect ticket payments & payouts', icon: 'card-outline', color: '#635BFF', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', desc: 'Sync guests to email campaigns', icon: 'mail-outline', color: '#FFE01B', connected: false },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Send invites & reminders on WhatsApp', icon: 'logo-whatsapp', color: '#25D366', connected: true },
  { id: 'zapier', name: 'Zapier', desc: 'Automate workflows with 5,000+ apps', icon: 'flash-outline', color: '#FF4F00', connected: false },
  { id: 'jotform', name: 'Jotform', desc: 'Build custom registration forms', icon: 'document-text-outline', color: '#FA8900', connected: false },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Export guest lists & analytics', icon: 'stats-chart-outline', color: '#0F9D58', connected: false },
  { id: 'slack', name: 'Slack', desc: 'Get instant RSVP & check-in alerts', icon: 'logo-slack', color: '#E01E5A', connected: false },
  { id: 'twilio', name: 'Twilio', desc: 'Send SMS reminders & alerts', icon: 'chatbubbles-outline', color: '#F22F46', connected: false },
  { id: 'hubspot', name: 'HubSpot', desc: 'Sync event attendees to CRM', icon: 'people-circle-outline', color: '#FF7A59', connected: false },
  { id: 'safalmybuy', name: 'SafalMyBuy', desc: 'Connect for event integrations', icon: 'cart-outline', color: '#6366F1', connected: false }
];
export const toggleIntegration = (id) => {
  const it = integrations.find((x) => x.id === id);
  if (it) { it.connected = !it.connected; _notify(); }
  return it;
};

// ─── Staff invite / role management ──────────────────────────────────────────
export const inviteStaff = (eventId, { name, email, roleId }) => {
  const role = getRoleById(roleId) || roles[0];
  const record = {
    id: 'st_' + Math.random().toString(36).slice(2, 8),
    eventId,
    name: name || 'New Teammate',
    email: email || '',
    roleId: role.id,
    roleName: role.name,
    inviteId: 'INV-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    status: 'INVITED',
  };
  staff.push(record);
  outbox.unshift({
    id: 'o_' + Math.random().toString(36).slice(2, 8),
    to: record.email || record.name,
    channel: 'Email',
    subject: `You're invited as ${role.name} — Invite ID ${record.inviteId}`,
    time: 'just now',
  });
  _notify();
  return record;
};
export const updateStaffRole = (staffId, roleId) => {
  const s = staff.find((x) => x.id === staffId);
  const role = getRoleById(roleId);
  if (s && role) { s.roleId = role.id; s.roleName = role.name; _notify(); }
  return s;
};
export const removeStaff = (staffId) => {
  const i = staff.findIndex((x) => x.id === staffId);
  if (i >= 0) { staff.splice(i, 1); _notify(); }
};
export const getStaffForEvent = (eventId) => staff.filter((s) => s.eventId === eventId);

// ─── Photo album store (EP-001) ───────────────────────────────────────────────
export const getEventPhotos = (eventId) => photos.filter((p) => p.eventId === eventId);

// Prototype upload: cycles through stock images. Guest uploads go to PENDING when
// the host requires approval; host uploads are always APPROVED.
export const uploadPhoto = (eventId, { uploader = 'You', role = 'guest', caption = '' } = {}) => {
  const ev = getEvent(eventId);
  const needsApproval = !!(ev && ev.requirePhotoApproval) && role === 'guest';
  const url = STOCK_PHOTOS[photos.length % STOCK_PHOTOS.length];
  const photo = {
    id: 'ph_' + Math.random().toString(36).slice(2, 8),
    eventId, url, caption, uploader, role,
    status: needsApproval ? 'PENDING' : 'APPROVED',
    time: 'just now',
  };
  photos.unshift(photo);
  _notify();
  return photo;
};

export const setPhotoStatus = (id, status) => {
  const p = photos.find((x) => x.id === id);
  if (p) { p.status = status; _notify(); }
  return p;
};

export const deletePhoto = (id) => {
  photos = photos.filter((x) => x.id !== id);
  _notify();
};
