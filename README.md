# SafalEvents — Mobile (UI Prototype)

A React Native (Expo) prototype of the SafalEvents **host + guest + staff** experience.
Single app with a **role switcher** at launch — pick *Host*, *Guest*, or *Login as Staff*.
There's no backend; data lives in `src/data/mock.js`, but a small in-memory **live store**
makes gate check-ins propagate: a staff QR scan marks the guest arrived, "sends" a
confirmation email (delivery log), and the **host dashboard updates live**.

This mirrors the feature set of the SafalEvents web app: RSVP approval workflow
(Under Approval → Approve/Reject), capacity → waitlist (held under approval), staff & roles
with per-tab permissions, and per-event guest↔host messaging.

## Run it

```bash
cd SafalEvents-Mobile
npm install            # first time
npx expo install --fix # (optional) align native deps to your installed Expo SDK
npm start              # then press "a" (Android), "i" (iOS), or scan the QR in Expo Go
```

> Requires Node 18+ and the **Expo Go** app on your phone (or an Android/iOS simulator).

## Host the web build on Netlify

The app also runs on the web (Expo + react-native-web), so you can preview the mobile UI in a
browser. `netlify.toml` is preconfigured:

- **Build command:** `npm run build:web`  (runs `expo export --platform web`)
- **Publish directory:** `dist`
- SPA redirect (`/* → /index.html`) so in-app navigation works.

On Netlify: *Add new site → Import from Git → pick this repo* — it reads `netlify.toml`
automatically (no manual settings needed). To build locally: `npm run build:web` then serve `dist/`.

## Structure

```
SafalEvents-Mobile/
├─ App.js                      # root native-stack: RoleSelect → HostTabs / GuestTabs + pushed screens
├─ src/
│  ├─ theme/theme.js           # colors, spacing, fonts (mirrors the web palette)
│  ├─ data/mock.js             # all static demo data (events, rsvps, staff, roles, conversations…)
│  ├─ components/ui.js         # shared component kit (Screen, Card, Badge, Button, Tabs, ApprovalBadge…)
│  ├─ navigation/
│  │  ├─ HostTabs.js           # Dashboard · Events · Messages · Account
│  │  └─ GuestTabs.js          # Tickets · Explore · Messages · Profile
│  └─ screens/
│     ├─ RoleSelectScreen.js
│     ├─ host/                 # Dashboard, Events, Messages, Account, EventManage, CreateEvent, Notifications
│     └─ guest/                # Tickets, Explore, Messages, Profile, EventDetail, Rsvp, TicketPass, Chat
```

## Feature coverage

**Host:** dashboard with stats + pending-approval highlight · events list · event management
(Overview / Guests with Under-Approval + Waitlist + Rejected + Confirmed / Messaging toggle /
Staff & Roles with permission sets / Settings / QR Check-in) · create event · messages
inbox · notifications · earnings & payouts · settings.

**Guest:** my tickets with approval/waitlist states · explore events · event detail · RSVP
flow · ticket pass with QR · message host (only when the event enables messaging) · messages
inbox · profile.

**Staff (UC-08/11/13):** sign in via **Invite ID** on the launch screen, then see only the
modules your role permits.
- A **QR Scanner** role sees only the **Check-in** tab → tap *Scan guest QR* → simulate a
  scan (tap a pass or type a pass ID) → the scan is validated against the approved guest
  list (rejects not-approved / wrong-event / already-scanned) → *Mark as Arrived* checks the
  guest in, emails them, and the host dashboard reflects it instantly.
- A **Coordinator** additionally sees the **Guests** tab and can check guests in there too.

Demo staff invites (on the launch "Login as Staff" screen):
- `INV-GATE-1` / `gabe@safalevent.com` → **QR Scanner** (check-in only)
- `INV-SAM-2026` / `sam@safalevent.com` → **Coordinator** (guests + check-in)

Switch roles anytime from the Account / Profile tab → "Switch role".
