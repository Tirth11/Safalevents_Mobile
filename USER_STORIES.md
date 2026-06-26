# SafalEvents Mobile App — End-to-End User Story Document

**Product:** SafalEvents (Mobile)
**Document type:** Functional user stories with acceptance criteria
**Scope:** Complete feature set across all roles — Onboarding/Auth, Guest, Host, Staff, and shared Check-In
**Status:** Reflects the current mobile prototype (login-first, count-only additional guests, walk-in support, repeat-scan check-in)

---

## How to read this document

- **User Story ID** uses a domain prefix:
  - `AUTH-xx` — Onboarding & Authentication
  - `GST-xx` — Guest role
  - `HST-xx` — Host role
  - `STF-xx` — Staff role
  - `CHK-xx` — Shared Check-In engine (used by Host & Staff)
  - `SYS-xx` — Cross-cutting / system behavior
- Each story follows the format: **As a … I want … so that …**, plus **Acceptance Criteria (AC)** written as verifiable conditions.
- "End-to-end" flows are described at the end of each domain to show how stories chain together.

### Roles at a glance

| Role | Enters via | Primary surface | Can be remembered? |
|------|-----------|-----------------|--------------------|
| Guest | Sign up / log in (OTP) | Tickets, Explore, Messages, Profile | Yes (web session) |
| Host (Individual) | Sign up / log in (OTP) | Dashboard, Events, Guests, Messages, Account | Yes |
| Host (Organization) | Sign up → in-app document verification | Same as Host, gated until verified | Yes |
| Staff | Invite ID + email/phone (no signup) | Role-gated: Check-in / Guests / Profile | No (must re-enter each session) |

### Demo credentials (prototype)

| Role | Contact | Invite ID |
|------|---------|-----------|
| Host (Individual) | alex@safalevent.com | — |
| Host (Organization, pending) | org@safalevent.com | — |
| Guest | alice@example.com | — |
| Staff — Coordinator | sam@safalevent.com | INV-SAM-2026 |
| Staff — QR Scanner | gabe@safalevent.com | INV-GATE-1 |
| Staff — Front-desk | maria@safalevent.com | INV-MARIA-9 |

---

# 1. Onboarding & Authentication (AUTH)

### AUTH-01 — Launch & route on splash
**As a** returning or new user, **I want** the app to show a brief branded splash and then route me correctly, **so that** I land in the right place without manual navigation.

**Acceptance Criteria**
- AC1: On launch, a splash screen displays the SafalEvents brand lockup, the tagline "Events worth showing up for", and a loading spinner.
- AC2: After ~650ms, once auth state is ready, a remembered **host** is routed to Host tabs and a remembered **guest** to Guest tabs.
- AC3: If no remembered non-staff session exists, the user is routed to the **Login/Sign-up** screen (the app is login-first; there is no public landing/browse page).
- AC4: A previously signed-in **staff** member is NOT auto-restored and is routed to Login.

### AUTH-02 — Login-first entry (no guest landing)
**As a** user opening the app for the first time after install, **I want** to be taken straight to the login page, **so that** I authenticate before using the app.

**Acceptance Criteria**
- AC1: A fresh install with no session lands directly on the Auth screen.
- AC2: The Auth screen has no "close"/dismiss control and no "Browse events" escape hatch (there is nothing to dismiss to).
- AC3: Signing out from any role returns the user to the Auth screen.

### AUTH-03 — Choose Sign up vs Log in
**As a** user, **I want** to switch between Sign up and Log in, **so that** I can either create an account or access an existing one.

**Acceptance Criteria**
- AC1: A segmented control toggles between "Sign up" and "Log in".
- AC2: Account-type selectors (Guest/Host) appear only in Sign up mode.
- AC3: Demo persona quick-logins appear only in Log in mode.

### AUTH-04 — Guest sign up (OTP)
**As a** prospective guest, **I want** to register with my name and email/phone and verify via a code, **so that** I can RSVP to events.

**Acceptance Criteria**
- AC1: Guest sign up collects Full name and Email/phone (Phone optional).
- AC2: Tapping "Continue with code" validates that email/phone is present, otherwise shows "Enter your email or phone."
- AC3: A 6-digit demo OTP is generated and displayed in a "Demo code" chip.
- AC4: Entering the code (or leaving it blank in demo mode) and confirming creates the account and routes to Guest tabs.
- AC5: A non-6-digit, non-blank code shows "Enter the 6-digit code, or leave it blank in demo mode."

### AUTH-05 — Individual host sign up (OTP + terms)
**As an** individual host, **I want** to register with my name, city, and contact and agree to terms, **so that** I can create and manage events.

**Acceptance Criteria**
- AC1: Individual host sign up collects First name, Last name, City, Email/phone, Phone.
- AC2: A "I agree to the Terms and Privacy Policy" checkbox is presented.
- AC3: After OTP verification, the account is created and routed to Host tabs.

### AUTH-06 — Organization host sign up (verification gate)
**As an** organization host, **I want** to register my org details and be told how verification works, **so that** I understand I must be approved before hosting.

**Acceptance Criteria**
- AC1: Org sign up collects Organization name, Org type (NGO/Temple/Company/Community/Other), Website, City, State, Contact person, Email/phone.
- AC2: An authorization checkbox ("I'm authorized to represent this organization…") is required; without it, "Continue with code" is blocked with a message.
- AC3: An info note states documents are uploaded inside the app and reviewed by an admin.
- AC4: After OTP, an "Account created" success screen appears with a "Continue to verification" action (not an auto-redirect into full hosting).
- AC5: The org account is created in an unverified/pending state.

### AUTH-07 — Unified login (OTP, routed by stored role)
**As a** registered host or guest, **I want** to log in with just my email/phone and a code, **so that** I'm taken to the correct experience without choosing my role again.

**Acceptance Criteria**
- AC1: Login collects only Email/phone (no password).
- AC2: The account is looked up; unknown contacts surface an appropriate error.
- AC3: After OTP, routing is by the stored account role: host → Host tabs, guest → Guest tabs.
- AC4: A host login also sets the current host context for host screens.

### AUTH-08 — Staff invite login
**As a** staff member, **I want** to sign in with the Invite ID my host shared plus my email/phone, **so that** I can access only my assigned event.

**Acceptance Criteria**
- AC1: "Login as Staff" opens a staff sign-in form with Invite ID (auto-uppercase) and Email/phone fields.
- AC2: A demo hint lists valid staff credentials.
- AC3: Valid Invite ID + matching contact signs in and routes to Staff tabs.
- AC4: Invalid credentials show an inline error and do not sign in.
- AC5: Staff are not offered a "sign up" path.

### AUTH-09 — One-tap demo personas
**As a** reviewer, **I want** one-tap demo logins, **so that** I can explore each role quickly.

**Acceptance Criteria**
- AC1: Login mode lists personas: Host (Alex), Guest (Alice), Staff Coordinator (Sam), and Pending Org (Safal Foundation).
- AC2: Tapping a persona signs in and routes to that role's home.
- AC3: The Pending Org persona bypasses OTP and lands in the host experience with the verification gate active.

### AUTH-10 — OTP resend with cooldown
**As a** user verifying a code, **I want** a resend option with a cooldown, **so that** I can get a new code without spamming.

**Acceptance Criteria**
- AC1: After a code is sent, a 30-second countdown disables "Resend".
- AC2: While counting down it reads "Resend in {n}s"; at 0 it becomes "Resend code".
- AC3: Resending generates a new demo code and restarts the countdown.

### AUTH-11 — Gated action / pending intent
**As a** user attempting an authenticated action while logged out, **I want** to be sent to login and then returned to my original intent, **so that** I don't lose my place.

**Acceptance Criteria**
- AC1: A gated action while unauthenticated stores the intended destination and routes to Auth.
- AC2: After successful auth, the user is routed to the originally intended screen/params rather than the default home.

### AUTH-12 — Session persistence rules
**As a** host or guest, **I want** my session remembered, **so that** I don't log in every time; **as** staff, my session should not persist for security.

**Acceptance Criteria**
- AC1: Host/guest sessions persist (web localStorage) and are restored on next launch.
- AC2: Staff sessions are never persisted; staff must re-enter the Invite ID each session.
- AC3: Sign-out clears the stored session and the current staff context.

**End-to-end (Auth):** Install → Splash (AUTH-01) → Login page (AUTH-02) → choose Sign up/Log in (AUTH-03) → role-specific registration or unified login (AUTH-04..08) → OTP (AUTH-10) → routed to role home, optionally honoring a pending intent (AUTH-11).

---

# 2. Guest Role (GST)

### GST-01 — View my tickets & pending actions
**As a** guest, **I want** to see all my RSVPs and any that need my attention, **so that** I can track my upcoming events.

**Acceptance Criteria**
- AC1: The Tickets screen lists each RSVP as a card with cover, title, date, location, and host.
- AC2: An "Action Required" badge shows the count of RSVPs that are Under Approval or Waitlisted.
- AC3: Each card shows an approval badge: Going (green), Pending (amber), Rejected (red), or Waitlisted (blue).
- AC4: For confirmed-going RSVPs, a check-in status badge is also shown.

### GST-02 — Ticket card actions by state
**As a** guest, **I want** the primary action on each ticket to reflect its state, **so that** I only act when it's valid.

**Acceptance Criteria**
- AC1: Confirmed-going RSVP shows an enabled "View Pass" button → opens the QR pass.
- AC2: Waitlist shows a disabled "Waitlisted" button; Pending shows disabled "Awaiting Approval"; Rejected shows disabled "Not Approved".
- AC3: If event messaging is enabled and the RSVP isn't rejected, a "Message Host" button is shown → opens chat.

### GST-03 — View my check-in / attendance history
**As a** guest, **I want** to see my attendance accuracy and past events, **so that** I understand my track record.

**Acceptance Criteria**
- AC1: A summary card shows Events Attended, Accuracy %, and No-Shows.
- AC2: Accuracy is color-coded (green ≥80%, amber 50–79%, red <50%).
- AC3: Each past event shows checked-in vs RSVP counts and a status badge (Fully Attended / Partial / No Show).
- AC4: With no history, an empty state is shown.

### GST-04 — Explore & search events
**As a** guest, **I want** to browse, search, and filter events by category, **so that** I can find events to attend.

**Acceptance Criteria**
- AC1: The Explore screen lists events with cover, title, rating, type, date, location, and host.
- AC2: A search box filters by title, location, or host (case-insensitive).
- AC3: Category chips (All, Party, Meetup, Fitness, Comedy) filter by event type.
- AC4: No matches shows an empty state.
- AC5: Tapping an event opens its detail screen.

### GST-05 — View event detail
**As a** guest, **I want** full event details, **so that** I can decide whether to RSVP.

**Acceptance Criteria**
- AC1: Detail shows cover, type badge, age badge (if age-restricted), title, date/time, location, capacity, host, and description.
- AC2: Host's custom questions are listed when present.
- AC3: A photo album section appears only when enabled, respecting upload permissions and showing approved photos.
- AC4: An RSVP CTA reflects approval requirement ("Request to Join" vs "RSVP Now") and shows ticket price if payments are enabled.
- AC5: Age-restricted events show a "{minAge}+ only · age verified at RSVP" notice.

### GST-06 — RSVP response (Going / Maybe / Can't Go)
**As a** guest, **I want** to set my attendance response, **so that** the host knows my intent.

**Acceptance Criteria**
- AC1: Three responses are selectable: "I'm Going", "Maybe", "Can't Go".
- AC2: "Maybe"/"Can't Go" record the response without requiring the full form, and show an appropriate confirmation.
- AC3: "I'm Going" unlocks the details, count, questions, and (if enabled) payment sections.

### GST-07 — Provide my details & age verification
**As a** guest RSVPing to an event, **I want** to confirm my contact details and DOB when required, **so that** I meet the event's entry rules.

**Acceptance Criteria**
- AC1: Name (required), Email (required), and Phone (optional) are collected, pre-filled from the profile.
- AC2: For age-restricted events, Date of birth is required and validated against the minimum age.
- AC3: An inline badge confirms eligibility ("✓ Age N — eligible") or blocks ("✕ Under {minAge}").
- AC4: Submitting under the minimum age shows a blocking error.

### GST-08 — Additional guests by count only (no names)
**As a** guest, **I want** to indicate how many people I'm bringing without entering their personal details, **so that** RSVP is fast.

**Acceptance Criteria**
- AC1: A stepper sets "Number of guests (including you)" between 1 and 10.
- AC2: No name, email, phone, or DOB is collected for additional guests.
- AC3: When count > 1, a helper note reads "Bringing {n} additional guest(s) — just the count, no names needed."
- AC4: For age-restricted events, the notice clarifies accompanying guests' ages are verified at the door.

### GST-09 — Answer host questions
**As a** guest, **I want** to answer the host's custom questions, **so that** the host has the info they need.

**Acceptance Criteria**
- AC1: Each event question renders an input that stores my answer keyed to the question.
- AC2: Answers are submitted with the RSVP.

### GST-10 — Pay for a paid event
**As a** guest, **I want** to enter payment details for paid events, **so that** I can secure my ticket.

**Acceptance Criteria**
- AC1: When payments are enabled, the ticket price and card/expiry/CVC fields are shown.
- AC2: (Prototype) Payment is simulated; submission proceeds without a live charge.

### GST-11 — RSVP confirmation outcomes
**As a** guest, **I want** a clear confirmation after submitting, **so that** I know my status.

**Acceptance Criteria**
- AC1: Outcome screens differ by result: Confirmed, Request submitted (approval required), Waitlisted, Maybe, Declined — each with matching icon, title, and message.
- AC2: Confirmed RSVPs offer "View My Pass"; all outcomes offer "Go to My Tickets" and "Back to event".
- AC3: A summary card shows event, date, attendee count, and a status badge for non-declined/non-maybe outcomes.

### GST-12 — View QR ticket pass
**As a** guest, **I want** a scannable pass with my details, **so that** I can be checked in at the door.

**Acceptance Criteria**
- AC1: The pass shows a QR code, Reference ID, Booking ID, event details, and a party-size badge if >1.
- AC2: Age-restricted events show an age-verified/unverified badge.
- AC3: A check-in status line shows "Checked In" or "Not Checked In Yet".

### GST-13 — Edit my RSVP from the pass
**As a** guest, **I want** to change my guest count, answers, and attendance status when allowed, **so that** I can keep my RSVP accurate.

**Acceptance Criteria**
- AC1: Guest count and question answers are editable only when the event allows self-edit; otherwise displayed read-only.
- AC2: A "Change Attendance RSVP" control lets me set Going / Maybe / Declined, with a confirmation of the new status.

### GST-14 — Save / share / calendar from pass
**As a** guest, **I want** to save, share, and add the event to my calendar, **so that** I keep my pass handy.

**Acceptance Criteria**
- AC1: "Save Pass to Phone", "Share Pass Link", Google/Apple Calendar, and (if messaging enabled) "Message the Host" actions are available.
- AC2: (Prototype) Save/share/calendar produce simulated confirmations; Message opens chat.

### GST-15 — Message a host
**As a** guest, **I want** to message the host of an event, **so that** I can ask questions.

**Acceptance Criteria**
- AC1: A chat thread shows my messages (right, primary) and host messages (left) with timestamps.
- AC2: An input with a Send control is available (prototype: simulated send).
- AC3: Messaging is only available where the event has messaging enabled.

### GST-16 — Messages inbox & delivery logs
**As a** guest, **I want** to see my conversations and notification logs, **so that** I can manage communications.

**Acceptance Criteria**
- AC1: A "Conversations" tab lists chats with host avatar, event title, last message, and an unread dot.
- AC2: A "Delivery logs" tab lists received notifications with channel badge (Email/SMS), subject, recipient, and time.
- AC3: Each list has an empty state.

### GST-17 — Guest profile & preferences
**As a** guest, **I want** to view my stats and manage notification preferences, **so that** I control how I'm contacted.

**Acceptance Criteria**
- AC1: Profile shows avatar, name, email, a "Guest" badge, and stat cards (Attended, Upcoming, Messages).
- AC2: Toggles for Email reminders, SMS reminders, and New message alerts persist via settings updates.
- AC3: Account menu items (Edit profile, Notification preferences, Help & Support) are available.
- AC4: "Switch account" returns to login; "Log out" clears the session and returns to Auth.

**End-to-end (Guest):** Log in → Explore (GST-04) → Event detail (GST-05) → RSVP response + details + count + questions + payment (GST-06..10) → confirmation outcome (GST-11) → Tickets (GST-01) → View Pass (GST-12) → optionally edit/share/message (GST-13..15) → attend & get checked in → attendance history updates (GST-03).

---

# 3. Host Role (HST)

### HST-01 — Host dashboard overview
**As a** host, **I want** an at-a-glance dashboard, **so that** I can monitor my events and pending work.

**Acceptance Criteria**
- AC1: Dashboard shows a greeting, avatar, and a notifications bell with an unread indicator.
- AC2: Quick stats show Total Events, Unread Messages, RSVP Pending, and Events Pending.
- AC3: Analytics cards render: RSVP Response Overview, Earnings Growth, Guest Demographics, and Successful Participation by day.
- AC4: A "Pending Approvals" callout appears only when approvals are pending and links to review.
- AC5: A "Your events" section lists recent events (tap → manage) plus "See all" and "Create event".

### HST-02 — Manage event portfolio
**As a** host, **I want** to view and filter my events, **so that** I can find and open any event.

**Acceptance Criteria**
- AC1: The Events screen has tabs Upcoming / Past / Drafts and a search field.
- AC2: Each event card shows cover, title, status badge, date/time, location, RSVP count vs capacity, and a Manage affordance.
- AC3: A "New" action opens the create-event flow.

### HST-03 — Create an event (guided steps)
**As a** host, **I want** a step-by-step event builder, **so that** I can configure everything before publishing.

**Acceptance Criteria**
- AC1: Steps: Basics → Theme → Visibility → Rules, with Back/Next and a step indicator.
- AC2: Basics collects title, event type, date, time, location, description.
- AC3: Theme allows accent theme and cover image selection.
- AC4: Visibility collects privacy (Public/Private/Unlisted), RSVP status (Open/Closed), capacity, max guests per RSVP, and RSVP deadline.
- AC5: Rules covers approval, messaging, self-edit, self-cancellation (+cutoff/reason), comments, age restriction (+min age), photo album (+permissions/approval), notifications, payments (+price/bank), and custom questions.
- AC6: Final step offers "Publish Event" and "Save Draft"; both create the event and open its management screen.

### HST-04 — Event overview & broadcast
**As a** host, **I want** an overview of an event with quick communication tools, **so that** I can act fast.

**Acceptance Criteria**
- AC1: Overview shows stat cards (RSVPs, Going, Pending, Waitlist) and a capacity progress bar.
- AC2: A broadcast composer sends a message to all confirmed guests and confirms the queued count.
- AC3: An "Export guests" action generates a CSV (name, email, phone, status, RSVP count, checked-in count, attendance category).
- AC4: A recent activity timeline lists audit entries.

### HST-05 — Approve, reject, waitlist & manage RSVPs
**As a** host, **I want** to manage incoming RSVPs, **so that** I control who attends.

**Acceptance Criteria**
- AC1: "Under Approval" lists pending RSVPs with Approve and Reject (with confirmation), plus "Approve all".
- AC2: "Waitlist — Under Approval" lists waitlisted RSVPs with "Approve & Allow In" and Reject.
- AC3: A "Rejected" section lists rejected RSVPs with a "Re-open" action.
- AC4: "Confirmed attendees" lists approved-going RSVPs with search, age-verification badges, inline check-in controls, and a remove action.
- AC5: Capacity rules drive waitlisting when the event is full.

### HST-06 — Invite & manually add guests
**As a** host, **I want** to add guests manually and share invitations, **so that** I can fill my event.

**Acceptance Criteria**
- AC1: A manual add form (name, email, phone, guest count) creates an approved RSVP, respecting capacity.
- AC2: "Share via WhatsApp" and "Share link" produce a pre-composed invitation.
- AC3: An invitation outbox lists sent invites with channel badges.

### HST-07 — Photo album management
**As a** host, **I want** to manage the event photo album, **so that** I control shared photos.

**Acceptance Criteria**
- AC1: When the album is off, a prompt explains how to enable it in Settings.
- AC2: When on, the host can add photos and see upload permissions/approval state.
- AC3: Guest uploads needing approval appear in a "Pending approval" list with Approve/Reject.
- AC4: An album grid shows approved photos with delete and a "Guest" tag for guest uploads.

### HST-08 — Messaging & broadcasts
**As a** host, **I want** to message guests and broadcast updates, **so that** I keep attendees informed.

**Acceptance Criteria**
- AC1: A messaging toggle reflects whether guest messaging is enabled.
- AC2: A broadcast composer sends to all confirmed guests.
- AC3: A conversations list shows per-guest threads with unread indicators; when messaging is off, a note explains guests don't see the option.

### HST-09 — Polls
**As a** host, **I want** to create polls, **so that** I can gather guest preferences.

**Acceptance Criteria**
- AC1: A poll has a question and ≥2 options; options can be added/removed.
- AC2: Publishing requires a question and at least two non-empty options.
- AC3: Active polls show per-option vote counts, percentages, progress bars, and total votes.

### HST-10 — Comments
**As a** host, **I want** to post and moderate event comments, **so that** I can communicate publicly.

**Acceptance Criteria**
- AC1: A composer posts a comment attributed to the host.
- AC2: Comments list shows author, text, timestamp, and a delete action.

### HST-11 — Payments & payouts (event)
**As a** host, **I want** to manage paid-event settings and payout details, **so that** I can collect money.

**Acceptance Criteria**
- AC1: A payments status card shows enabled/free state and ticket price.
- AC2: A payout bank form (bank name, holder, routing, account) saves to the event.
- AC3: A "Connect payments" action exists (prototype: simulated).

### HST-12 — Notification logs
**As a** host, **I want** to see all dispatched notifications, **so that** I can audit communications.

**Acceptance Criteria**
- AC1: The log lists each notification with channel icon/badge (Email/SMS), subject, recipient, and time.
- AC2: An empty state appears when none have been sent.

### HST-13 — Edit event settings & delete
**As a** host, **I want** to edit event details and rules or delete the event, **so that** I can keep it current.

**Acceptance Criteria**
- AC1: Editable fields include title, date, time, location, capacity, description, recurrence (None/Weekly/Monthly).
- AC2: Rule toggles include approval, messaging, self-edit, paid ticket, and age restriction (+min age).
- AC3: "Save settings" persists changes; "Delete event" confirms then removes the event and returns back.

### HST-14 — In-event check-in (Host)
**As a** host, **I want** to scan/verify guests and track arrivals from the event, **so that** I can run the door.

**Acceptance Criteria**
- AC1: A Check-in tab provides a scan affordance, demo guest list, and manual pass-ID entry.
- AC2: A valid scan renders the full Check-In detail panel (see CHK stories); invalid scans show a denial card.
- AC3: A "Going guests" list provides inline check-in controls (+1 / All / Undo).
- AC4: The floating "Scan QR" button opens a full-screen scanner from anywhere with an event picker, demo list, and manual entry.

### HST-15 — Guest directory & intelligence
**As a** host, **I want** rich guest analytics, **so that** I can assess reliability and plan capacity.

**Acceptance Criteria**
- AC1: A directory lists guests with trust score bar, pattern badge, events count, and reminders sent.
- AC2: Summary stats show Total Guests, High Trust (≥70), At-Risk (<50), and Reminded.
- AC3: Filters: search, Trust Level, Pattern, and multi-select Events; a reset clears all.
- AC4: A guest detail view shows a trust verdict banner, summary/behavior stats, attendance history (RSVP/Actual/Δ), recent activity, communication history, private host notes, and quick actions.
- AC5: Quick actions include check-in scanner, send reminder/message, and view RSVP/check-in history sub-modals.

### HST-16 — Notifications inbox (Host)
**As a** host, **I want** an activity inbox, **so that** I stay on top of RSVPs, messages, and check-ins.

**Acceptance Criteria**
- AC1: Notifications list with type-specific icon/color, title, message, timestamp, and unread dot.
- AC2: An empty state appears when caught up.

### HST-17 — Account, billing & subscription
**As a** host, **I want** to manage my profile, plan, and earnings, **so that** I can run my account.

**Acceptance Criteria**
- AC1: Profile card shows avatar, name, email, and host-type badge.
- AC2: Billing shows current plan, usage bars (events/staff/photos) with amber/red thresholds, plan upgrade list, and top-up store.
- AC3: Transaction history and (for verified hosts) earnings balance + payouts are shown.
- AC4: Settings include notification toggles and menu links (Staff & Roles, Integrations, Help).
- AC5: An account switcher lets the host swap between demo accounts; "Log out" returns to Auth.

### HST-18 — Organization verification
**As an** organization host, **I want** to upload and submit verification documents, **so that** I can be approved to host.

**Acceptance Criteria**
- AC1: Org info card shows org details and a status badge (Documents required / Pending / Verified / Rejected).
- AC2: Documents can be uploaded and removed; "Submit for verification" (or "Re-submit") changes status to pending.
- AC3: Rejected state shows the reason and allows re-upload.
- AC4: A demo "Simulate admin approval" action transitions the org to verified.

### HST-19 — Verification gate enforcement
**As the** system, **I want** to gate hosting features until an org is verified, **so that** only approved orgs publish events.

**Acceptance Criteria**
- AC1: Unverified org hosts see a verification gate on Dashboard, Events, Guests, and Messages directing them to Account.
- AC2: Once verified, full host functionality is available.

### HST-20 — Staff & roles management
**As a** host, **I want** to invite teammates and assign roles, **so that** I can delegate event operations.

**Acceptance Criteria**
- AC1: An invite form (name, email, role) generates an Invite ID.
- AC2: The team list shows each member's role and status (ACTIVE/PENDING/INVITED) with remove and inline role-change.
- AC3: A roles reference lists each built-in role (Coordinator, Front-desk, QR Scanner, Viewer) and its granted/denied permissions.

### HST-21 — Integrations
**As a** host, **I want** to connect external tools, **so that** I can extend the platform.

**Acceptance Criteria**
- AC1: Integrations list shows each tool with connect/disconnect and a connected count.
- AC2: Toggling updates the connection state.

**End-to-end (Host):** Log in (or verify org — HST-18/19) → Dashboard (HST-01) → Create event (HST-03) → manage RSVPs/approvals (HST-05), invite/add guests (HST-06), configure album/polls/comments/payments (HST-07..11) → broadcast updates (HST-08) → run check-in (HST-14 + CHK) → review guest intelligence & exports (HST-15, HST-04) → manage team/billing/integrations (HST-20/17/21).

---

# 4. Staff Role (STF)

### STF-01 — Role-gated navigation
**As a** staff member, **I want** to see only the tabs my role permits, **so that** my view matches my responsibilities.

**Acceptance Criteria**
- AC1: The Check-in tab appears only with the `checkin` permission.
- AC2: The Guests tab appears only with the `guests_view` permission.
- AC3: The Profile tab always appears.
- AC4: A QR Scanner sees Check-in only; a Coordinator sees Check-in + Guests.

### STF-02 — Gate check-in (Staff)
**As a** check-in staff member, **I want** to scan/verify guest passes and record arrivals, **so that** I can admit guests at the door.

**Acceptance Criteria**
- AC1: A live counter shows arrived vs total attendees (summing party sizes) with a progress bar.
- AC2: A scan affordance opens a demo scanner with manual pass-ID entry and a tappable demo guest list.
- AC3: A valid scan renders the shared Check-In detail panel with controls per the staff member's permissions.
- AC4: Invalid/duplicate/pending/rejected scans show the appropriate denial/notice with a retry.
- AC5: A "Recent arrivals" list updates in real time with name, time, and an "Arrived" badge.
- AC6: Check-in controls require the `checkin` permission.

### STF-03 — Staff guest list & quick door controls
**As a** coordinator, **I want** a full guest list with quick check-in actions, **so that** I can manage arrivals efficiently.

**Acceptance Criteria**
- AC1: The list separates "Confirmed attendees" from "Pending / waitlist / not approved".
- AC2: Each confirmed row shows check-in state and quick controls (+1, All {remaining}, Undo) when permitted.
- AC3: Party-of-N rows expand to show each member's arrived/pending state.
- AC4: Tapping a row opens a detail modal rendering the shared Check-In panel.
- AC5: Quick arrivals confirm with a partial vs full message.

### STF-04 — Permission-gated history & actions
**As the** system, **I want** to hide history/actions a staff role lacks, **so that** staff only do what they're allowed.

**Acceptance Criteria**
- AC1: `canCheckin` = `checkin` OR `guests_edit`; `canViewHistory` = `history_view` OR `guests_view`.
- AC2: Without history permission, the detail modal hides attendance intelligence and shows an explanatory note.
- AC3: Without check-in permission, check-in controls are hidden with a note.

### STF-05 — Staff profile & access
**As a** staff member, **I want** to see my role and exact permissions, **so that** I understand my access.

**Acceptance Criteria**
- AC1: Profile shows avatar, name, email, role badge, role description, and assigned event.
- AC2: A permissions panel lists each capability as Allowed or Hidden for my role.
- AC3: "Switch account" returns to login; "Log out" clears my session and returns to Auth.

**End-to-end (Staff):** Receive Invite ID → staff login (AUTH-08) → role-gated tabs (STF-01) → run gate check-in (STF-02) and/or work the guest list (STF-03) within permission limits (STF-04) → review own access (STF-05) → log out (no persisted session).

---

# 5. Shared Check-In Engine (CHK)

> Used identically by Host (HST-14, Scan FAB) and Staff (STF-02/03). Permission flags differ by entry point: hosts always have full check-in + history; staff are permission-gated.

### CHK-01 — Scan validation & entry verdict
**As a** door operator, **I want** a clear verdict when I scan a pass, **so that** I know whether to admit the guest.

**Acceptance Criteria**
- AC1: Validation returns one of: valid, rejected, pending, notgoing (not confirmed), duplicate, or invalid.
- AC2: The panel shows a banner: "ENTRY DENIED" (denied), "ALL ATTENDEES IN" (complete), or "VALID — READY TO CHECK IN".
- AC3: Denial reasons are displayed (e.g., "Guest was not approved", "Still Under Approval", "Not valid for this event").

### CHK-02 — Guest identity & age verification
**As a** door operator, **I want** to see who the pass belongs to and their age eligibility, **so that** I can verify entry.

**Acceptance Criteria**
- AC1: Identity card shows name, email, phone, event, and ticket type.
- AC2: For age-restricted events: green "verified" (with age from DOB or verified flag), red "Under {min} — deny entry", or amber "Age unverified — check physical ID".

### CHK-03 — Current attendance summary
**As a** door operator, **I want** the live attendance breakdown, **so that** I know who's in and who's expected.

**Acceptance Criteria**
- AC1: Stats show RSVP Count, Checked-In, Remaining, Walk-Ins, and (when walk-ins exist) Actual Total.
- AC2: A progress bar reflects checked-in/total and turns green at full.

### CHK-04 — Primary-and-party pre-selected check-in
**As a** door operator, **I want** the whole party pre-selected on scan, **so that** I can admit everyone in one tap or deselect absentees.

**Acceptance Criteria**
- AC1: On first scan, the stepper defaults to the full party (all selected).
- AC2: A helper note reads "All {n} selected by default — tap − to deselect anyone who didn't arrive."
- AC3: The minimum selectable is 1 (the pass holder / primary).
- AC4: The button reads "Check In All {n}" when all are selected, or "Check In {n}" when reduced.
- AC5: Confirming records the arrivals and resets the stepper to "all" for the next scan; a "Check-in successful!" confirmation appears briefly.

### CHK-05 — Repeat scan continues, never duplicates
**As a** door operator, **I want** rescanning the same pass to continue from the latest state, **so that** late-arriving party members are added without duplicates.

**Acceptance Criteria**
- AC1: A repeat scan of a partially-checked-in pass shows an amber "Already partially checked in — X of Y arrived" banner.
- AC2: The stepper defaults to all remaining attendees (min 1) and check-in adds to the existing count.
- AC3: No duplicate RSVP/record is created; the running total reflects all sessions.

### CHK-06 — Walk-in guests by count only
**As a** door operator, **I want** to add unplanned walk-ins by count, **so that** extra arrivals are recorded without collecting personal data.

**Acceptance Criteria**
- AC1: A walk-in stepper requires only a count (no name/email/phone).
- AC2: "+ Add & Check-In {n}" records the walk-ins immediately and shows a success confirmation.
- AC3: Walk-ins increment a separate Walk-Ins stat and the Actual Total.

### CHK-07 — Check-in activity timeline
**As a** host/staff, **I want** a per-event timeline of every check-in action, **so that** I have an audit trail.

**Acceptance Criteria**
- AC1: Each entry shows time, scanner name, and a description: "Primary guest + N additional checked in", "N additional guests checked in", or "+N walk-in guests added".
- AC2: A running total line shows "Total checked-in: X" (or "Total attendance: X" for walk-ins).
- AC3: A footer summarizes "Total Attendance: X of Y [+ Z walk-ins = W actual]".

### CHK-08 — Party member roster (no names)
**As a** door operator, **I want** to see each party slot's arrival status, **so that** I can track who's in.

**Acceptance Criteria**
- AC1: For parties >1, members are listed positionally as "Primary Guest" and "Additional Guest N" (no personal names).
- AC2: Each slot shows Arrived (green check) or Pending.

### CHK-09 — Undo / reset arrivals
**As a** door operator, **I want** to undo a completed check-in, **so that** I can correct mistakes.

**Acceptance Criteria**
- AC1: When fully checked in, a completion banner shows with an "Undo" action (when permitted).
- AC2: Undo resets the check-in count and clears the log for that RSVP.

### CHK-10 — Cross-event guest intelligence (history view)
**As a** host (or permitted staff), **I want** to see the guest's reliability across events, **so that** I can plan capacity.

**Acceptance Criteria**
- AC1: A verdict banner classifies the guest: Reliable (trust ≥70, green), High No-Show/Over-RSVP risk (<50 or over-RSVP, red), or Partial (amber).
- AC2: Summary stats show events, accuracy %, no-shows, partials.
- AC3: A recent history table shows Event, RSVP, Actual, and Δ (red negative / green positive).
- AC4: First-time guests show a "no past attendance" note.
- AC5: This section is hidden when the viewer lacks history permission.

**End-to-end (Check-In):** Scan pass → verdict + identity + age (CHK-01..02) → review attendance (CHK-03) → admit whole party or deselect absentees (CHK-04) → rescan later for stragglers (CHK-05) → add walk-ins (CHK-06) → every action logged (CHK-07) with party roster (CHK-08), correctable via undo (CHK-09); permitted viewers also see guest intelligence (CHK-10).

---

# 6. Cross-Cutting / System (SYS)

### SYS-01 — Live in-memory state sync
**As a** user, **I want** actions to reflect immediately across screens, **so that** data stays consistent in-session.

**Acceptance Criteria**
- AC1: Check-ins, walk-ins, approvals, and edits update dependent screens (dashboard, guests, tickets, check-in) within the session via the shared store.
- AC2: No backend persistence is implied; state resets on app reload (prototype).

### SYS-02 — Native-feeling mobile interactions
**As a** user, **I want** native-style touch feedback and transitions, **so that** the app feels like a real mobile app.

**Acceptance Criteria**
- AC1: Interactive elements use press feedback (scale/opacity) and list rows highlight on press.
- AC2: Tab bars use filled/active icons with an active indicator; screen transitions and bottom-sheet overlays animate.

### SYS-03 — Capacity, approval & waitlist rules
**As the** system, **I want** consistent RSVP lifecycle rules, **so that** events never exceed capacity improperly.

**Acceptance Criteria**
- AC1: Approval-required events hold RSVPs as Under Approval until a host acts.
- AC2: At capacity, new RSVPs are waitlisted; approving from waitlist confirms and admits.
- AC3: `approvalState` (UNDER_APPROVAL/APPROVED/REJECTED) is tracked orthogonally to `status` (going/maybe/declined/waitlist).

### SYS-04 — Age-restriction enforcement
**As the** system, **I want** to enforce minimum-age rules, **so that** restricted events stay compliant.

**Acceptance Criteria**
- AC1: Age-restricted events collect the primary guest's DOB at RSVP and block under-age submissions.
- AC2: Additional guests are not asked for DOB; their ages are verified at the door.
- AC3: Check-in shows the primary's age verification state.

### SYS-05 — Permission model (staff)
**As the** system, **I want** role-based permissions, **so that** staff capabilities are scoped.

**Acceptance Criteria**
- AC1: Built-in roles (Coordinator, Front-desk, QR Scanner, Viewer) define permissions across guests, check-in, messaging, history, settings, and staff management.
- AC2: Navigation, controls, and history visibility derive from the assigned role's permissions.

---

## Appendix A — Story index

| ID range | Domain | Count |
|----------|--------|-------|
| AUTH-01 … AUTH-12 | Onboarding & Authentication | 12 |
| GST-01 … GST-17 | Guest | 17 |
| HST-01 … HST-21 | Host | 21 |
| STF-01 … STF-05 | Staff | 5 |
| CHK-01 … CHK-10 | Shared Check-In | 10 |
| SYS-01 … SYS-05 | Cross-cutting / System | 5 |

## Appendix B — Glossary

- **RSVP states:** `status` = going / maybe / declined / waitlist; `approvalState` = UNDER_APPROVAL / APPROVED / REJECTED.
- **Walk-in:** An unplanned attendee added at the door by count only, recorded against the primary RSVP.
- **Partial check-in:** Some, but not all, of a party's attendees have arrived.
- **Trust score / pattern:** Cross-event reliability metric (Consistent / Partial / Over-RSVP / Frequent No-Show) shown to hosts and permitted staff.
- **Verification gate:** The block preventing unverified organization hosts from hosting until documents are approved.

---

*Prototype note: payments, real QR camera scanning, document upload, sharing, and message sending are simulated in the current build. All RSVP, approval, check-in, walk-in, and attendance logic is functional against the in-memory store.*
