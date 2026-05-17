# PlantBuddy — Design System & Experience Guide

> This document is the single source of truth for PlantBuddy's visual language, user experience principles, interaction patterns, and screen-by-screen design intent. When building new screens or refining existing ones, start here.

---

## 1. Brand Soul

PlantBuddy is **warm, living, and a little earthy**. It is not a logistics app with a leaf icon. It is a community — the kind that smells like soil, morning light, and someone's grandmother's kitchen windowsill. The design should feel like that: organic, considered, quietly joyful. Not loud. Not clinical. Not "tech startup green."

**Three words that should define every design decision:**
- **Alive** — the UI breathes. Things move gently, like a plant in a breeze.
- **Trusted** — this is a platform where strangers care for things you love. It must feel safe and human, not transactional.
- **Joyful** — plants make people happy. The app should too. Small delights everywhere.

---

## 2. Color System

### Palette

| Token | Value | Usage |
|---|---|---|
| `--forest` | `#1b3a2d` | Primary brand, headers, key CTAs |
| `--leaf` | `#3d6b4f` | Secondary green, active states |
| `--moss` | `#6b9e7a` | Tertiary, icons, dividers |
| `--sage` | `#a8c5a0` | Borders, inactive states, chips |
| `--mist` | `#e8f0e9` | Card backgrounds, subtle fills |
| `--cream` | `#faf7f2` | App background (replaces #f5f5f5) |
| `--parchment` | `#f0ebe1` | Elevated card background |
| `--amber` | `#d4804a` | Accent — CTAs, highlights, badges |
| `--amber-light` | `#f5d5be` | Accent fills, selected states |
| `--terracotta` | `#b85c38` | Destructive actions, error states |
| `--clay` | `#8b4513` | Dark accent text |
| `--ink` | `#1a1a1a` | Body text |
| `--slate` | `#4a5568` | Secondary text |
| `--stone` | `#9a9a8a` | Placeholder, disabled |
| `--white` | `#ffffff` | Card surfaces |

### Principles
- **Never use flat `#4CAF50` green** — it reads as default Material Design, not a designed choice.
- **Background is cream, not grey.** `#faf7f2` reads as warm and organic; `#f5f5f5` reads as undesigned.
- **The amber accent is deliberate.** It creates a warm contrast against the forest greens — unexpected, memorable, not the clichéd purple-on-white.
- **Avoid purple.** Anywhere. Ever.
- **Status colors:**
  - Pending → warm amber `#f5d5be` / `#d4804a`
  - Accepted → sage green `#e8f0e9` / `#3d6b4f`
  - Declined → dusty rose `#f5e0dc` / `#b85c38`
  - Active contract → forest `#1b3a2d`

---

## 3. Typography

### Font Stack

| Role | Font | Weights | Source |
|---|---|---|---|
| Display / Hero | **Fraunces** | 400, 700, 900 | Google Fonts |
| Body / UI | **Bricolage Grotesque** | 300, 400, 600 | Google Fonts |
| Monospace / Data | **JetBrains Mono** | 400 | Google Fonts (optional) |

**Why Fraunces:** It's an optical-size serif with a warm, slightly whimsical personality — designed to feel "grown" rather than engineered. Perfect for a plant app. Nothing like Inter.

**Why Bricolage Grotesque:** It's a wide, slightly quirky grotesque that pairs beautifully with Fraunces without being generic. It has character at small sizes. It does not look like every other app.

### Type Scale

| Token | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `hero` | 40sp | 900 | Fraunces | Splash / empty state headlines |
| `h1` | 30sp | 700 | Fraunces | Screen titles (Plants, Browse) |
| `h2` | 22sp | 700 | Fraunces | Card plant names, section heroes |
| `h3` | 18sp | 600 | Bricolage Grotesque | Section headers, listing titles |
| `body` | 15sp | 400 | Bricolage Grotesque | Descriptions, messages |
| `label` | 13sp | 600 | Bricolage Grotesque | Field labels, tab labels |
| `caption` | 11sp | 400 | Bricolage Grotesque | Timestamps, meta, counts |
| `badge` | 10sp | 700 | Bricolage Grotesque | Status badges (uppercase) |
| `mono` | 13sp | 400 | JetBrains Mono | Dates, codes, numeric data |

### Principles
- **Extreme weight contrast.** Pair 900-weight Fraunces with 300-weight Bricolage. Avoid the mushy 400/600 zone for everything.
- **Size jumps of 3×+.** The hero at 40sp, body at 15sp — not 17sp.
- **Never use system fonts.** Not San Francisco. Not Roboto. Not the default.

---

## 4. Spacing & Shape

### Spacing Scale (base 4)
```
4   — micro gap (icon padding)
8   — tight (badge padding, small chip)
12  — compact (card inner padding sides)
16  — default (card padding, list gutter)
20  — comfortable (screen horizontal padding)
24  — section gap
32  — large section gap
48  — screen bottom padding
```

### Border Radius
| Context | Radius |
|---|---|
| App background panels | 0 |
| Cards | 16 |
| Chips / badges | 999 (pill) |
| Buttons (primary) | 12 |
| Buttons (secondary/outline) | 12 |
| Input fields | 10 |
| FAB | 999 (circle) |
| Bottom sheets | 24 (top only) |

### Elevation / Shadow
Cards use a warm-tinted shadow, never cold grey:
```js
shadow: {
  color: '#1b3a2d',        // forest tint
  opacity: 0.08,
  radius: 12,
  offset: { width: 0, height: 4 }
}
```
Elevated cards (e.g. listing hero): opacity 0.12, radius 20.

---

## 5. Motion & Animation

### Principles
- **One big moment per screen, not scattered micro-interactions.**
- Screen load: stagger cards in with a gentle fade+translateY (0→8px, 0ms → 200ms delay per item).
- FAB: subtle spring scale on mount (0.8 → 1.0, 300ms).
- Button press: scale to 0.97 on press, spring back (100ms).
- Status badge change: fade between colors (150ms).
- Empty state illustration: slow float animation (translateY ±6px, 3s ease-in-out infinite).

### Do Not
- Do not animate between every tap.
- Do not use spinning loaders for local state changes — use skeleton screens or inline indicators.
- Do not animate list scroll (it causes jank on lower-end Android).

### React Native Implementation
Use `Animated` API for simple transforms. For complex sequences (staggered list reveals), use `react-native-reanimated` when added. For now, `Animated.stagger` from core RN is sufficient.

---

## 6. Iconography

Use **[Phosphor Icons](https://phosphoricons.com/)** via `phosphor-react-native`. It has a warm, rounded feel that matches the brand — not the sharp geometric look of Material Icons or the heavy weight of FontAwesome.

| Context | Icon |
|---|---|
| My Plants tab | `Plant` (Phosphor) |
| Browse tab | `Binoculars` |
| Profile tab | `UserCircle` |
| Add plant FAB | `Plus` |
| Watering | `Drop` |
| Light | `Sun` |
| Humidity | `CloudRain` |
| Care task | `CheckCircle` |
| Sitting dates | `CalendarBlank` |
| Application | `PaperPlaneTilt` |
| Contract | `Handshake` |
| Message | `ChatText` |
| Logout | `SignOut` |
| Back | `ArrowLeft` |
| Edit | `PencilSimple` |
| Delete/archive | `ArchiveBox` |

Tab bar icons: 24pt regular weight. In-card icons: 16pt regular. Hero icons (empty states): 64pt light weight.

---

## 7. Component Patterns

### Cards
All cards follow the same structure:
```
[Optional left accent bar — 4px, amber or forest]
[Top row: primary name (h2) + status badge]
[Second row: species or subtitle (caption, stone)]
[Body: description or message (body)]
[Meta row: dates or counts (caption, mono)]
[Action row: primary button + secondary button]
```
Background: `--white`. Border: none. Shadow: warm forest tint.

### Status Badges
Pill shape (radius 999). Always uppercase, 700 weight, 10sp.
```
PENDING  → amber-light bg, amber text, amber border
ACCEPTED → mist bg, leaf text, sage border
DECLINED → dusty rose bg, terracotta text
ACTIVE   → forest bg, white text
OPEN     → mist bg, moss text
```

### Buttons
**Primary (CTA):** Filled forest or amber. 700 weight, 16sp Bricolage. Height 52. Radius 12. Scale to 0.97 on press.

**Secondary:** White bg, forest border (1.5px). Same height. Text: forest.

**Destructive:** White bg, terracotta border. Text: terracotta. Never filled red.

**Ghost/Link:** No bg, no border. Amber or slate text. For "Skip", "Cancel", "Already have an account?"

### Input Fields
Background: white. Border: 1.5px sage. Active border: 1.5px leaf. Error border: 1.5px terracotta. Radius 10. Label above in `label` style, forest 600. No floating labels — static labels above. Placeholder: stone.

### Chips (filters, plant picker)
Pill shape. Unselected: white bg, sage border, slate text. Selected: mist bg, leaf border, forest text, 600 weight. Touch target ≥ 44px.

### Tab Bar
Background: white. Border top: 1px, sage at 50% opacity. Active: forest color + slightly larger icon. Inactive: stone. No background highlight on active tab — color change only. Labels: 11sp, 600, Bricolage.

### FAB (Floating Action Button)
Amber (`--amber`) background. `Plus` icon in white. Size 56×56. Shadow: amber-tinted. Bottom: 28, right: 24. Spring scale on mount.

---

## 8. Screen-by-Screen Experience

### Login Screen
**Feeling:** Coming home.
- Full-screen cream background with a very subtle radial botanical texture (SVG or pattern, not a photo).
- Large centered Fraunces logo wordmark "PlantBuddy" at 900 weight, forest color.
- A tiny illustrated plant (SVG, 60px) above the wordmark — slow float animation.
- Email + password fields, no username login.
- Primary CTA: "Welcome back" button, amber.
- Ghost link below: "New here? Create an account"
- No card container — fields float directly on the cream background.

### Register Screen
**Feeling:** Planting a seed.
- Same background as Login.
- Header: "Join the community" in Fraunces h1.
- Fields: Display Name, Username, Email, Password — in that order.
- Progress dots (4 dots) below the title showing this is step 1 of 2 (step 2 = ProfileSetup).
- CTA: "Create account" in amber.

### Profile Setup Screen
**Feeling:** Choosing your role.
- Header: "You're in. 🌱" (Fraunces 700, h1) — one of the rare emoji uses, feels like a celebration.
- Subtitle: "Tell us a bit about yourself" (body, slate).
- Display name field.
- Divider with label "Want to sit plants too?"
- Large toggle card: white bg, rounded 16, soft shadow. Toggle on right. When toggled ON: card border animates to leaf green, sitter fields slide down (expand animation, 200ms).
- Sitter fields: experience textarea, daily rate numeric input.
- CTA: "Let's go" (amber, full width).
- Ghost link below: "Skip for now" (stone, center).

### My Plants Screen (Home)
**Feeling:** Your garden.
- Header bar: cream bg. Left: "My Plants" in Fraunces h1, forest. Right: avatar circle (initials) that opens profile/logout.
- Replace hamburger logout button with a subtle initials avatar — more human, less utilitarian.
- Plant cards: white bg, warm shadow. Plant name in Fraunces h2. Species in italic caption below. Right side: conditional button.
  - No active listing → amber "Find sitter" chip.
  - Active listing exists → forest "Applicants" chip with a small count badge if > 0 applications.
- Empty state: large centered Phosphor `Plant` icon (64pt, light, sage), Fraunces h2 "Your garden is empty", body text "Add your first plant and introduce it to the community.", amber CTA button.
- FAB: amber, `Plus` icon, bottom right.
- **Staggered card entrance animation** on screen load.

### Add / Edit Plant Screen
**Feeling:** Writing a care card.
- Header: "Add Plant" or "Edit Plant" in Fraunces h1.
- Fields organized into visual sections (no section headers needed — use spacing):
  - **Identity:** Name, Species, Description
  - **Physical:** Size, Health Status, Location/Room
  - **Care:** Watering Frequency (with "days" suffix inside field), Light, Humidity, Special Instructions
- Watering field: numeric keypad. Show a small `Drop` icon inside the field on the left.
- Light field: show a small `Sun` icon.
- Save button: amber, full width, sticky at bottom on scroll (use `KeyboardAvoidingView` + sticky footer view).

### Post Listing Screen
**Feeling:** Sending your plant on an adventure.
- Header: "Find a Sitter" (Fraunces h1).
- Plant picker: horizontal scroll of pill chips. Selected chip: forest bg + white text. Animate scale 1.0 → 1.05 on select.
- Date fields grouped in a white card: "Sitting period" as a label, Start and End inputs side by side.
- Optional title + description fields.
- CTA: "Post listing" (amber). Below it, caption text: "Your listing will be visible to all sitters immediately."

### Browse / Listings Feed
**Feeling:** Walking through a plant market.
- Header: "Find Plants to Sit" (Fraunces h1). Subtitle: "Open sitting requests near you" (caption, stone).
- Cards: plant name (Fraunces h2), species (italic, caption). Date range on its own line with a `CalendarBlank` icon. Duration badge (pill, amber). Light and watering chips at the bottom.
- Pull-to-refresh.
- Empty state: `Binoculars` icon (64pt, sage), "No listings right now", "Check back soon or tell your friends to post theirs."

### Listing Detail Screen
**Feeling:** Reading a plant's passport.
- Full-bleed header card: cream→mist gradient. Plant name in Fraunces 900 hero. Species in italic below. Duration badge in amber pill.
- Sections with small Phosphor icon + label headers: "Sitting Period", "About this listing", "Care requirements".
- Care chips row: watering frequency, light, humidity as pill chips (mist bg, moss text).
- Special instructions: left-bordered card (4px amber), cream bg.
- Sticky bottom bar: "Apply to Sit" amber button, full width, 52px height.

### Apply Screen
**Feeling:** Writing a cover letter for a plant.
- Top card: plant name (Fraunces h2), date range, amber left border. Reminds sitter what they're applying for.
- "Message to owner" textarea — large, minimum 120px height. Placeholder: "Tell the owner why you'd be a great caregiver for this plant..."
- Proposed dates section: collapsible card. Default: pre-filled from listing. Toggle "Use different dates" to expand editable fields.
- CTA: "Send application" (amber, 52px, full width). Icon: `PaperPlaneTilt` on the left.
- Sends with a brief scale animation on the button.

### Applications Screen (Owner Inbox)
**Feeling:** Choosing a trusted caretaker.
- Subheader shows listing title in italic body, stone. Count: "3 applications".
- Applicant cards: name (Bricolage h3, forest), username below in caption. Message body. Proposed dates in mono caption. Applied timestamp bottom right.
- Status badge top right of each card.
- PENDING cards: green "Accept" + ghost "Decline" buttons. Side by side. Accept uses amber on hover/press — implies warmth, not just a yes/no transaction.
- ACCEPTED card: subtle mist background tint. Shows "Accepted" badge. No action buttons.
- Empty state: `UserCircle` icon, "No one has applied yet", "Share your listing to find a sitter."

---

## 9. User Flow Map

```
ONBOARDING
──────────
Launch
  ├─ Returning user → Main (My Plants tab)
  └─ New user
       ├─ Register → Profile Setup → Main
       └─ Login → Main

OWNER FLOW (My Plants tab)
──────────────────────────
My Plants
  ├─ Tap plant → Edit Plant
  ├─ "Find sitter" → Post Listing
  │     └─ Post → My Plants (listing now active)
  └─ "Applicants" → Applications Screen
        ├─ Accept applicant → [Stage 3: Contract]
        └─ Decline applicant → Applications Screen

SITTER FLOW (Browse tab)
─────────────────────────
Browse Feed
  └─ Tap listing → Listing Detail
        └─ "Apply to Sit" → Apply Screen
              └─ Submit → Browse Feed

PROFILE FLOW (future Profile tab)
──────────────────────────────────
Profile
  ├─ Edit display name / bio
  ├─ Toggle sitter mode on/off
  ├─ Edit sitter profile (rate, experience)
  └─ Logout

FUTURE FLOWS (Stages 3–7)
──────────────────────────
Accept → Contract Detail → Dual confirm
Contract Active → Messaging thread
Contract Closed → Review screen
Notifications → Deep link to relevant screen
```

---

## 10. Micro-copy Principles

- **Conversational, not corporate.** "Find a sitter" not "Create listing". "Send application" not "Submit". "Let's go" not "Continue".
- **Plants have names.** Use the plant's name wherever possible in UI copy — "Gerald needs a sitter" is better than "Your plant needs a sitter."
- **Warm empty states.** Never just "No data." Always: what's missing, why it matters, what to do next.
- **Confirmation dialogs are honest.** "Accept this application?" with a real sentence explaining what happens next — not just OK/Cancel.
- **Errors are helpful.** "That email is already registered — try logging in instead" not "Email already exists."

---

## 11. Accessibility

- Minimum tap target: 44×44px (all buttons, chips, icons).
- Color contrast: all body text on backgrounds meets WCAG AA (4.5:1 minimum).
- Do not rely on color alone for status — always pair with text or icon.
- All inputs have accessible labels (not just placeholder text).
- Animation: wrap all animations in `useReducedMotion` check (React Native Accessibility API) — if reduced motion is enabled, skip entrance animations.

---

## 12. What to Never Build

- **No dark mode yet.** The cream/forest palette is intentional and complete. Dark mode requires a full parallel token system — defer until post-MVP.
- **No purple.** Anywhere.
- **No generic stock illustrations.** Either use Phosphor icons at large scale, simple SVG plant illustrations, or no illustration at all. No Undraw.co characters.
- **No skeleton screens on fast operations.** Only use skeletons for network calls expected to take >500ms. Use the `ActivityIndicator` for short waits.
- **No modal stacks.** Prefer full-screen navigation pushes over modals for all primary flows. Modals only for confirmations (Alert) and short forms.
- **No bottom sheets yet.** Unless implementing messaging — keep the navigation model simple.
