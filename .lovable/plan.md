
# ChopCake — Frontend Build Plan

A premium, dark-mode SaaS for birthday reminders + flyer creation. Frontend-only with localStorage persistence, structured for a future Cloud upgrade.

## Design system
- **Theme**: Dark-first. Background deep near-black with subtle purple tint. Surfaces use layered elevation with soft shadows.
- **Accent palette**: warm pink, golden yellow, teal, deep purple — used as gradients on CTAs, badges, and template chips.
- **Typography**: SF Pro Display (headings, bold) + SF Pro Text (body/UI), loaded via system stack with web-font fallback. Generous line-height and tracking.
- **Motion**: subtle scale/fade on cards, spring transitions on the flyer live preview, confetti burst on flyer export.
- **Components**: shadcn primitives restyled to the ChopCake palette via index.css tokens.

## Navigation
- **Mobile**: floating bottom nav (Home · Create · Birthdays · Discover · Profile) with active-pill indicator.
- **Desktop**: top bar with logo, nav links, profile avatar.
- `/admin` lives outside the main shell.

## Pages & flows

### 1. Home `/`
- Hero CTA gradient button "Create a Birthday Flyer".
- **Upcoming Birthdays** carousel — avatar, name, days-left chip; tap → routes to Create with that contact pre-selected.
- **Streak card** + earned badges (Consistent Celebrator, Early Bird, Flyer Pro).
- Quick "Add Birthday" floating action.
- Empty state with friendly illustration + seed-demo button.

### 2. Create Flyer `/create`
Stepper: Template → Photo → Name → Message → Export, with a sticky **live preview** panel (right on desktop, top sheet on mobile).
- **Templates**: grid of admin-defined templates (thumbnail, name, emoji, category filter chips).
- **Photo upload**: drag-drop + camera input; cropped/cover-fit into the admin-defined photo zone.
- **Name field**: live preview, auto-scaling text — measures rendered width and shrinks font-size to fit the admin zone (binary search on font-size).
- **Message field**: 50-char hard limit with live counter; "✨ Suggest 3 messages" picks from curated library of 60+ warm wishes; auto-scales like name.
- **Export**: html-to-image → PNG download at 1080×1920; shows 3 ready-to-copy captions; share buttons (WhatsApp, Instagram Stories via web share API, X, copy link); watermark toggle.

### 3. My Birthdays `/birthdays`
- Month calendar with dots on birthday dates; tap a date for that day's list.
- Sorted list (next-up first) with avatar, name, age turning, days remaining, edit/delete/create-flyer actions.
- Add/Edit dialog: name, recurring date, optional photo, private notes.
- **Reminders**: browser Notifications API — schedule via `setTimeout` on app load for next 24h window; one the day before, one the morning of; clicking opens Create pre-filled.

### 4. Discover `/discover`
- Trending templates (sorted by mock usage count).
- Community wall of sample user flyers (seeded), opt-in toggle in Profile.

### 5. Profile `/profile`
- Avatar + display name (editable, local).
- Stats: birthdays saved, flyers made, current streak.
- Badge collection grid with locked/unlocked states.
- Notification preferences (toggle reminders, time of day).
- Tasteful "Upgrade to ChopCake Pro" card with feature teasers.

### 6. Admin `/admin`
- **Login**: password gate (default `chopcake2025`), "Remember me" → localStorage session.
- **Templates manager** (core):
  - Upload background image (target 1080×1920).
  - **Interactive overlay editor** on a canvas: add Photo / Name / Message zones as draggable + resizable rectangles (with handles). Each zone shows a colored label.
  - Metadata: name, emoji picker, category, active toggle.
  - **"Test as User"** preview applies sample photo + sample name + sample message to verify scaling.
  - List view with thumbnail, status pill, edit/duplicate/delete.
- Tooltips throughout, clear empty states, save confirmations.

## Technical notes
- **Persistence**: a small `storage` module wraps localStorage with typed keys (`birthdays`, `templates`, `profile`, `admin_session`, `prefs`) — easy to swap for Cloud later.
- **Auto-fit text**: shared `<AutoFitText>` component using `ResizeObserver` + binary search on font-size between min/max bounds defined per zone.
- **Flyer renderer**: single `<FlyerCanvas>` component used by both the live preview and export (rendered off-screen at 1080×1920 for export to keep crisp output).
- **Seed data**: 6 starter templates + 5 demo birthdays + curated message library shipped in `/src/data/`.
- **Routing**: react-router with all routes registered; admin route guarded by a `<RequireAdmin>` wrapper.

## Out of scope (frontend-only)
- Real auth, multi-device sync, server-side image processing, real AI generation, real share analytics — all stubbed locally and clearly upgrade-ready.
