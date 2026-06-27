# Safal Events - Comprehensive Product Requirements & User Story Document

## Document Information
| Field | Details |
| :--- | :--- |
| **Product Name** | Safal Events |
| **Module Name** | End-to-End Application Platform (Host, Guest, Staff, Superadmin) |
| **Document Version** | 4.0.0 |
| **Author** | Antigravity AI |
| **Last Updated** | June 27, 2026 |
| **Document Status** | Approved |
| **Target Platforms** | Web, Android, iOS |
| **Web Mockup URL** | [https://safal-events.vercel.app](https://safal-events.vercel.app) |
| **Mobile Mockup URL** | [https://safalevents.netlify.app](https://safalevents.netlify.app) |
| **Related Modules** | Authentication, Event Builder, Audience Intelligence, Guest Portal, Smart Scanner, Superadmin Panel |

### Revision History
| Version | Date | Description | Author |
| :--- | :--- | :--- | :--- |
| 1.0.0 | June 27, 2026 | Initial PRD covering core check-in features | Antigravity AI |
| 2.0.0 | June 27, 2026 | Added mobile guest list tabs and organizer settings | Antigravity AI |
| 3.0.0 | June 27, 2026 | Sequenced initial user stories (US-01 to US-16) | Antigravity AI |
| 4.0.0 | June 27, 2026 | Exhaustive coverage (US-01 to US-22) explaining every single sub-feature in both Web and Mobile | Antigravity AI |

---

## Overview

### Business Overview
Safal Events is a centralized event management, ticketing, and door-operations ecosystem designed for modern event organizers (Hosts). It bridges online guest registration with on-site door management, enabling hosts to verify guest reliability, coordinate support staff, scan tickets, handle walk-ins, and manage financial payouts. The platform includes a self-service panel for guests to explore events and manage their tickets, a limited interface for gate staff to run check-ins, and a back-office console for platform superadmins to enforce compliance and configure platform parameters.

### Problem Statement
Event organizers currently operate in a fragmented ecosystem, using separate tools for RSVP collection, guest communication, gate check-ins, staff coordination, and tax compliance. This fragmentation leads to:
1. **Unreliable Guest Data**: High no-show rates due to over-registration without automated reminders.
2. **Door Bottlenecks**: Inflexible scanning systems that fail to handle partial party arrivals or overflow walk-ins.
3. **Security & Gating Issues**: Ineffective age restrictions, unmoderated guest uploads, and lack of staff access limits.
4. **Administrative overhead**: Manual verification of organization tax documents and manual overrides for plan limits.

### Business Goals
- Eliminate gate queues by providing a lightning-fast QR scanner supporting partial arrivals and walk-ins.
- Improve host planning metrics through auto-reminders and guest trustworthiness scoring.
- Protect platform reputation by enabling superadmins to inspect host legitimacy documents and moderate public event directories.
- Support platform scaling via subscription billing, custom staff roles, and branding configurations.

### Objectives
- Deliver a responsive Web platform and companion iOS/Android Mobile apps with consistent role-based screens.
- Build a multi-step event builder that supports custom questionnaires, custom themes, and payment gating.
- Implement real-time audience intelligence dashboard for hosts to track no-show habits and trust levels.
- Provide a superadmin back-office dashboard to manage global economics, platform settings, and verified organizations.

### Target Audience & User Roles
- **Host (Individual / Org)**: Event creators with full access to event settings, guest lists, and billing.
- **Guest**: End-users who discover events, RSVP, and present QR passes.
- **Staff**: On-site personnel restricted to scanning QR codes and managing door entry.
- **Superadmin**: Safal Events internal administrators who verify Org documents and monitor platform health.

---

## Epic Summary

| Epic ID | Epic Name | Epic Description | Total Features | Total User Stories |
| :--- | :--- | :--- | :--- | :--- |
| **EPIC-01** | Multi-Role Access & Identity | Login, registration, role-based access scopes, and demo mode. | 2 | 2 |
| **EPIC-02** | Host Event Lifecycle & Admin | Event lifecycle creation, themes, rules configuration, and billing plans. | 4 | 4 |
| **EPIC-03** | Host Audience Intelligence | Tabbed guest directories, trust analytics, history logs, and notes. | 2 | 2 |
| **EPIC-04** | Host Marketing & Automation | Auto-replies, notification schedules, and integrated services. | 3 | 3 |
| **EPIC-05** | Guest Discovery & Registration | Exploring public listings, multi-step RSVPs, passes, and self-service. | 3 | 4 |
| **EPIC-06** | Staff Operations & Scan Gate | Camera-based check-in, party steppers, and manual walk-ins. | 3 | 3 |
| **EPIC-07** | Superadmin Portal Operations | Compliance reviews, plan overrides, billing logs, and global settings. | 4 | 4 |

---

## Feature Summary

| Feature ID | Feature Name | Feature Description | Epic Mapping |
| :--- | :--- | :--- | :--- |
| **FEAT-01** | Role-Based Auth & Gating | Passwordless email/phone OTP login routing users by system role. | EPIC-01 |
| **FEAT-02** | Staff Scope Gating | Gating staff screens and event lists based on 13 permissions. | EPIC-01 |
| **FEAT-03** | Event Creation Wizard | 4-step wizard: details, cover templates, rules setup, and payments. | EPIC-02 |
| **FEAT-04** | Host Subscription Billing | Tiers, limits, top-ups, and scheduled downgrades. | EPIC-02 |
| **FEAT-05** | Custom Staff Onboarding | Inviting staff, selecting scopes, and customizing roles. | EPIC-02 |
| **FEAT-06** | Segmented Guest Directory | Tabs for Confirmed, Approval, Waitlist, and Rejected RSVP. | EPIC-03 |
| **FEAT-07** | Trust Scoring & Insights | Trust percentage calculation and attendance pattern analyzer. | EPIC-03 |
| **FEAT-08** | Shared Photo Gallery | Host & Guest image uploads with optional moderation. | EPIC-04 |
| **FEAT-09** | Message Automation Rules | Keyword auto-replies and editable message templates. | EPIC-04 |
| **FEAT-10** | Security Audit Trail Logs | Immutable record of system changes and notification schedules. | EPIC-04 |
| **FEAT-11** | Integrated Services | Connecting third-party APIs (Stripe, Calendar, Slack, Zoom). | EPIC-04 |
| **FEAT-12** | Directory Search & Discover | Filtering event directories by state, city, type, and title. | EPIC-05 |
| **FEAT-13** | Paid & Free RSVP Checkout | Questionnaire response collection and payment gateway simulation. | EPIC-05 |
| **FEAT-14** | Self-Service Digital Pass | Interactive passes, QR codes, self-edits, and cancellations. | EPIC-05 |
| **FEAT-15** | Smart Camera Check-In | QR code scanning viewfinder with feedback state overlays. | EPIC-06 |
| **FEAT-16** | Party Stepper Controller | Check-in counters for partial party entries. | EPIC-06 |
| **FEAT-17** | Walk-in Register | Door-side registrations with automated capacity warnings. | EPIC-06 |
| **FEAT-18** | Org Verification Drawer | File review dashboard for admin approval of tax certificates. | EPIC-07 |
| **FEAT-19** | Global System Manager | Adjusting styling theme colors, payout defaults, and overrides. | EPIC-07 |
| **FEAT-20** | Dress Code Builder | Predefined dress code chips, custom inputs, avoid notes, and inspiration banners. | EPIC-02 |
| **FEAT-21** | Event Mode & Location Configuration | Predefined categories, Onsite/Virtual/Hybrid modes, venue addresses, and virtual joining access credentials. | EPIC-02 |
---

## User Story Summary

| User Story ID | User Story Name | Priority | Platform | Role |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Multi-Role Authentication | Critical | Web/Mobile | All Roles |
| **US-02** | Staff Scope Gating | High | Mobile | Staff |
| **US-03** | Host Event Creation | Critical | Web/Mobile | Host |
| **US-04** | Host Guest Directory Management | High | Web/Mobile | Host |
| **US-05** | Host Guest Trust Analyzer & Notes | Medium | Web/Mobile | Host |
| **US-06** | Host Billing & Plan Upgrades | High | Web | Host |
| **US-07** | Host Team & Role Permissions | High | Web/Mobile | Host |
| **US-08** | Host Shared Photo Gallery | Low | Web/Mobile | Host |
| **US-09** | Host Message Automation Rules | Medium | Web | Host |
| **US-10** | Host Security Audit Trail Logs | Low | Web/Mobile | Host |
| **US-11** | Host Integrated Services | Low | Web/Mobile | Host |
| **US-12** | Guest Event Browse & Search | Medium | Web/Mobile | Guest |
| **US-13** | Guest RSVP Submission | Critical | Web/Mobile | Guest |
| **US-14** | Guest Payment & Checkout | Critical | Web/Mobile | Guest |
| **US-15** | Guest Ticket Pass Wallet | Critical | Web/Mobile | Guest |
| **US-16** | Guest Host Messaging Inbox | Medium | Web/Mobile | Guest |
| **US-17** | Staff Gate Scan Verification | Critical | Mobile | Staff |
| **US-18** | Staff Partial Party Check-in | High | Web/Mobile | Staff |
| **US-19** | Staff Walk-in Guest Management | High | Web/Mobile | Staff |
| **US-20** | Superadmin Host Compliance Review | High | Web | Superadmin |
| **US-21** | Superadmin Hosts & Events Control | Medium | Web | Superadmin |
| **US-22** | Superadmin System Customization | Medium | Web | Superadmin |
| **US-23** | Host Event Dress Code Config | Medium | Web/Mobile | Host |
| **US-24** | Event Mode & Venue Details Config | Critical | Web/Mobile | Host |

---

## Detailed User Stories

### EPIC-01: Multi-Role Access & Identity

#### User Story Information: US-01
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-01 |
| **User Story Name** | Multi-Role Authentication |
| **Epic ID** | EPIC-01 |
| **Feature ID** | FEAT-01 |
| **Priority** | Critical |
| **Story Points** | 5 |
| **User Persona / Role** | All Roles (Host, Guest, Staff, Superadmin) |
| **Platform** | Web / Mobile |
| **Dependencies** | None |
| **Related User Stories** | US-02 (Staff Scope Gating) |

**User Story Description**: 
As a platform user, I want to register and log in using passwordless OTP (Email/Phone verification) and be automatically routed to my role-specific dashboard, so that I can securely access the platform functions.

**User Acceptance Criteria (UAT)**
- **AC-1**: Login screen must allow inputting either email or phone number.
- **AC-2**: Submitting input must trigger a 6-digit OTP code to the provided email/phone and display the verification step.
- **AC-3**: The OTP screen must show a 30-second resend cooldown timer and a fallback to go back to the identifier input.
- **AC-4**: Validating the OTP must route the user to their role's dashboard: Individual/verified Org Hosts to HostDashboard, Guests to GuestDashboard, Superadmins to AdminDashboard, and Staff to GateCheckin.
- **AC-5**: Gated guest actions (like submitting an RSVP) must stash the guest's intent, redirect them to sign up/login, and complete the stashed action upon successful validation.

**Test Scenarios**
- **Positive Test Cases**:
  - Enter valid demo email, input correct OTP -> Routes to correct dashboard.
  - Guest initiates RSVP, completes OTP -> RSVP is finalized automatically.
- **Negative Test Cases**:
  - Input incorrect 6-digit OTP -> Displays "Invalid verification code" error and preserves the input field.
  - Attempt login with uninvited Staff credentials -> Displays validation error.
- **Boundary Test Cases**:
  - Request OTP code resend exactly at 0 seconds on the countdown timer.
- **Permission Test Cases**:
  - Access `/dashboard` directly without logging in -> Redirects to landing page `/` or `/login`.
- **Validation Test Cases**:
  - Check that OTP session expires after exactly 10 minutes from creation.

---

#### User Story Information: US-02
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-02 |
| **User Story Name** | Staff Scope Gating |
| **Epic ID** | EPIC-01 |
| **Feature ID** | FEAT-02 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Staff |
| **Platform** | Mobile / Web |
| **Dependencies** | US-01 |
| **Related User Stories** | US-07 (Host Team & Role Permissions) |

**User Story Description**: 
As a Staff member, I want to access a permission-limited dashboard showing only the events I am assigned to, so that my view and actions are restricted to my job scope.

**User Acceptance Criteria (UAT)**
- **AC-1**: Staff dashboard must filter out any events not present in the staff member's assigned `eventIds` list.
- **AC-2**: The sidebar and tab bars must only render items the staff member has explicit permissions for.
- **AC-3**: If a staff member only has `checkin` permission, they must only see the "Gate Check-in" and "Profile" tabs.
- **AC-4**: Accessing settings or billing pages via direct URL manipulation must display a "Permission Denied" block screen.
- **AC-5**: Any modifications made by staff (such as guest check-ins) must log the staff member's details to the event's audit trail.

**Test Scenarios**
- **Positive Test Cases**:
  - Login as Staff assigned to Event A -> Verify Event B does not appear in the dashboard.
- **Negative Test Cases**:
  - Attempt to check in a guest when the checkin permission toggle is set to false -> "Check In" buttons are disabled.
- **Boundary Test Cases**:
  - Test login with access scope set to "ALL" -> Verify all host events are visible.
- **Permission Test Cases**:
  - Attempt to bypass front-end role checks by manually calling page components in web -> Page Shell returns fallback.
- **Validation Test Cases**:
  - Verify check-in log records "Checked in by Sam Carter (Staff)" instead of "Host".

---

### EPIC-02: Host Event Lifecycle & Admin

#### User Story Information: US-03
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-03 |
| **User Story Name** | Host Event Creation |
| **Epic ID** | EPIC-02 |
| **Priority** | Critical |
| **Story Points** | 8 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01 |
| **Related User Stories** | US-13 (Guest RSVP), US-21 (Superadmin Moderation) |

**User Story Description**: 
As a Host, I want to create and configure an event using a step-by-step wizard to set templates, capacity constraints, age limits, self-service cutoffs, notification templates, and payouts, so that it can be published for guest registration.

**User Acceptance Criteria (UAT)**
- **AC-1**: Host can input mandatory details (Title, Type, Date, Time, Location, Description) in Step 1.
- **AC-2**: Host can select from pre-defined theme gradients and cover templates in Step 2.
- **AC-3**: Host can configure capacity limit, maximum party size, RSVP deadline, and age restrictions in Step 3.
- **AC-4**: Host can set rules for RSVP manual approvals, self-edits, cancellation window limits, and payment gating in Step 4.
- **AC-5**: Submitting the form creates a public shareable URL, unless the user is an unverified Org Host, in which case the dashboard blocks event creation.

**Test Scenarios**
- **Positive Test Cases**:
  - Complete all wizard steps and hit "Publish" -> Event card appears on Host Dashboard and is accessible via the generated link.
- **Negative Test Cases**:
  - Attempt to publish event with a past date -> Displays error blocker on step 1.
- **Boundary Test Cases**:
  - Set capacity to `0` or maximum party size to a negative number -> Triggers validation errors.
- **Permission Test Cases**:
  - Staff without `event_create` attempts to access create wizard -> Access is blocked.
  - Staff with `event_create` but without `event_publish` completes wizard -> Event is created as "Under Approval" and requires Host confirmation.
- **Validation Test Cases**:
  - Verify that the invite link copy-to-clipboard copies the correct absolute URL format.

---

#### User Story Information: US-04
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-04 |
| **User Story Name** | Host Guest Directory Management |
| **Epic ID** | EPIC-02 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Host / Staff (with permissions) |
| **Platform** | Web / Mobile |
| **Dependencies** | US-03 |
| **Related User Stories** | US-13 (Guest RSVP), US-17 (Staff Scan verification) |

**User Story Description**: 
As a Host, I want to view my event's guest list divided into Confirmed, Approval, Waitlist, and Rejected tabs with inline management actions, so that I can easily approve, reject, or re-open attendee requests.

**User Acceptance Criteria (UAT)**
- **AC-1**: Guest list screen must show tabs for Confirmed, Approval, Waitlist, and Rejected.
- **AC-2**: Confirmed tab displays attendees with approved RSVPs and includes inline check-in controllers (+1/All).
- **AC-3**: Approval tab lists RSVPs awaiting host action, with "Approve" and "Reject" buttons.
- **AC-4**: Waitlist tab displays waitlisted guests in FIFO order with manual promotion capabilities.
- **AC-5**: Rejected tab displays rejected guests, their reasons, and a "Re-open" button.

**Test Scenarios**
- **Positive Test Cases**:
  - Click "Approve" in Approval tab -> Guest moves to Confirmed tab.
  - Click "Reject" in Waitlist tab -> Guest moves to Rejected tab.
- **Negative Test Cases**:
  - Approve a guest when event capacity is reached -> Displays capacity override warning.
- **Boundary Test Cases**:
  - Verify tab counts update immediately when moving guests between statuses.
- **Permission Test Cases**:
  - Staff without `guests_approve` attempts to approve guest -> Action disabled.
- **Validation Test Cases**:
  - Export CSV from Guest list -> File contains Name, Email, Phone, RSVP status, check-in log details.

---

#### User Story Information: US-05
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-05 |
| **User Story Name** | Host Guest Trust Analyzer & Notes |
| **Epic ID** | EPIC-02 |
| **Priority** | Medium |
| **Story Points** | 5 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-04 |
| **Related User Stories** | US-17 (Staff Scan verification) |

**User Story Description**: 
As a Host, I want to access a detailed profile for each guest showing their historical attendance accuracy, no-show patterns, communication logs, and private host notes, so that I can evaluate their trustworthiness.

**User Acceptance Criteria (UAT)**
- **AC-1**: Guest detail drawer must display a trust score percentage calculated across all events.
- **AC-2**: Displays attendance category tags: Consistent, Partial, No-Show, or Over-RSVP.
- **AC-3**: Displays a verdict banner highlighting risk (e.g., Red "High No-Show Risk" for scores < 50%).
- **AC-4**: Provides an editable text area for private Host Notes.
- **AC-5**: Displays a timeline of communication logs (delivered notifications) and historical check-in deltas.

**Test Scenarios**
- **Positive Test Cases**:
  - Add text in Host Notes, close drawer, and reopen -> Notes are successfully persisted.
- **Negative Test Cases**:
  - Check details for guest with zero prior RSVPs -> Shows blank history with "First-Time Attendee" badge.
- **Boundary Test Cases**:
  - Test accuracy percentage calculation on boundary numbers (e.g., 1 check-in out of 3 reserved seats).
- **Permission Test Cases**:
  - Staff without `history_view` attempts to open guest details -> Verdict risks and notes are hidden.
- **Validation Test Cases**:
  - Verify that sending an manual email reminder updates the guest communications timeline immediately.

---

#### User Story Information: US-06
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-06 |
| **User Story Name** | Host Billing & Plan Upgrades |
| **Epic ID** | EPIC-02 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Host |
| **Platform** | Web |
| **Dependencies** | US-01 |
| **Related User Stories** | US-20 (Superadmin overrides) |

**User Story Description**: 
As a Host, I want to view my current subscription limits, upgrade to higher tiers, purchase top-up packs, and schedule downgrades, so that I can scale my event hosting capacity.

**User Acceptance Criteria (UAT)**
- **AC-1**: Billing screen must display active usage meters (Active events, attendees, staff seats, photo storage).
- **AC-2**: Host can select from subscription pricing tiers with Monthly or Annual billing options.
- **AC-3**: System calculates prorated upgrades and applies credit adjustments.
- **AC-4**: Host can purchase independent top-up packs to exceed individual plan limits.
- **AC-5**: Downgrades must display a pending schedule indicator rather than locking features immediately.

**Test Scenarios**
- **Positive Test Cases**:
  - Purchase Pro tier upgrade -> Plan limits update immediately in mock database.
  - Purchase Staff top-up pack -> Staff seat count limit increases.
- **Negative Test Cases**:
  - Attempt to invite staff when limit is reached -> Blocks action with upgrade alert modal.
- **Boundary Test Cases**:
  - Downgrade plan when current usage exceeds new plan limits -> Schedules downgrade for billing period end.
- **Permission Test Cases**:
  - Staff role attempts to access Billing settings -> Tab is hidden.
- **Validation Test Cases**:
  - Verify billing invoice logs correctly list payment date, plan details, pricing, and status.

---

#### User Story Information: US-07
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-07 |
| **User Story Name** | Host Team & Role Permissions |
| **Epic ID** | EPIC-02 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01 |
| **Related User Stories** | US-17 (Staff scan), US-18 (Staff Guests control) |

**User Story Description**: 
As a Host, I want to invite staff members, define their access scope, and assign or customize permission roles, so that they can perform door check-ins without accessing billing or system settings.

**User Acceptance Criteria (UAT)**
- **AC-1**: Host can invite staff by entering Name, Email, Phone, and Designation.
- **AC-2**: Host can set access scope to either "All Events" or select specific events.
- **AC-3**: Host can assign roles (Coordinator, QR Scanner) or build a Custom Role.
- **AC-4**: Host can toggle 13 discrete permission keys for custom roles.
- **AC-5**: Inviting staff creates an entry in staff table with "Invited" status.

**Test Scenarios**
- **Positive Test Cases**:
  - Invite staff with "QR Scanner" role -> Staff login routes only to check-in scanning screens.
- **Negative Test Cases**:
  - Invite duplicate staff email -> Blocks and displays "Staff email already exists" error.
- **Boundary Test Cases**:
  - Attempt to invite staff exceeding subscription seat limit -> Gated by upgrade warnings.
- **Permission Test Cases**:
  - Staff attempts to open staff management screen -> Access denied or tab hidden.
- **Validation Test Cases**:
  - Ensure that removing a staff member immediately revokes their active session.

---

### EPIC-03: Host Audience Intelligence

#### User Story Information: US-08
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-08 |
| **User Story Name** | Host Shared Photo Gallery |
| **Epic ID** | EPIC-03 |
| **Priority** | Low |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-03 |
| **Related User Stories** | US-13 (Guest RSVP) |

**User Story Description**: 
As a Host, I want to activate a shared event photo gallery, define upload permissions, and moderate guest uploads, so that I can collect and manage event memories.

**User Acceptance Criteria (UAT)**
- **AC-1**: Host can enable/disable the Photo Gallery in event settings.
- **AC-2**: Host can set upload permissions to: Host only, RSVPed guests, or Anyone.
- **AC-3**: Host can toggle "Require Approval for Guest Uploads".
- **AC-4**: If approval is on, guest uploads appear in a "Pending Approval" tab with Approve/Reject actions.
- **AC-5**: Approved photos render in a 3-column grid visible to all guests.

**Test Scenarios**
- **Positive Test Cases**:
  - Guest uploads image, Host clicks Approve -> Image appears in the main public gallery grid.
- **Negative Test Cases**:
  - Guest attempts upload when gallery is set to "Host Only" -> Upload action is hidden.
- **Boundary Test Cases**:
  - Test deletion of approved photo by host -> Photo is removed from grid immediately.
- **Permission Test Cases**:
  - Staff without `photos_manage` attempts to delete photo -> Delete action is disabled.

---

### EPIC-04: Host Marketing & Automation

#### User Story Information: US-09
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-09 |
| **User Story Name** | Host Message Automation Rules |
| **Epic ID** | EPIC-04 |
| **Feature ID** | FEAT-09 |
| **Priority** | Medium |
| **Story Points** | 5 |
| **User Persona / Role** | Host |
| **Platform** | Web |
| **Dependencies** | US-01 |
| **Related User Stories** | US-16 (Guest Messaging) |

**User Story Description**: 
As a Host, I want to configure keyword-based auto-replies and reusable message templates, so that guest inquiries are answered instantly without manual typing.

**User Acceptance Criteria (UAT)**
- **AC-1**: Host can create custom Auto-Reply Rules matching specific keywords.
- **AC-2**: System matches incoming guest comments/messages to active keywords and auto-sends replies.
- **AC-3**: Host can edit default templates for RSVPs, Waitlist, Approvals, and Reminders.
- **AC-4**: Message templates support dynamic template brackets like `{{guestName}}` and `{{eventTitle}}`.
- **AC-5**: Host can compose a broadcast message to all, confirmed, or waitlisted guests using selected templates.

**Test Scenarios**
- **Positive Test Cases**:
  - Create rule "location" -> Guest sends message asking "Where is the location?" -> Auto-reply triggers instantly.
- **Negative Test Cases**:
  - Disable an auto-reply rule -> Incoming keywords do not trigger replies.
- **Validation Test Cases**:
  - Verify template rendering correctly swaps `{{guestName}}` with actual guest name.

---

#### User Story Information: US-10
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-10 |
| **User Story Name** | Host Security Audit Trail Logs |
| **Epic ID** | EPIC-04 |
| **Feature ID** | FEAT-10 |
| **Priority** | Low |
| **Story Points** | 3 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01 |
| **Related User Stories** | US-07 (Host Team & Role Permissions) |

**User Story Description**: 
As a Host, I want to view an immutable log of all administrative actions and notification dispatches, so that I can audit team changes and verify that alerts were sent.

**User Acceptance Criteria (UAT)**
- **AC-1**: Logs screen shows audit trail entries (actor, action description, timestamp).
- **AC-2**: Notification Logs tab lists all outbound Emails and SMS with delivery status tags.
- **AC-3**: Host can filter notification logs by channel (Email/SMS) and type.
- **AC-4**: Logs are read-only and cannot be cleared or modified by any user.
- **AC-5**: Tapping a notification log opens a details popup showing raw message content.

**Test Scenarios**
- **Positive Test Cases**:
  - Scanner checks in guest -> Audit log updates with entry detailing action, scanner name, and time.
- **Negative Test Cases**:
  - Attempt to execute script to delete log records -> Blocked by read-only datastore constraint.
- **Validation Test Cases**:
  - Verify log lists SMS status as DELIVERED or FAILED matching simulated system response.

---

#### User Story Information: US-11
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-11 |
| **User Story Name** | Host Integrated Services |
| **Epic ID** | EPIC-04 |
| **Feature ID** | FEAT-11 |
| **Priority** | Low |
| **Story Points** | 3 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01 |
| **Related User Stories** | US-14 (Guest Checkout) |

**User Story Description**: 
As a Host, I want to connect integrations (Stripe, Calendar, Slack, Zoom, Mailchimp), so that my event workflows and payments are synchronized.

**User Acceptance Criteria (UAT)**
- **AC-1**: Integrations screen lists Google Calendar, Slack, Zoom, Mailchimp, and Stripe.
- **AC-2**: Tapping "Connect" opens auth configuration prompts.
- **AC-3**: Successfully connected integration displays a "Connected" badge.
- **AC-4**: Payout system is gated by Stripe connection; Stripe must be active to enable ticket sales.
- **AC-5**: Connected integrations can be disconnected via details drawer.

**Test Scenarios**
- **Positive Test Cases**:
  - Connect Google Calendar -> Mock RSVP creation inserts event to calendar logs.
- **Negative Test Cases**:
  - Attempt to activate paid event ticket pricing when Stripe is disconnected -> System forces connection first.

---

### EPIC-05: Guest Discovery & Registration

#### User Story Information: US-12
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-12 |
| **User Story Name** | Guest Event Browse & Search |
| **Epic ID** | EPIC-05 |
| **Feature ID** | FEAT-12 |
| **Priority** | Medium |
| **Story Points** | 3 |
| **User Persona / Role** | Guest / Browse Mode |
| **Platform** | Web / Mobile |
| **Dependencies** | None |
| **Related User Stories** | US-13 (Guest RSVP) |

**User Story Description**: 
As a Guest (or unauthenticated browser), I want to search and filter public events by keyword, state, city, and category, so that I can find events to attend.

**User Acceptance Criteria (UAT)**
- **AC-1**: Explore screen must provide a text input search bar matching event title/details.
- **AC-2**: Provides filter dropdowns/chips for Event Type (Party, Meetup, Workshop, Fitness, Comedy).
- **AC-3**: On Mobile, city filter dropdown updates dynamically based on the selected state.
- **AC-4**: Tapping an event card routes to the Event Detail page.
- **AC-5**: A Guest can browse all details without being logged in.

**Test Scenarios**
- **Positive Test Cases**:
  - Search keyword "Comedy" -> Filter results show only comedy category events.
- **Negative Test Cases**:
  - Search for non-existent keyword -> Shows empty state "No events found".
- **Boundary Test Cases**:
  - Select state New York -> City dropdown updates to show only cities with events in New York.
- **Permission Test Cases**:
  - Tap "RSVP Now" on event page in browse mode -> Gated and redirected to authentication flow.
- **Validation Test Cases**:
  - Verify bookmarking an event in browse mode redirects to login, then saves bookmark upon success.

---

#### User Story Information: US-13
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-13 |
| **User Story Name** | Guest RSVP Submission |
| **Epic ID** | EPIC-05 |
| **Feature ID** | FEAT-13 |
| **Priority** | Critical |
| **Story Points** | 8 |
| **User Persona / Role** | Guest |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01, US-03 |
| **Related User Stories** | US-14 (Guest checkout), US-15 (Guest Ticket Pass) |

**User Story Description**: 
As a Guest, I want to submit an RSVP by entering my details, answering host questions, and verifying my age, so that I can secure a place on the guest list.

**User Acceptance Criteria (UAT)**
- **AC-1**: RSVP form collects Name, Email, Phone, and DOB (if age restricted).
- **AC-2**: Renders dynamic fields for host-defined custom questions.
- **AC-3**: Guest count stepper allows choosing party size up to event max party limit.
- **AC-4**: Age eligibility is checked on DOB entry and shows a live "Underage / Eligible" warning indicator.
- **AC-5**: Displays confirmation window indicating: Confirmed, Waitlisted, or Under Approval status.

**Test Scenarios**
- **Positive Test Cases**:
  - Submit RSVP for open capacity free event -> Shows success checkmark and booking ID.
- **Negative Test Cases**:
  - Attempt going registration on age-restricted event with DOB under limit -> Blocks submission with warning.
- **Boundary Test Cases**:
  - RSVP with guest count exactly at max party limit.
- **Permission Test Cases**:
  - Attempt RSVP after event deadline passed -> Registration form disabled with "RSVPs Closed".
- **Validation Test Cases**:
  - Verify that RSVPing over capacity automatically assigns status "waitlist" and logs timestamp.

---

#### User Story Information: US-14
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-14 |
| **User Story Name** | Guest Payment & Checkout |
| **Epic ID** | EPIC-05 |
| **Feature ID** | FEAT-13 |
| **Priority** | Critical |
| **Story Points** | 5 |
| **User Persona / Role** | Guest |
| **Platform** | Web / Mobile |
| **Dependencies** | US-13 |
| **Related User Stories** | US-15 (Guest Pass Wallet) |

**User Story Description**: 
As a Guest, I want to checkout and pay for paid tickets using credit card fields, so that I can complete my paid registration.

**User Acceptance Criteria (UAT)**
- **AC-1**: If the event has `enablePayments=true`, the RSVP wizard renders the checkout step.
- **AC-2**: Displays total pricing: Ticket Price x Guest Count.
- **AC-3**: Collects Card Number, Expiry, and CVC fields.
- **AC-4**: Submitting triggers transaction processing and displays payment success/receipt screen.
- **AC-5**: Payment success logs a paid transaction to the host's financial tab and guest history timeline.

**Test Scenarios**
- **Positive Test Cases**:
  - Input card details -> Triggers successful checkout screen -> Generates booking receipt.
- **Negative Test Cases**:
  - Submit invalid card format -> Triggers checkout validation error and stops submission.
- **Validation Test Cases**:
  - Verify total billing amount updates dynamically as guest count stepper changes.

---

#### User Story Information: US-15
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-15 |
| **User Story Name** | Guest Ticket Pass Wallet |
| **Epic ID** | EPIC-05 |
| **Feature ID** | FEAT-14 |
| **Priority** | Critical |
| **Story Points** | 5 |
| **User Persona / Role** | Guest |
| **Platform** | Web / Mobile |
| **Dependencies** | US-13 |
| **Related User Stories** | US-17 (Staff scan verification) |

**User Story Description**: 
As a Guest, I want to view my ticket passes with generated QR codes, change my response, and cancel my ticket subject to host policies, so that I can manage my entry.

**User Acceptance Criteria (UAT)**
- **AC-1**: Renders ticket pass details: Event name, date, host details, and party size.
- **AC-2**: Displays a deterministic, scannable QR code matching the booking ID.
- **AC-3**: Host enables/disables self-edit; if enabled, guest can change responses and guest count.
- **AC-4**: Host enables/disables self-cancellation; if enabled, guest can cancel RSVP before deadline.
- **AC-5**: If host requires, cancellation requires inputting a reason before confirming.

**Test Scenarios**
- **Positive Test Cases**:
  - Click Cancel RSVP within allowed cancellation cutoff -> Ticket updates to Cancelled, spot is released.
- **Negative Test Cases**:
  - Attempt self-cancellation after host cutoff hours -> Cancel button is hidden or disabled.
- **Boundary Test Cases**:
  - Edit guest count on pass -> Capacity updates immediately.
- **Permission Test Cases**:
  - Try to open a ticket pass for a rejected or voided RSVP -> Pass is greyed out.
- **Validation Test Cases**:
  - Verify generated QR code matches format `[rsvpId]-[guestCount]`.

---

#### User Story Information: US-16
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-16 |
| **User Story Name** | Guest Host Messaging Inbox |
| **Epic ID** | EPIC-05 |
| **Priority** | Medium |
| **Story Points** | 5 |
| **User Persona / Role** | Guest |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01 |
| **Related User Stories** | US-09 (Auto-Replies) |

**User Story Description**: 
As a Guest, I want to message the event host, check conversation status, and view delivery logs of platform alerts, so that I can stay updated on event changes.

**User Acceptance Criteria (UAT)**
- **AC-1**: Guest can click "Message Host" from RSVP pass.
- **AC-2**: Renders chat interface with thread bubbles and timestamps.
- **AC-3**: Messages tab displays "Conversations" list and "Delivery logs" tab.
- **AC-4**: Delivery logs display all system alerts sent via Email/SMS to the guest.
- **AC-5**: Guest can edit notification channel preferences in profile.

**Test Scenarios**
- **Positive Test Cases**:
  - Send message to host -> Msg bubble appears on the right; Host dashboard shows unread indicator.
- **Validation Test Cases**:
  - Toggle off SMS notifications -> Delivery logs show subsequent reminder logs skipped or email-only.

---

### EPIC-06: Staff Operations & Scan Gate

#### User Story Information: US-17
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-17 |
| **User Story Name** | Staff Gate Scan Verification |
| **Epic ID** | EPIC-06 |
| **Feature ID** | FEAT-15 |
| **Priority** | Critical |
| **Story Points** | 8 |
| **User Persona / Role** | Staff / Host |
| **Platform** | Mobile |
| **Dependencies** | US-07, US-15 |
| **Related User Stories** | US-18 (Partial check-in), US-19 (Walk-in) |

**User Story Description**: 
As a Staff member, I want to scan guest passes via camera viewfinder and view entry verdicts, alerts, and guest reliability flags, so that I can admit guests.

**User Acceptance Criteria (UAT)**
- **AC-1**: Tapping scan opens a camera viewfinder (with manual ID entry fallback).
- **AC-2**: Valid scan retrieves guest card showing check-in status, name, and guest count.
- **AC-3**: Already checked-in pass displays clear warning overlay.
- **AC-4**: Invalid pass ID shows red alert card.
- **AC-5**: If age-restricted, it renders clear check ID warning indicators.

**Test Scenarios**
- **Positive Test Cases**:
  - Scan valid QR code -> Shows "Access Granted" green card and check-in summary.
- **Negative Test Cases**:
  - Scan a pass code that does not exist -> Displays red "Invalid Pass" error screen.
- **Boundary Test Cases**:
  - Scan pass on event with age restricted: verifies check ID alert triggers.
- **Permission Test Cases**:
  - Staff without `checkin` permission scans pass -> Scanner does not open.
- **Validation Test Cases**:
  - Verify scanning records check-in timestamp and staff name to audit log.

---

#### User Story Information: US-18
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-18 |
| **User Story Name** | Staff Partial Party Check-in |
| **Epic ID** | EPIC-06 |
| **Feature ID** | FEAT-16 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Staff / Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-17 |
| **Related User Stories** | US-19 (Walk-in) |

**User Story Description**: 
As a Staff member, I want to check in partial groups on a single pass using stepper controls and record progress, so that split arrivals are accommodated.

**User Acceptance Criteria (UAT)**
- **AC-1**: Scan detail screen shows total party size, checked-in count, and remaining balance.
- **AC-2**: Provides stepper buttons to increment arrivals up to maximum remaining balance.
- **AC-3**: Tapping Check In records the check-in count and changes status.
- **AC-4**: Rescanning same code updates display to show remaining balance.
- **AC-5**: Fully checked-in pass shows "All In" status and hides steppers.

**Test Scenarios**
- **Positive Test Cases**:
  - Party of 4 scan. Check in 2 -> Status changes to "Partial (2/4 arrived)". Rescan shows 2 remaining.
- **Negative Test Cases**:
  - Attempt to step check-in count above the remaining guests -> Increments capped at limit.
- **Boundary Test Cases**:
  - Undo check-in -> Decrements check-in count to 0 and logs undo operation.
- **Permission Test Cases**:
  - Staff without checkin edit permissions attempts partial checkout -> Stepper is disabled.
- **Validation Test Cases**:
  - Verify overall event checked-in count updates by partial amounts checked in.

---

#### User Story Information: US-19
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-19 |
| **User Story Name** | Staff Walk-in Guest Management |
| **Epic ID** | EPIC-06 |
| **Feature ID** | FEAT-17 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Staff / Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-17 |
| **Related User Stories** | US-04 (Guest Directory) |

**User Story Description**: 
As a Staff member, I want to add walk-in guests at the door with capacity check warnings, so that spontaneous arrivals are checked in and tracked.

**User Acceptance Criteria (UAT)**
- **AC-1**: Staff can open "Add Walk-In" modal from Check-In screen.
- **AC-2**: Form requires inputting Name and guest count.
- **AC-3**: System compares guest count with remaining capacity.
- **AC-4**: If over capacity, displays warning block and routes to waitlist placement option.
- **AC-5**: Saving creates a checked-in RSVP and increments check-in counts.

**Test Scenarios**
- **Positive Test Cases**:
  - Add 2 walk-in guests when spots exist -> Guests immediately checked-in and logged.
- **Negative Test Cases**:
  - Add walk-in with zero count -> Blocks input with error message.
- **Boundary Test Cases**:
  - Walk-in size matches remaining capacity exactly -> Check-in succeeds, capacity reaches 100%.
- **Permission Test Cases**:
  - Staff without `guests_edit` attempts walk-in add -> Option hidden.
- **Validation Test Cases**:
  - Verify walk-in guest has `manual=true` property set in data store.

---

### EPIC-07: Superadmin Portal Operations

#### User Story Information: US-20
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-20 |
| **User Story Name** | Superadmin Host Compliance Review |
| **Epic ID** | EPIC-07 |
| **Feature ID** | FEAT-18 |
| **Priority** | High |
| **Story Points** | 5 |
| **User Persona / Role** | Superadmin |
| **Platform** | Web |
| **Dependencies** | US-01 |
| **Related User Stories** | US-03 (Host Event Creation) |

**User Story Description**: 
As a Superadmin, I want to review organization tax documents and approve or reject applications, so that platform hosts are verified and secure.

**User Acceptance Criteria (UAT)**
- **AC-1**: Applications tab displays pending Organization applications.
- **AC-2**: Renders contact details, website, and doc upload links.
- **AC-3**: Tapping doc name opens doc viewer modal.
- **AC-4**: Clicking "Approve Host" activates organization account and email notify.
- **AC-5**: Clicking "Reject" prompts for a rejection reason before logging.

**Test Scenarios**
- **Positive Test Cases**:
  - Approve application -> Host status changes to ACTIVE; host can now create events.
- **Negative Test Cases**:
  - Reject host without entering reason -> Form validation blocks rejection.
- **Boundary Test Cases**:
  - Review application with missing documents -> Displays warning marker.
- **Permission Test Cases**:
  - Host tries to access application drawer -> Access blocked.
- **Validation Test Cases**:
  - Host account gets locked automatically upon registration if Org type, requiring review.

---

#### User Story Information: US-21
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-21 |
| **User Story Name** | Superadmin Hosts & Events Control |
| **Epic ID** | EPIC-07 |
| **Priority** | Medium |
| **User Persona / Role** | Superadmin |
| **Platform** | Web |
| **Dependencies** | US-20 |
| **Related User Stories** | US-03 (Host Event Creation) |

**User Story Description**: 
As a Superadmin, I want to search and moderate global hosts and events, so that TOS violations and inappropriate listings are suspended.

**User Acceptance Criteria (UAT)**
- **AC-1**: Hosts tab lists all hosts with search and suspension actions.
- **AC-2**: Suspend host action prompts for a reason and locks host account.
- **AC-3**: Events tab lists all platform events with search and status badges.
- **AC-4**: Admin can "Hide from Public" or "Force Close RSVPs" for any event.
- **AC-5**: Action overrides host event parameters in real-time.

**Test Scenarios**
- **Positive Test Cases**:
  - Select "Hide from Public" on event -> Event no longer appears on guest explore page.
  - Suspend host -> Host gets logged out and blocked on login.
- **Negative Test Cases**:
  - Force close RSVPs on completed event -> Blocks action with state check alert.
- **Validation Test Cases**:
  - Verify that hiding an event flags `privacy=Private` in database.

---

#### User Story Information: US-22
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-22 |
| **User Story Name** | Superadmin System Customization |
| **Epic ID** | EPIC-07 |
| **Feature ID** | FEAT-19 |
| **Priority** | Medium |
| **Story Points** | 5 |
| **User Persona / Role** | Superadmin |
| **Platform** | Web |
| **Dependencies** | US-01 |
| **Related User Stories** | US-06 (Host Billing), US-09 (Auto-Replies) |

**User Story Description**: 
As a Superadmin, I want to configure platform branding, adjust plan limits, and override active host subscriptions, so that the platform metrics are controlled.

**User Acceptance Criteria (UAT)**
- **AC-1**: Settings tab provides theme primary color configuration, which live-injects into `--color-primary`.
- **AC-2**: Settings tab configures Support Email and SMS Alpha Tag (max 11 chars).
- **AC-3**: Economics tab shows revenue graphs, plans directory, and subscription logs.
- **AC-4**: Admin can edit pricing limits (events count, attendee cap, staff seats) for each plan.
- **AC-5**: Admin can override a host's subscription plan, recording a $0 override entry in logs.

**Test Scenarios**
- **Positive Test Cases**:
  - Change primary color -> Visual elements change theme instantly.
  - Execute subscription override on host -> Host is upgraded with no billing charge.
- **Negative Test Cases**:
  - Enter invalid hex code -> Validation error blocks change.
- **Validation Test Cases**:
  - Verify refunding a host transaction reverses revenue ARR metrics on economics panel.

---

#### User Story Information: US-23
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-23 |
| **User Story Name** | Host Event Dress Code Configuration |
| **Epic ID** | EPIC-02 |
| **Feature ID** | FEAT-20 |
| **Priority** | Medium |
| **Story Points** | 5 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01, US-03 |
| **Related User Stories** | US-13 (Guest RSVP), US-15 (Guest Pass Wallet) |

**User Story Description**: 
As a Host, I want to optionally specify a dress code for the event (using predefined choices or custom attire values), add details like things to avoid or additional instructions, and select outfit inspiration reference photos, so that my guests are styled appropriately.

**User Acceptance Criteria (UAT)**
- **AC-1**: Host can configure a dress code in Step 3 of the creation wizard or in the Settings edit panel.
- **AC-2**: Selector includes predefined chips (e.g. Smart Casual, Cocktail Attire) and an "Other" option.
- **AC-3**: Selecting "Other" displays a custom dress code input text box.
- **AC-4**: Host can provide optional description, list of things to avoid, and additional instructions.
- **AC-5**: Host can select an outfit inspiration reference photo from the cover presets grid.

**Test Scenarios**
- **Positive Test Cases**:
  - Configure dress code on Event 1 -> View event details page as Guest -> Verify dress code badge and outfit inspiration card render correctly.
- **Negative Test Cases**:
  - Leave dress code unconfigured or set to "No Dress Code" -> Verify no dress code section or warnings render on the guest screens.
- **Boundary Test Cases**:
  - Input long dress code description (e.g. 500+ characters) -> Verify UI wraps cleanly on both detail page and passes.
- **Permission Test Cases**:
  - Staff without event settings edit permission attempts to update dress code -> Input fields are disabled or hidden.
- **Validation Test Cases**:
  - Check that adding dress code updates reminders and RSVP notifications to include the attire details.

---

#### User Story Information: US-24
| Field | Details |
| :--- | :--- |
| **User Story ID** | US-24 |
| **User Story Name** | Event Mode & Venue Details Configuration |
| **Epic ID** | EPIC-02 |
| **Feature ID** | FEAT-21 |
| **Priority** | Critical |
| **Story Points** | 8 |
| **User Persona / Role** | Host |
| **Platform** | Web / Mobile |
| **Dependencies** | US-01, US-03 |
| **Related User Stories** | US-13 (Guest RSVP), US-15 (Guest Pass Wallet) |

**User Story Description**: 
As a Host, I want to configure the event type, event mode (Onsite, Virtual, Hybrid), and physical venue or virtual meeting details while creating an event, so that my guests receive accurate location or access information.

**User Acceptance Criteria (UAT)**
- **AC-1**: Event Type field is mandatory, providing predefined categories and custom event entry if 'Other' is chosen.
- **AC-2**: Event Mode is mandatory (Onsite, Virtual, Hybrid).
- **AC-3**: Onsite/Hybrid selections reveal mandatory physical venue name, address line 1, city, state, country, postal code, and optional location map links.
- **AC-4**: Virtual/Hybrid selections reveal mandatory meeting link and optional platform dropdown (Zoom, Google Meet, Webex, Teams, Other), meeting ID, passcode, and joining instructions.
- **AC-5**: Meeting links, ID, and passcodes are gated and only visible to confirmed and approved guests.

**Test Scenarios**
- **Positive Test Cases**:
  - Create onsite event with full address details -> Verify guest explore, RSVP, and ticket pass pages display the address and a "View on Map" redirect button.
  - Create virtual event with Zoom link -> Verify guest only sees meeting credentials on detail/pass pages *after* their RSVP status shifts to Confirmed.
- **Negative Test Cases**:
  - Attempt to publish onsite event with missing mandatory address fields -> Wizard blocks step 1 with validation alerts.
  - Attempt to publish virtual event with empty meeting link -> Validation alerts trigger.
- **Boundary Test Cases**:
  - Test a hybrid event -> Verify guest explore details page renders both the physical address card and the virtual meeting credentials card (once confirmed).
- **Permission Test Cases**:
  - Unauthenticated user attempts to view virtual meeting credentials -> UI displays locked notice.
- **Validation Test Cases**:
  - Check that invitations and pre-event reminder notifications dynamically append venue addresses or virtual link joining instructions matching the mode.

---

## Test Scenarios (Platform Global)

### Positive Test Cases
- **Scenario**: End-to-end guest journey. Guest explores, RSVPs, completes payment, views pass, and staff scans. Confirm check-in updates host analytics.

### Negative Test Cases
- **Scenario**: Guest self-edit/cancellation block. Verify that when self-edit is disabled, guests cannot alter RSVP guest counts or request cancellations.

### Boundary Test Cases
- **Scenario**: Capacity edge-cases. RSVPing with party of 3 when capacity has 2 spots left -> 2 slots confirm, 1 waitlists.

### Permission Test Cases
- **Scenario**: Role gating validation. Coordinator staff executes event edit (Success); Scanner staff executes event edit (Error: Permission Denied).

### Validation Test Cases
- **Scenario**: Org verification lockdown. Ensure unverified organization dashboard sections show validation message blocking action until Superadmin approval.
