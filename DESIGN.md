# Remnant Product Design Specification

**Status:** Product and interface source of truth
**Last updated:** 1 August 2026
**Applies to:** Remnant responsive web application, including its mobile web/app experience
**Primary implementation:** `remnant-frontend`

---

## 1. Purpose

This document defines the intended experience and visual system for every Remnant page. It should guide design, implementation, review, and future iteration without changing the product's backend behavior.

The redesign must preserve:

- the existing emerald-led brand palette;
- the current product-category artwork and icon meanings;
- existing notification patterns and message semantics;
- the useful motion already present in the product;
- all routes, authentication rules, API contracts, validation, transaction logic, search behavior, and data models.

The redesign may improve layout, spacing, typography, hierarchy, responsive behavior, component styling, transitions, and frontend presentation. It must not rename backend fields, invent unsupported data, remove safety states, or alter business logic.

This file supersedes older visual references where they conflict with the current product direction.

---

## 2. Product idea

Remnant is a Nigerian circular marketplace for objects ordinary marketplaces overlook: single pieces, incomplete sets, spare parts, repairable items, donations, barter offers, and reusable materials.

The product promise is simple:

> Every useful piece should have a visible next move.

The experience should make a lone shoe, pot lid, remote, broken device, or spare component feel specific and valuable—not like an edge case inside a conventional classifieds site.

### Primary user jobs

1. Find a missing or matching item.
2. Browse useful second-hand items and parts.
3. List an item for sale, trade, donation, repair, or recycling.
4. Save a private pair alert and receive likely matches.
5. Contact another person safely.
6. Track a paid exchange from initiation to completion.
7. Manage listings, messages, alerts, profile, and preferences.
8. Moderate listings, reports, and members.

---

## 3. Creative direction: Soft Dimensional Utility

Remnant's world sits between a well-organized repair bench and a small collection of tactile objects. It should feel inventive, human, precise, youthful, and quietly immersive.

The dimensional language is reserved for meaningful objects: finding, selling, trading, donating, repairing, recycling, matching, and shopping. These objects use simplified 3D form, soft material, and restrained color. The interface around them stays crisp, fast, and spacious.

### The visual character

- **Grounded:** white and warm-neutral surfaces, real objects, practical language, Nigerian locations, clear prices, and legible controls.
- **Dimensional:** a cohesive family of soft 3D objects gives major actions an immediate, tactile identity.
- **Editorial:** confident headings, deliberate asymmetry, useful negative space, and content-led composition.
- **Tactile:** object photography, illustrated category tiles, matte 3D action art, strong borders, and clear pressed/selected states.
- **Trustworthy:** no visual tricks around price, condition, identity, safety, or transaction status.

### What the product must not look like

- a generic purple-and-blue AI startup;
- a glassmorphism dashboard covered in translucent cards;
- a template marketplace with identical cards and excessive shadows;
- a children's app with every control rendered as a pill;
- a luxury gallery with too little information;
- a dense enterprise admin interface on mobile;
- a design demo whose animation delays the task.

### Anti-generic rules

- Do not introduce Inter, Roboto, Space Grotesk, Poppins, or Quicksand by default.
- Do not place a gradient headline above three generic feature cards.
- Do not use sparkle icons as decoration on routine controls.
- Do not use large purple radial gradients, fake AI chat surfaces, or arbitrary floating blobs.
- Do not apply clay styling to form fields, tables, navigation shells, or every control. Dimensional artwork is a focal cue, not the entire UI treatment.
- Do not make every section a rounded card. Let typography, rules, bands, and open space structure pages.
- Use familiar interaction patterns, but give Remnant character through object composition, writing, category art, intent color, and matching motion.

---

## 4. Experience principles

### 4.1 Object first

Listing images, item names, condition, intent, location, and compatibility information carry the experience. Decoration never competes with the object.

### 4.2 One clear next action

Every screen has one dominant action. Secondary actions remain visible but quieter. Destructive actions must never visually compete with the primary action.

### 4.3 Mobile is the primary constraint

Design the 360–430 px experience first. Desktop is an expansion of the same hierarchy, not a separate visual product.

### 4.4 Progressive disclosure

Show the information needed for the present decision. Move filters into a sheet on small screens, reveal listing-specific fields after intent selection, and show transaction actions only when the user's role and state require them.

### 4.5 Trust is visible

Condition, price, location, intent, seller identity, report access, payment status, and system feedback must be easy to find and difficult to misread.

### 4.6 Character comes from relationships

Use visual pairings, lines, gaps, cropped objects, and motion that resolves into alignment. Avoid decoration that has no connection to the product story.

### 4.7 No dead ends

Empty, error, permission, and no-result states must explain what happened and offer a useful next action.

---

## 5. Responsive foundation

### Breakpoints

| Name | Width | Primary use |
|---|---:|---|
| `xs` | 360 px | smallest supported phone layout |
| `sm` | 640 px | large phones and small tablets |
| `md` | 768 px | navigation changes; tablet/desktop composition begins |
| `lg` | 1024 px | two-column detail and dashboard layouts |
| `xl` | 1280 px | expanded marketplace and editorial grids |

### Page width

- Global maximum width: **1440 px**.
- General content: **1280 px / `max-w-7xl`**.
- Forms and multi-step flows: **1024 px / `max-w-5xl`**.
- Legal and long-form reading: **720–800 px**.
- Page gutters: 12–20 px on mobile, 32 px on tablet/desktop, up to 48 px for large editorial sections.

### Grid behavior

- Use CSS grid for listing galleries, category tiles, dashboard summaries, and editorial comparisons.
- Mobile listing discovery may use a compact three-column grid only where the card remains scannable. Longer titles and management controls require one or two columns.
- Desktop marketplace grids use three columns at medium widths and four at extra-large widths.
- Detail pages collapse from a two-column composition to one continuous reading order.
- No viewport may produce horizontal document scrolling.

### Mobile safe areas

- All fixed controls must include `env(safe-area-inset-*)`.
- Pages with the mobile dock reserve at least `6.75rem + env(safe-area-inset-bottom)` below content.
- Chat composers, sheets, dialogs, and payment actions must sit above the dock or intentionally hide it.

### Touch and density

- Minimum interactive size: **44 × 44 px**, preferably **48 × 48 px** on mobile.
- Controls may appear visually smaller if their hit area still meets the minimum.
- Do not use text below 12 px for meaningful information.
- Body copy is at least 16 px inside forms to avoid mobile browser zoom.

---

## 6. Color system

The interface is light-first. Dark tokens may remain available, but a complete dark theme must not ship until every page and state has been deliberately reviewed.

| Token | Value | Purpose |
|---|---:|---|
| Brand emerald | `#006C52` | primary actions, active states, links, match signals |
| Brand dark | `#00513D` | hover/pressed primary action |
| Brand light | `#73D9B5` | secondary accents and diagrams |
| Brand container | `#98FFD9` | soft selected/matched surfaces |
| Secondary blue | `#006783` | informational and system accents |
| Blue container | `#70D6FF` | soft informational surfaces |
| Gold | `#6C5E20` | pending/warning emphasis |
| Gold container | `#FFEB9E` | pending and caution backgrounds |
| Background | `#FFFFFF` | default page field |
| Sand | `#F3F3F4` | section bands, input context, quiet surfaces |
| Foreground | `#1A1C1C` | headings and primary text |
| Soft ink | `#3E4944` | body and secondary text |
| Muted | `#6E7A74` | metadata and helper text |
| Border | `#BDC9C2` | dividers, inputs, cards |
| Mint soft | `#E9F7F1` | spacious action and illustration fields |
| Aqua | `#177D88` | secondary dimensional accents |
| Aqua soft | `#E6F7F8` | informational art fields |
| Lavender | `#6959A8` | expressive secondary accents |
| Lavender soft | `#F0EEFB` | calm editorial and illustration fields |
| Amber soft | `#FFF4DC` | warm action and caution fields |

### Semantic intent colors

Intent color helps scanning but never replaces the text label.

| Intent | Treatment |
|---|---|
| Sell | emerald or deep green badge; price is prominent |
| Trade | blue badge; requested exchange follows immediately |
| Donate | warm rose/coral or brand-soft badge; “Free” remains explicit |
| Repair | amber badge; issue and desired outcome are prominent |
| Recycle | teal badge; material and handoff preference are prominent |

### State colors

- Success: emerald, always with a success icon or text.
- Information: secondary blue.
- Pending/warning: gold/amber.
- Error/destructive: accessible red with explicit wording.
- Disabled: muted foreground on sand; never communicate disabled state through opacity alone.

### Contrast

- Normal text must meet WCAG AA contrast of at least 4.5:1.
- Large text and non-text controls must meet at least 3:1.
- Do not place muted gray text over tinted imagery.
- Brand-container backgrounds use dark foreground, not white.

---

## 7. Typography

The implemented font stack is intentionally uncommon without requiring a new network font:

```css
font-family: "Avenir Next", "Trebuchet MS", "Segoe UI", system-ui, sans-serif;
```

Use one family with contrast created through scale, weight, spacing, and composition. A future licensed or self-hosted typeface may replace the first face only after loading, glyph coverage, Nigerian names, currency, accessibility, and performance are verified.

### Type roles

| Role | Mobile | Desktop | Notes |
|---|---:|---:|---|
| Display hero | 36–48 px | 64–80 px | short lines, tight leading, selective use |
| Page title | 28–36 px | 48–60 px | one per page |
| Section title | 22–28 px | 32–40 px | clear section transitions |
| Card title | 14–18 px | 16–22 px | depends on card density |
| Body | 15–17 px | 16–18 px | line height 1.5–1.7 |
| Form label | 13–14 px | 14 px | semibold/bold |
| Metadata | 12–13 px | 12–14 px | never essential at low contrast |
| Eyebrow | 11–12 px | 12–13 px | short, tracked, optional uppercase |

### Typography rules

- Limit hero headings to 8–12 words where possible.
- Keep long-form text around 60–75 characters per line.
- Use sentence case for headings and controls.
- Uppercase is reserved for compact navigation/eyebrows, never long copy.
- Use tabular numerals for prices, totals, counts, and transaction references.
- Use the Naira symbol consistently through the shared currency component.
- Do not use decorative italics as a default “editorial” shortcut.

---

## 8. Shape, border, and depth

### Radius

- Controls: 8–10 px.
- Compact cards: 12–16 px.
- Major editorial or detail surfaces: up to 32 px on desktop, reduced on mobile.
- Full pills are reserved for badges, status, avatars, toggles, and compact filter chips.
- Adjacent controls should share edge geometry and alignment.

### Borders

- Use one-pixel neutral borders to define surfaces.
- Section separators may be border-only, with no container.
- Selected states use brand border plus a very light brand container.
- Destructive states use a red border only when the action or state itself is destructive.

### Elevation

- Default cards are flat.
- Sticky navigation, menus, dialogs, sheets, and toasts may use restrained elevation.
- Hover lift is no more than 2–4 px and only on clearly clickable cards.
- Never stack multiple large shadows.

---

## 9. Iconography and imagery

### Icon system

- Preserve existing product-category artwork in `public/images/categories` and current product illustrations.
- Use the Remnant dimensional action family in `public/images/actions` for hero moments, primary intent choices, onboarding decisions, and empty states.
- The action family currently covers marketplace, find, sell, trade, donate, repair, recycle, and alerts. Extend it in the same matte, simplified, front-isometric style rather than mixing unrelated 3D packs.
- Use Lucide for compact interface actions, navigation, status, and utility controls. Small line icons may sit on quiet mint, aqua, lavender, or amber tiles when this improves scanning.
- Default utility icon: 16–20 px, 2–2.25 stroke weight.
- Feature line icon: 24–32 px. Dimensional action artwork: 64–112 px in mobile sections and 144–240 px in major desktop compositions.
- Icons require labels unless their meaning is universal and an accessible name is supplied.
- Do not use emoji as production icons.
- Do not wrap every icon in a colored circle. Containers indicate grouping, state, or hierarchy—not decoration.
- Dimensional artwork is decorative when adjacent text already names the action; expose no duplicate screen-reader label.
- Export action artwork as transparent WebP, keep each file below roughly 60 KB where practical, set intrinsic dimensions, and lazy-load anything below the fold.
- Never use neon glow, glass, glossy plastic, or gradient-filled UI surfaces. Gentle shading inside the rendered object is allowed to communicate volume.

### Listing photography

- Keep aspect ratio consistent within a grid.
- Use object-fit cover for marketplace discovery and object-fit contain only when product recognition would otherwise suffer.
- Show the first image immediately; lazy-load later images.
- Never crop out the defining missing, broken, or matching edge when the seller has supplied it.
- Image fallback uses a quiet neutral field, category/icon cue, and descriptive alt text.

### Atmospheric imagery

Existing isolated objects—chair, compass, cup, typewriter, ceramics, lid, watch gear—may form sparse orbital compositions in campaign areas. Use no more than 3–5 visible objects in a viewport and keep them outside primary reading paths.

---

## 10. Motion and immersion

Motion explains connection and response. It must never hold the interface hostage.

### Motion tokens

| Motion | Duration | Easing/use |
|---|---:|---|
| Tap/press feedback | 90–140 ms | immediate ease-out |
| Standard UI transition | 160–220 ms | state and visibility changes |
| Page/section entrance | 240–360 ms | subtle opacity + 8–18 px movement |
| Hero underline | about 520 ms | hand-drawn reveal |
| Mobile filter sheet | about 220 ms | bottom-up transform |
| Listing image hover | 180–260 ms | scale no greater than 1.03 |

### Signature behaviors

- **Pairing:** two small markers or objects drift a few pixels toward alignment after a successful match.
- **Constellation:** a line draws between related steps or matched items; it should remain subtle and short.
- **Orbit:** an isolated decorative object may move along a shallow path in a hero, never continuously across content.
- **Arrival:** newly loaded cards fade and rise without stagger longer than 300 ms in total.
- **Progress:** uploads, auth callbacks, payment callbacks, and navigation use honest progress indicators.

### Reduced motion

When `prefers-reduced-motion: reduce` is set:

- remove parallax, orbit, hover scale, and continuous animation;
- use instant or near-instant state changes;
- retain progress through static bars, labels, and status icons;
- never depend on motion to explain selection or success.

---

## 11. Application shell

### Desktop navigation

- Sticky white bar with a quiet bottom border.
- Full Remnant logo on the left.
- Core routes: Find a Pair, Market, Sell, Trade, Donate.
- Signed-out users see Log in and the stronger Sign up action.
- Signed-in users see account/avatar access with dashboard, profile/settings where relevant, admin for authorized roles, and log out.
- Active route uses brand text and a restrained indicator; do not use large filled nav tabs.

### Mobile header

- Sticky and compact.
- Use full logo where page context permits; use the mark when inline search needs the width.
- Product/search pages prioritize search and filter access.
- Hamburger/account menu exposes secondary routes without crowding the header.
- The authenticated menu includes account actions; admin appears only for eligible roles.

### Mobile bottom dock

- Hidden on authentication screens, admin, and immersive conversation views.
- Signed out: Home, Market, central List action, Pair, Account.
- Signed in: Listings, Messages, central List action, Pairs, Profile.
- Central List is visually strongest without becoming oversized.
- Active state uses icon, label emphasis, and a small underline/marker.
- Account may display the user's avatar or initials.

### Footer

Desktop footer contains Marketplace, Sell, Trade, Donate, Repair, Recycle, Sustainability, Help, Privacy, Terms, social links, support email, logo, and year. Mobile relies on the bottom dock for primary navigation and may use a compact footer only on long editorial/legal pages when it does not compete with the dock.

---

## 12. Shared components

### Buttons

- Primary: solid brand emerald, white text.
- Secondary: white or transparent, visible border, dark text.
- Tertiary: text/icon action without a surrounding container.
- Destructive: red only for actions with destructive consequences.
- Loading retains the button width, replaces/augments the icon with a spinner, and uses a present-participle label such as “Publishing…”.
- Every button has hover, focus-visible, active, loading, and disabled states.

### Inputs

- Visible label above every persistent field.
- Placeholder demonstrates format; it never replaces the label.
- Helper/error text sits below the control without shifting unrelated layout.
- Search may use an embedded submit button.
- Textareas expose expected detail and character limits where useful.
- Autofocus only when it clearly saves effort and will not force an unwanted mobile keyboard.

### Chips and badges

- Chips are interactive filters and require selected/unselected states.
- Badges are informational and do not look pressable.
- Intent, condition, unread, pending, completed, and admin statuses always include text.

### Listing card

Information order:

1. Image.
2. Intent badge.
3. Optional “Needs …” pairing badge.
4. Item title.
5. Price or intent-specific value.
6. State/city and relative date.

The whole card may link to the detail page. Nested management actions must be separate accessible controls. On touch devices, do not hide important actions behind hover.

### Category tile

Use the existing category image/icon, category label, and a quiet interactive background. The art remains the focal cue. Tiles may scroll horizontally on mobile and resolve into a grid on larger screens.

### Toasts and notifications

- Preserve the existing compact notification language and Sonner-style placement.
- Success confirms the completed action, not merely the click.
- Error states explain the failure and, where possible, recovery.
- Avoid duplicate toast + inline message unless the inline state must persist.
- Use emerald for success, blue for information, amber for pending, red for errors.

### Loading

- Global navigation activity uses the current slim top progress treatment/three emerald bars.
- Content loading uses skeletons shaped like the eventual interface.
- Button-level actions use local spinners.
- Never replace a full page with a spinner if existing content can remain stable.

### Empty and error states

Each state includes:

- a specific headline;
- one sentence explaining the state;
- a primary recovery/creation action;
- an optional secondary route;
- no invented result counts or fake content.

### Dialogs and sheets

- Desktop: centered dialog with bounded height and internal scroll.
- Mobile: bottom sheet for filters and lightweight choices; full-height sheet only for complex tasks.
- Focus is trapped, Escape/back dismisses where safe, and focus returns to the trigger.
- Destructive confirmation names the affected object.

### Chat

- Own messages use brand tint/alignment; other-party messages use white/neutral alignment.
- Timestamp and delivery status are secondary but readable.
- Composer remains anchored above the keyboard/safe area.
- Optimistic messages visibly distinguish sending/failure.

### Status stepper

- Used for upload and transactions.
- Completed, current, upcoming, failed/disputed states differ through icon, text, and color.
- Mobile uses short labels and may scroll or compress without hiding the current state.

---

## 13. Page specifications

### 13.1 Home — `/`

**Goal:** explain the unusual marketplace immediately and move users into search, browsing, or listing.

**Structure:**

1. Minimal hero with “Give your lonely pieces a second chance.”
2. Hand-drawn emerald underline or connector under the key phrase.
3. Desktop search prompt such as “I’m looking for a lid for a teapot…” and Find a Pair action.
4. Mobile-first links to Find a Pair and Browse; search remains available through the shell.
5. Three-step “How it works”: List, Match, Alert.
6. Category strip/grid using existing artwork.
7. Intent actions: Find a pair, Buy, Sell, Trade, Donate, Repair, Recycle.
8. Featured marketplace listing grid and meaningful empty state.

The hero may include restrained isolated-object motion on large screens. Mobile must remain quick, readable, and uncluttered.

### 13.2 Marketplace — `/marketplace`

**Goal:** browse all active listings with clear intent and practical filters.

**Structure:** search/header, intent shortcuts, result count, filter controls, active-filter summary, listing grid, pagination, loading/no-results states.

Filters include search, category, intention tag, and Nigerian state/city. Desktop uses an always-visible or sticky filter panel where space allows. Mobile uses a Filter trigger and bottom sheet. Changing filters returns to page one. The URL remains shareable when filters are server-supported.

Pagination must show current position, disable impossible actions, and preserve filter context. Listing grids are three columns on current compact mobile discovery layouts, three at medium widths, and four at extra-large widths; if content becomes unreadable below 390 px, fall back to two columns.

### 13.3 Find a Pair — `/find-a-pair`

**Goal:** search deliberately for a missing, complementary, or hard-to-find item.

**Structure:** prominent search field, filter trigger, private pair-alert prompt, optional filters, result count, results, no-result state.

Filters: state, category, and intent. The search submit is a distinct emerald control inside/adjacent to the field. The pair-alert prompt connects signed-in users to dashboard Pair Alerts and directs signed-out users through authentication without losing their mental context.

No-results copy should recommend changing a query/filter and offer to create a private alert. This page should feel like an instrument for matching, with subtle connector motion after results arrive.

### 13.4 Listing detail — `/marketplace/[id]`

**Goal:** help a user understand the exact item, trust the listing, and take the correct intent-specific action.

**Reading order:**

1. Back/breadcrumb context.
2. Image gallery with thumbnail navigation.
3. Intent, title, price/value, condition, and location.
4. Pairing or compatibility information.
5. Description and structured details.
6. Seller identity/contact context.
7. Primary action: buy/message/offer/request/arrange as supported.
8. Report listing access.

Desktop uses gallery + sticky information/action column. Mobile places the image first and may use a sticky bottom action area above the dock. Intent-specific data is never buried: trade request, donation mode, repair issue/outcome, recycle material/handoff, or sale price.

Guests may supply the supported contact information and continue through guest messaging/order flows. Signed-in users use their account identity. Preserve all current availability, ownership, and authorization checks.

### 13.5 Legacy listing alias — `/find-a-pair/[id]`

Redirects to `/marketplace/[id]`. Do not design a second detail template. Preserve query/context where technically possible.

### 13.6 Sell intent landing — `/sell`

Headline: “Sell single items and used goods in Nigeria.” Explain that single items, spare parts, incomplete sets, and ordinary used goods are welcome. Primary action: **List an item for sale**. Show current sale listings and a short three-step explanation focused on honest description, price, and safe exchange.

### 13.7 Trade intent landing — `/trade`

Headline: “Trade by barter in Nigeria.” Make “what you have” and “what you need” a visual pair. Primary action: **List an item to trade**. Preview current trade listings; display requested exchange before secondary metadata.

### 13.8 Donate intent landing — `/donate`

Headline: “Donate useful items in Nigeria.” Emphasize direct useful handoff, state, and safe collection/delivery. Primary action: **List an item to donate**. Distinguish public giveaway from reserved recipient when the data supports it.

### 13.9 Repair intent landing — `/repair`

Headline: “Repair broken items and find useful parts.” Explain that damaged items may still be repairable or contain useful components. Primary action: **List a repairable item**. Cards prioritize issue, usable parts, desired result, and optional budget.

### 13.10 Recycle intent landing — `/recycle`

Headline: “Recycle old items and useful materials.” Position recycling after reuse/repair, not as disposal. Primary action: **List an item to recycle**. Cards prioritize material type, quantity/condition where supported, and handoff preference.

### Shared intent-page composition

All five intent pages use the same structural template but not identical emotional emphasis:

1. “Remnant Market Nigeria” eyebrow.
2. Intent-specific headline and explanation.
3. Strong listing CTA and quieter marketplace link.
4. Three concise “how it works” steps.
5. Live listings for that intent.
6. Empty state with a listing CTA.
7. Cross-links to the other four routes.

### 13.11 Create listing — `/sell-item`

**Goal:** publish a complete, trustworthy listing with low cognitive load.

The page title is “Give it a next stop.” It contains a four-stage stepper:

1. **Use:** choose Sell, Trade, Donate, Repair, or Recycle.
2. **Photos:** add at least one JPG, PNG, or WebP; show optimization progress and previews; allow removal; authenticated maximum 8, guest maximum 4.
3. **Details:** item name, description, category, condition, Nigerian state, missing-piece information, and intent-specific fields.
4. **Review:** listing preview, tags, publish progress, back and Publish Listing actions.

Intent-specific detail blocks:

- Sell: price.
- Trade: requested item and optional trade detail.
- Donate: public/recipient mode and handoff detail.
- Repair: issue, desired outcome, and optional budget.
- Recycle: material and handoff preference.
- Guest: at least one supported buyer-contact route, disclosed only as current product rules allow.

Validate at the stage where the information is requested. Preserve values when moving backward. After publishing, show confirmation and route to the actual listing or management page supported by the backend.

### 13.12 Log in — `/login`

**Goal:** quick, confident account access.

Mobile uses a single focused form with logo/back context. Desktop may use a two-panel layout: a restrained brand/story panel and the form panel. Fields: email, password, visibility toggle, password guidance as needed. Actions: Log in, Google sign-in, Forgot password, Create account.

Errors remain close to their cause and may also use the established toast for request failure. Preserve the intended destination after successful authentication.

### 13.13 Sign up — `/signup`

Fields: name, email, password, and supported social sign-in. Explain only concrete benefits: free listings, better match visibility, safer message history. If email confirmation is required, replace or advance the form into a clear code-entry state with resend/change-email access. Link existing users to Log in.

### 13.14 Registration alias — `/register`

Redirects to `/signup`. Do not maintain a duplicate visual flow.

### 13.15 Forgot/reset password — `/forgot-password`

Stage one collects email. Stage two collects the reset code and new password. Show password requirements before submission, use clear success feedback, and return the user to Log in after completion.

### 13.16 Reset alias — `/reset-password`

Redirects to `/forgot-password`. Preserve supported query data.

### 13.17 Authentication callback — `/auth/callback`

A minimal centered status surface communicates “Finishing sign-in,” success, or a specific recovery path. It may use the global progress language but must not simulate progress. On failure, offer Log in and Help; do not leave users on an indefinite spinner.

### 13.18 User dashboard — `/user/dashboard`

Authenticated only. Desktop uses a persistent sidebar and wide content region. Mobile uses the global bottom dock and page-local headers. The active section is reflected by the supported query string.

#### Listings (default)

- Header with listing count and New listing action.
- Search, status filter, and sort.
- Summary metrics such as total views, active listings, matching-ready listings, and listed value.
- Management cards/rows with image, intent, status, title, location, date, views, edit, view, and supported removal controls.
- Selection and bulk action only when a real multi-select action exists.
- Loading, API error, filtered-empty, and first-listing states.

#### Pair Alerts — `?section=pair-alerts`

- Header shows saved-alert and likely-match totals.
- Create alert form: query, category, optional state, brand, model, side/position, maximum budget, and extra detail.
- Alerts are private; say so near creation.
- Each alert shows criteria, match count, current status, likely matches, edit/delete or supported controls.
- Empty state: “Nothing on watch yet” with Create your first alert.

#### Messages — `?section=messages`

- Desktop: conversation list and active conversation side by side.
- Mobile: list first, then an immersive conversation view with shell/dock hidden.
- Search conversations and filter all/unread.
- Show participant, related listing, last message, time, unread count, loading/error/empty states.
- Conversation view includes listing context, safe identity cues, message history, optimistic delivery state, and anchored composer.

#### Alerts — `?section=alerts`

- Unified stream for matches, messages, and system notifications.
- Filters: All, Matches, Messages, System.
- Summary: total, new/unread, match, and system counts where supported.
- Mark one or all read.
- Notification cards lead to the relevant listing, message, alert, or system context.

#### Upload — `?section=upload`

Uses the same four-step listing component as `/sell-item`. Do not fork its fields or validation.

#### Profile — `?section=profile`

- View/edit mode with clear Save and Cancel actions.
- Avatar or initials, display name, email context, state/location, bio, and supported public profile details.
- Account/listing contribution stats may be shown only from real data.
- Profile changes confirm with the existing toast style.

#### Settings — `?section=settings`

- Account information: name, email, state, bio as supported.
- Notifications: email, pair-match, and message preferences.
- Privacy: public profile and city visibility preferences.
- Group switches by meaning, describe consequences, and provide one clear Save action.

### 13.19 Profile alias — `/profile`

Redirects to `/user/dashboard?section=profile`.

### 13.20 Settings alias — `/settings`

Redirects to `/user/dashboard?section=settings`.

### 13.21 Guest conversation — `/guest/messages/[id]`

**Goal:** allow a guest to continue a listing conversation safely in the same browser context.

Use a focused, near-full-height chat layout. Header includes back navigation, participant identity, and listing context. Message bubbles, timestamps, sending/failure states, auto-scroll, and composer follow the shared chat rules. Hide the global dock.

If the guest token is missing, expired, or belongs to another browser, show an unavailable state that explains the limitation and links back to the listing/marketplace. Never expose token values.

### 13.22 Guest order — `/guest/orders/[id]`

Show listing, seller, amount, order reference/status, and a short status explanation. Present only state-valid actions such as Complete payment, Confirm receipt, or Report a problem. If guest access is unavailable, use the same-browser explanation and recovery links.

### 13.23 Transaction detail — `/transactions/[id]`

Authenticated transaction workspace. Desktop uses main status/action content plus a narrower payment/timeline column; mobile uses a single chronological flow.

Required content:

- item and counterparty context;
- transaction reference and amount;
- status stepper/timeline;
- buyer/seller role labels;
- payment state;
- supported shipping/tracking information;
- role- and state-valid primary action;
- report/dispute access;
- loading, unauthorized, and not-found states.

Never show impossible actions. Confirmation steps should state the consequence of marking shipped, received, complete, or disputed.

### 13.24 Stub checkout alias — `/transactions/[id]/stub-checkout`

Redirects to transaction detail. Do not expose a separate fake checkout UI.

### 13.25 Payment callback — `/payment/callback`

Centered status card with four explicit states:

- Processing: progress and “Confirming payment.”
- Success: emerald icon, confirmed wording, View order.
- Pending: amber icon, honest pending explanation, Check order/Keep browsing.
- Error: red icon, actionable recovery and Help.

The page must tolerate refresh and delayed confirmation without charging again or implying success prematurely.

### 13.26 About — `/about`

Editorial narrative page:

1. “Our story” eyebrow and “Every piece still has a purpose.”
2. “A clearer route for the pieces in the drawer.” narrative.
3. Factual product signals: five intents, AI matching, zero listing fee, trust features.
4. Values: Nothing useful is worthless; Trust makes reuse possible; Community completes the loop.
5. Five steps: List the item, Choose intent, AI scans matches, Connect safely, Complete the exchange.
6. CTA: Get started free and Browse marketplace.

Use open editorial space and sparse object/connector composition instead of a wall of cards.

### 13.27 Sustainability — `/sustainability`

Hero explains that Remnant is built for useful things that fall through ordinary-marketplace gaps. Three impact areas: Reuse first, Match the odd pieces, Recycle with intent. Finish with “Start with one piece” and actions to list, search, or browse.

Avoid unsupported environmental totals. If impact metrics are later introduced, label methodology and update frequency.

### 13.28 Help — `/help`

**Structure:** “How can we help you?” search, topic cards, FAQs, and direct support.

Topics include User Guide, Safety Tips, Exchanges, and Shipping. FAQs use accessible accordions with one clear question per trigger. “Still need help?” provides Support Inbox, Phone, and Email only when those channels are active. Search filters/locates real help content; it must not be a decorative input.

### 13.29 Seller's Guide — `/seller-guide`

Long-form learning hub with five tabs:

1. Getting Started.
2. Pricing Guide.
3. Photos & Descriptions.
4. Safety & Exchanges.
5. Success Tips.

Core six-step guidance: take strong photos, write detailed descriptions, price fairly, respond promptly, meet safely, and build reputation. Tabs must be horizontally scrollable or convert to an accessible select/accordion on narrow screens; never squeeze five labels into unreadable columns.

Finish with “Ready to Start Selling?” and a real listing CTA. Update any advice that conflicts with current payment or exchange behavior before release.

### 13.30 Blog alias — `/blog`

Redirects to `/seller-guide` until a distinct publishing system exists.

### 13.31 Privacy — `/privacy`

Readable legal-summary page covering What we collect, How we use it, and Your choices, followed by a privacy-support contact. Keep a narrow reading measure, visible effective/update date when available, plain language, anchored section headings if the policy grows, and no decorative motion behind text.

### 13.32 Terms — `/terms`

Readable terms-summary page covering honest platform use, safe paid exchanges, and respect for items and people. Link to Help for transaction assistance. If the legal text grows, add contents navigation, effective date, jurisdiction, and version history.

### 13.33 Admin — `/admin`

Authorized roles only. The admin interface uses the same tokens but prioritizes density, comparison, and explicit status.

#### Overview

Metrics: Members, Active listings, Open reports, Flagged, and Suspended. Provide quick actions into the other tabs. Every total must come from real data.

#### Listings

Search and status filters; rows/cards contain title, status, seller or guest context, category, location, date, views, and intent. Supported actions include view, contact/message, flag, restore, and remove. Destructive actions require object-specific confirmation.

#### Reports

Filter report status/type; show report reason, target listing/member, reporter context where allowed, date, and history. Supported actions: flag, remove, suspend/ban, dismiss. Keep moderation decisions auditable through backend-supported records.

#### Members

Search members; show join date, listing/report counts where supported, role, and account status. Role changes, message, suspend, and restore require visible feedback. Do not bury suspension state in a menu.

On mobile, convert wide tables into stacked records with a persistent item identity and an action sheet. Do not rely on horizontal scrolling for critical decisions.

### 13.34 Technical, non-visual route — `/listing-image/[id]/[index]`

This route serves listing imagery and is not a page template. Preserve its behavior. Ensure loading failures resolve to the shared image fallback where consumed.

---

## 14. State matrix

Every data-driven page must account for the states below.

| State | Required treatment |
|---|---|
| Initial loading | stable skeleton or contextual progress label |
| Background refresh | keep content; show subtle local activity |
| Empty first-use | explain value and offer creation action |
| Empty filtered/search | name filter/search issue; clear or adjust action |
| Partial data | render safe available content; omit unsupported fields |
| Request error | specific explanation, retry, and safe navigation |
| Unauthorized | explain sign-in/role requirement and preserve destination |
| Not found | identify missing object type; return to relevant index |
| Offline/timeout | keep draft/input where possible; retry |
| Success | confirm completed result and next useful action |
| Pending | state that work is not finished; provide status route |
| Destructive confirmation | name item/member/action and consequence |

---

## 15. Accessibility

Target WCAG 2.2 AA.

- Use semantic landmarks, heading order, lists, forms, tables, dialogs, and buttons.
- Include a skip-to-content link.
- All controls are keyboard reachable with a clearly visible focus ring.
- Icon-only buttons have accessible names.
- Form validation is announced and associated with its field.
- Toasts use suitable live-region priority and do not steal focus.
- Dialogs trap focus and restore it to the trigger.
- Do not encode intent/status by color alone.
- Image alt text describes the object and relevant condition; decorative atmospheric objects use empty alt text.
- Carousel/gallery controls expose position and purpose.
- Maintain 200% zoom and reflow without loss of task completion.
- Respect reduced motion and user text scaling.
- Chat, status, and upload changes are announced without repeatedly reading the entire region.

---

## 16. Content design

### Voice

Clear, useful, warm, and lightly inventive. Remnant speaks like a capable neighbor, not a growth-marketing machine.

### Writing rules

- Prefer verbs: Find, List, Trade, Donate, Repair, Recycle, Message, Confirm.
- Say “item,” “piece,” or the category name instead of “asset.”
- Say what happened: “Pair alert saved,” not “Success!”
- Describe next steps in pending states.
- Avoid guilt-based sustainability language.
- Do not overstate AI accuracy; use “likely match” and explain that users confirm suitability.
- Use Nigerian state names and Naira formatting consistently.
- Safety copy is direct and calm: meet in a public place, verify the item, protect codes/passwords.

---

## 17. Performance and resilience

- Prioritize the first listing/hero image and lazy-load the rest.
- Supply responsive image sizes and compressed modern formats.
- Avoid shipping animation libraries to static legal/information pages when CSS is sufficient.
- Reserve dimensions for images, skeletons, and async sections to limit layout shift.
- Keep mobile navigation and primary task controls interactive during background fetching.
- Debounce search where live requests exist; explicit submit is acceptable where it improves predictability.
- Preserve in-progress listing form data across recoverable failures where possible.
- Do not add atmospheric WebGL/video effects to core task pages.

---

## 18. Frontend/backend boundary

This design work must not alter backend behavior.

### Allowed frontend changes

- markup and semantic structure;
- CSS, tokens, responsive layout, and motion;
- presentational component composition;
- accessible labeling and focus behavior;
- client-only visual state derived from existing data;
- skeleton, error, empty, and confirmation presentation;
- image optimization and non-breaking asset improvements.

### Changes requiring explicit product/backend coordination

- API request/response shapes;
- authentication, role, guest-token, or authorization behavior;
- listing intents, categories, conditions, status values, and validation rules;
- matching, notification, messaging, transaction, or payment state machines;
- moderation effects and audit records;
- new persisted settings, fields, analytics, or environmental claims;
- redirect and canonical route changes.

When a proposed design needs data that does not exist, show a neutral omission state in the prototype and file a separate backend requirement. Do not fabricate data in production.

---

## 19. Review checklist

### Brand and character

- Does the page feel like Remnant rather than a generic marketplace or AI product?
- Are pairing/cosmic cues purposeful and restrained?
- Are existing colors, category artwork, notification semantics, and icon meanings preserved?

### Mobile

- Does the task work at 360 px without horizontal scrolling?
- Is the primary action reachable and clear?
- Are controls at least 44–48 px and clear of safe areas/the mobile dock?
- Does the keyboard leave forms and chat usable?
- Is information density readable rather than merely smaller?

### Interaction

- Are loading, empty, error, pending, success, and unauthorized states covered?
- Does every async action prevent accidental duplicate submission?
- Are destructive actions confirmed and reversible where possible?
- Does reduced-motion mode preserve meaning?

### Accessibility

- Are heading order, labels, alt text, focus, contrast, and keyboard behavior correct?
- Are status and intent understandable without color?
- Do dialogs, sheets, tabs, accordions, and galleries use appropriate semantics?

### Product integrity

- Is the page using actual supported data and state transitions?
- Are guest and authenticated paths both accounted for?
- Are Nigerian location and currency conventions correct?
- Has the change avoided backend/API modification?

---

## 20. Definition of done for a redesigned page

A page is complete only when:

1. Its mobile layout is approved at 360, 390, and 430 px.
2. Tablet and desktop layouts are verified at 768, 1024, 1280, and 1440 px.
3. Realistic long titles, large prices, missing images, and empty data have been tested.
4. Loading, error, permission, success, and pending states are implemented where relevant.
5. Keyboard, screen-reader labels, focus order, contrast, touch targets, reduced motion, zoom, and safe areas are verified.
6. Existing API calls, route behavior, validation, roles, and transaction logic remain unchanged.
7. Visual regression screenshots exist for key breakpoints.
8. Lint, type-check, and relevant frontend tests pass.
9. No unrelated backend or data-layer files are modified.

---

## 21. Route coverage summary

| Route | Page type | Access |
|---|---|---|
| `/` | Home/discovery | Public |
| `/marketplace` | Browse/search | Public |
| `/marketplace/[id]` | Listing detail | Public with auth/guest actions |
| `/find-a-pair` | Matching search | Public |
| `/find-a-pair/[id]` | Redirect to listing | Public |
| `/sell` | Sell landing | Public |
| `/trade` | Trade landing | Public |
| `/donate` | Donate landing | Public |
| `/repair` | Repair landing | Public |
| `/recycle` | Recycle landing | Public |
| `/sell-item` | Create listing | Authenticated or supported guest path |
| `/login` | Authentication | Public |
| `/signup` | Registration | Public |
| `/register` | Redirect to signup | Public |
| `/forgot-password` | Password recovery | Public |
| `/reset-password` | Redirect to recovery | Public |
| `/auth/callback` | Authentication status | Public/system |
| `/user/dashboard` | Account workspace | Authenticated |
| `/profile` | Redirect to dashboard profile | Authenticated |
| `/settings` | Redirect to dashboard settings | Authenticated |
| `/guest/messages/[id]` | Guest chat | Guest token |
| `/guest/orders/[id]` | Guest order | Guest token |
| `/transactions/[id]` | Transaction workspace | Authenticated participant |
| `/transactions/[id]/stub-checkout` | Redirect to transaction | Authenticated participant |
| `/payment/callback` | Payment result | Transaction context |
| `/about` | Brand/story | Public |
| `/sustainability` | Impact narrative | Public |
| `/help` | Help center | Public |
| `/seller-guide` | Education | Public |
| `/blog` | Redirect to seller guide | Public |
| `/privacy` | Legal/privacy | Public |
| `/terms` | Legal/terms | Public |
| `/admin` | Moderation workspace | Authorized admin |
| `/listing-image/[id]/[index]` | Image delivery route, not a page | System/public consumption |
