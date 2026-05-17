# PlantBuddy — Product Document

> *"Every plant deserves a caretaker. Every caretaker deserves a community."*

This is the product vision and intended full scope. For the current implementation status, setup steps, risks, and handoff notes, use the `docs/` folder as the day-to-day source of truth.

---

## The Problem Worth Solving

You're going on a two-week trip. Your monstera is sitting in the corner, silently judging you. You can't bring it. You can't leave it. Your friends are either too busy, too far, or too afraid to admit they don't know what "indirect sunlight" means.

On the other side of that problem is someone who *loves* plants, who has space, time, and a genuine desire to nurture something alive — but doesn't own anything yet, or wants more green in their life without the commitment of buying.

**PlantBuddy bridges that gap.** It turns plant ownership into a community act. Owners lend. Sitters adopt temporarily. Plants get the care they need. People connect around something real.

---

## What PlantBuddy Does

PlantBuddy is a **full-stack, cross-platform application** available on Android, iOS, and the web. It lets plant owners publish their plants for short-term care, and lets plant sitters browse, apply, and formally commit to caring for those plants during a defined period — from any device, anywhere.

The core loop is simple:

```
Owner creates a plant profile
  → Owner posts a sitting request (with dates)
    → Sitter browses and applies
      → Owner accepts, contract is formed
        → Sitter cares for the plant
          → Owner returns, contract closes
            → Both parties leave reviews
```

One user can be both an owner and a sitter. You can lend your ficus on Monday and apply to care for someone's succulent collection on Tuesday. Roles are fluid. The platform grows with you.

---

## Core Concepts

### The Plant Profile

Every plant gets its own identity card — a profile that travels with it through every sitting request, swap, or donation. Owners build these profiles once and reuse them.

A plant profile contains:

| Field | Purpose |
|---|---|
| Name | What you call it (yes, "Gerald" is valid) |
| Species | Helps sitters know what they're signing up for |
| Description | Personality, quirks, history |
| Age | Whether it's a seedling or a decade-old specimen |
| Size | So the sitter knows it'll fit in their apartment |
| Health Status | Honest notes on current condition |
| Watering Frequency | Days between waterings |
| Light Requirements | Indirect? Direct? Shade-lover? |
| Humidity Requirements | Tropical diva or desert stoic? |
| Special Instructions | "Don't move it. Seriously. It hates moving." |
| Location Notes | Where it lives best at home |
| Photos | The plant's portfolio |
| Care Tasks | Specific scheduled tasks (misting, fertilizing, rotating) |

A well-built plant profile is a gift to the sitter. It eliminates guesswork and sets both parties up for a successful arrangement.

---

### The Four Listing Types

Once a plant profile exists, an owner can publish it in four modes:

#### 1. Sitting Request
> *"I'm traveling June 1–14. Can someone care for my pothos?"*

The flagship interaction. Owner specifies a date range. Sitters browse and apply. A formal contract is negotiated and signed by both parties. The most structured, trust-building mode.

#### 2. Donation
> *"I'm moving to a studio and can't take all of them. Free to a good home."*

The owner gives the plant away permanently. Sitters express interest. The owner selects a recipient. Ownership transfers.

#### 3. Swap
> *"I have three snake plants. Anyone want to trade for something tropical?"*

Owner-to-owner plant exchange. The proposing owner offers one of their plants in exchange for the listed plant. Both parties agree before anything moves.

#### 4. Sale *(Store Owners only)*
> *"Rare variegated monstera, $85, ships in terracotta pot."*

Approved plant stores can list plants for purchase. Buyers browse and order through the platform. Requires admin approval to unlock.

---

### Dual Roles — One Account

A single account can hold three role profiles simultaneously:

| Role | What it unlocks |
|---|---|
| **Owner** | Create plant profiles, post sitting requests, post donations, propose swaps |
| **Sitter** | Apply to sitting requests, receive donations, set availability and daily rate |
| **Store Owner** | List plants for sale (requires platform approval) |

Roles are additive. Activating sitter mode doesn't remove owner capabilities. There is no penalty for wearing both hats — the platform is designed for plant people who do it all.

---

### The Contract

When a sitting request matches with a sitter application, the platform formalizes the arrangement into a **contract**. This is not just a handshake — it's a structured agreement that:

- Names the owner and sitter explicitly
- Specifies the exact date range of care
- Lists which plants are covered
- Records the agreed payment (if any)
- Tracks dual acceptance (both parties must sign off)
- Provides a dispute pathway if something goes wrong

Contract states flow through:

```
DRAFT → PENDING_OWNER → PENDING_SITTER → ACTIVE → COMPLETED
                                       ↘ CANCELLED / DISPUTED
```

No plant moves without a contract. No payment is released without completion. The contract is the trust layer.

---

## User Flows

### Flow A: Lending Your Plant

```
1. Create account → activate Owner profile
2. Build a plant profile for your monstera (photos, care tasks, instructions)
3. Post a Sitting Request: "June 1–14, $0 or negotiable"
4. Receive sitter applications in your inbox
5. Review applicant profiles and ratings
6. Accept an application → contract is auto-generated
7. Negotiate final dates and price via in-app messaging
8. Both parties confirm the contract
9. Hand off the plant (in-person or delivery)
10. Sitter completes the sit → contract closes
11. Leave a review for your sitter
```

### Flow B: Adopting a Plant to Care For

```
1. Create account → activate Sitter profile
2. Set your availability calendar and daily rate
3. Browse open sitting requests, filtered by date/location
4. View plant profiles — species, care needs, photos
5. Apply with a message and proposed dates/price
6. Owner accepts → review and sign the contract
7. Receive care instructions and pick up the plant
8. Log care tasks as you complete them
9. Return the plant at contract end
10. Receive payment → get reviewed
```

### Flow C: The Power User (Both Roles)

One account. Multiple plants owned. Multiple sitting arrangements active. It's common — plant people are enthusiastic. The app handles this gracefully: your dashboard shows owned plants, active sitter contracts, and pending applications all in one view.

---

## Architecture

PlantBuddy is built around a managed Supabase backend serving the active Expo frontend, with the older native Android code retained as a reference build:

```
┌──────────────────────────────────────────────────────┐
│                    Client Layer                       │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Android    │  │    iOS      │  │    Web      │  │
│  │ (Java/MVVM) │  │  (Expo /    │  │  (Expo /    │  │
│  │             │  │React Native)│  │React Native)│  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
          └────────────────▼────────────────┘
                  supabase-js SDK
               ┌──────────────────────┐
               │       Supabase       │
               │  Auth  │  PostgREST  │
               │  Storage │ Realtime  │
               └──────────┬───────────┘
                          │
               ┌──────────▼───────────┐
               │  PostgreSQL (hosted) │
               │  Normalized schema   │
               │  Row Level Security  │
               │  CHECK constraints   │
               └──────────────────────┘
```

The cross-platform frontend (`react_webiosand/`) is built with **Expo and React Native**, producing a single codebase that deploys to Android, iOS, and web. The backend is **Supabase** — a managed platform providing auth, a PostgREST auto-API over PostgreSQL, realtime subscriptions, and file storage, with no server to operate. The native Android build (`android_only/`) is a standalone Java reference implementation.

### Why This Stack

- **Expo / React Native** — one codebase, three platforms; no divergent UI implementations to maintain
- **Supabase** — eliminates backend boilerplate; auth, API, realtime, and storage are all managed; Row Level Security replaces application-layer RBAC
- **Native Android (Java)** — reference implementation demonstrating the full MVVM pattern with Retrofit and LiveData
- **PostgreSQL** — relational integrity matters when contracts and payments are involved; the existing schema applies directly to Supabase's hosted Postgres

---

## Database Design

The schema is normalized and integrity-enforced. Key design decisions:

**Role profiles are satellite tables**, not columns on `users`. A user who is both owner and sitter has two profile rows. This keeps role-specific data clean and prevents null pollution.

**Plants are owned, not embedded**. `plants` is its own table. Ownership transfers via `current_owner_user_id`. A plant's history persists across owners.

**Listings are polymorphic by type, not by table**. One `plant_listings` table covers all four modes. PostgreSQL `CHECK` constraints enforce that sale listings have a price and a store owner, that sitting listings have date ranges, and that non-sale listings have an owner profile. Business rules live in the database, not just the application.

**Contracts require dual acceptance**. `owner_accepted_at` and `sitter_accepted_at` are tracked independently. A contract cannot reach `ACTIVE` status unless both timestamps are present. This is enforced at the application layer with the schema reflecting the invariant.

**The payment ledger is append-only**. Every financial event — sitter payment, store purchase, refund, payout — is a ledger row. No amounts are mutated. The balance is always derivable from history.

### Entity Relationship Summary

```
users ──┬── owner_profiles ──── plants ──── plant_listings ──┬── listing_applications ── contracts ── contract_plants
        ├── sitter_profiles                                   ├── swap_proposals
        └── store_owner_profiles                              └── store_orders

contracts ── payment_ledger
conversations ── messages ── message_attachments
users ── notifications
users ── sitter_reviews
users ── moderation_cases
users ── audit_log
```

---

## Feature Set

### Plant Management
- Create unlimited plant profiles per user
- Upload multiple photos per plant (sorted gallery)
- Define recurring care tasks with frequency and instructions
- Archive plants without deleting history

### Listing & Discovery
- Post sitting requests with date windows
- Browse open listings with status filtering
- View full plant profiles before applying
- Propose plant swaps to other owners
- Donate plants to interested sitters

### Applications & Matching
- Apply to sitting requests with a personalized message
- Propose custom dates and price
- Owner reviews all applications and selects one
- Declined and withdrawn applications are tracked

### Contracts
- Auto-generated from accepted applications
- Dual-signature confirmation flow
- Covers multiple plants per arrangement
- Dispute pathway for escalations

### Messaging
- Threaded conversations per listing, contract, or order
- Supports text, images, and file attachments
- Read receipts and delivery tracking
- System messages for key contract events

### Payments
- Ledger-style payment tracking (immutable history)
- Supports sitter payments, store purchases, and refunds
- Currency-aware (multi-currency schema ready)
- Payout account reference per store owner

### Availability
- Sitters set available date ranges
- Status: Available / Unavailable / Booked / Tentative
- Travel radius and "can travel" flag

### Reviews & Reputation
- Post-contract reviews (owner reviews sitter)
- Star ratings (1–5) plus written review
- Sitter rating average computed and stored on profile
- Rating count tracked for credibility weighting

### Notifications
- Application received / accepted / declined
- Swap proposal received / accepted / declined
- Contract created and accepted
- New message
- Order created
- Payment posted
- System alerts

### Security
- Supabase Auth manages password hashing, JWT issuance, and token refresh
- Row Level Security (RLS) policies enforce data access at the database layer
- Anon key is safe to ship in the client; service role key never leaves the server
- Audit log table tracks significant actions
- Moderation case system for user reports

---

## Technology Stack

### Cross-Platform Frontend (Android + iOS + Web)
| Component | Technology |
|---|---|
| Framework | Expo (React Native) |
| Language | JavaScript / TypeScript |
| Platforms | Android, iOS, Web (single codebase) |
| Networking | `@supabase/supabase-js` |

### Native Android (Reference Build)
| Component | Technology |
|---|---|
| Language | Java |
| Architecture | MVVM |
| Networking | Retrofit |
| State | ViewModel + LiveData |
| IDE | Android Studio |

### Backend
| Component | Technology |
|---|---|
| Platform | Supabase (managed) |
| Auth | Supabase Auth (JWT, magic link, OAuth) |
| API | PostgREST (auto-generated from schema) |
| Realtime | Supabase Realtime (websocket subscriptions) |
| File Storage | Supabase Storage |
| Access Control | Row Level Security (RLS) policies |

### Database
| Component | Technology |
|---|---|
| Engine | PostgreSQL 15 (hosted by Supabase) |
| Schema enforcement | CHECK constraints, RLS policies |
| Case-insensitive text | `citext` extension |
| Performance | Indexed by FK, type, and status columns |
| Soft deletes | `deleted_at`, `archived_at` timestamps |

---

## Repository Structure

```
plantbuddy/
│
├── android_only/                  Native Android build (Java + MVVM)
│   ├── app/
│   │   └── src/main/java/com/plantbuddy/
│   │       ├── model/             Domain models (User, Plant, etc.)
│   │       ├── network/           Retrofit client, API service, interceptors
│   │       │   └── dto/           Request/response DTOs
│   │       ├── repository/        Data access layer
│   │       ├── storage/           Session / token management
│   │       ├── ui/                Activities and Adapters
│   │       └── viewmodel/         ViewModels + Factory
│   │
│   ├── db/
│   │   ├── sql_build_tables.sql   Full PostgreSQL schema
│   │   └── db_schema_mermaid.png  Visual ERD
│   │
│   └── docs/
│       ├── ER.jpg                 Entity-Relationship diagram
│       ├── Tables.jpg             Table reference
│       └── UML.jpg                UML class diagram
│
└── react_webiosand/               Cross-platform frontend (Expo / React Native)
    ├── index.js                   App entry point
    ├── app.json                   Expo config (Android + iOS + Web targets)
    └── assets/                    Icons, splash screen, favicon
```

---

## Local Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| Expo CLI | via `npx expo` |
| Android Studio | Latest stable (for Android emulator) |
| Xcode | Latest stable (for iOS simulator, macOS only) |

### 1. Supabase Project

1. Create a project at https://app.supabase.com
2. Run the schema in the SQL editor: `android_only/db/sql_build_tables.sql`
3. Run the RLS policies in the SQL editor: `android_only/db/rls_policies.sql`
4. Copy your project URL and anon key from **Settings → API**

### 2. Environment Variables

Create `react_webiosand/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Cross-Platform Frontend (Android, iOS, Web)

Install dependencies:
```bash
cd react_webiosand
npm.cmd install
```

Run on your target platform:
```bash
npx expo start          # interactive launcher
npx expo start --android
npx expo start --ios
npx expo start --web
```

### 4. Native Android App (Reference Build)

Open `android_only/` in Android Studio. Update `BuildConfig.BASE_URL` to your Supabase project REST URL if connecting this build to Supabase. Run on emulator or connected device.

---

## Current Data Access Reference

The active Expo app does not use a custom REST backend. It talks directly to Supabase Auth and Supabase PostgREST through `@supabase/supabase-js`.

The endpoint-style list below is a conceptual product API surface for future planning, not a set of implemented custom server routes.

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Plants
```
GET    /api/plants
POST   /api/plants
PUT    /api/plants/{id}
DELETE /api/plants/{id}
```

### Listings
```
GET  /api/listings
POST /api/listings
```

### Applications
```
POST /api/listings/{id}/applications
PUT  /api/applications/{id}
```

### Contracts
```
GET  /api/contracts
POST /api/contracts
PUT  /api/contracts/{id}
```

### Messaging
```
GET  /api/conversations
POST /api/messages
```

---

## What's Next

The current build is a partially implemented portfolio project. Planned evolution:

| Priority | Feature |
|---|---|
| High | Tighten high-priority RLS policies before real user data |
| High | Harden sitter/application eligibility rules |
| High | Transactional accept flow that creates contracts |
| High | Contract detail and dual-confirmation screens |
| Medium | Plant photos with Supabase Storage |
| Medium | Messaging and notifications |
| Medium | Reviews and sitter reputation scoring |
| Medium | Location-based listing discovery |
| Medium | AI-assisted plant profile, care instruction, search, and matching features |
| Medium | Expanded automated test suite beyond current unit/smoke tests |
| Medium | CI/CD |
| Low | Push notifications (FCM) |
| Low | Payment provider integration (Stripe) |
| Low | Admin dashboard for store owner approval |
| Low | Rate limiting and HTTPS enforcement |

---

## Why This Project Exists

PlantBuddy started as a question: *what does trust look like between strangers who share a living thing?*

The answer turned out to be: structure, transparency, and a good contract. The app is designed so that every interaction — from browsing a listing to completing a sitting arrangement — is documented, agreed upon, and reviewable. Plants are not just decorative objects. They're alive, they have needs, and handing one off to a stranger requires genuine trust infrastructure.

This project is a portfolio demonstration of full-stack, cross-platform development: Supabase as a managed backend serving an Expo cross-platform frontend (Android, iOS, web) from a single codebase, alongside a native Android reference build in Java. Every layer makes deliberate choices. The database enforces business rules via CHECK constraints and Row Level Security. The Expo frontend targets all three platforms without duplicating UI code. The native Android app demonstrates the full MVVM pattern with Retrofit and LiveData.

The goal was to build something that could actually work — not just something that compiles.

---

## Author

Built as a full-stack portfolio project exploring:
- Cross-platform frontend development with Expo and React Native (Android, iOS, web)
- Native Android development with Java and MVVM
- Backend-as-a-service architecture with Supabase (Auth, PostgREST, Realtime, Storage)
- Relational database engineering with PostgreSQL
- Row Level Security as the access control layer
- Multi-sided platform design (owners, sitters, store owners)
