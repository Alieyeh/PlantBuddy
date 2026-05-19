# PlantBuddy Work Tracker

Date: 2026.5.19
Done by: EZ
Last updated: 2026-05-19
Purpose: give the next engineer or AI a fast, reliable handoff point with enough detail to continue implementation immediately.

---

## 1. Current Product Snapshot

PlantBuddy is no longer just a plant-sitting app.

The active direction is a hybrid product with four listing modes:

- `SITTING_REQUEST`: owner needs someone to care for a plant temporarily
- `GIFT`: owner is rehoming a plant for free
- `SALE`: owner is selling a plant directly to another user
- `SWAP`: owner wants to exchange a plant for another plant

The active frontend is the Expo app in `react_webiosand/`.
The active backend is Supabase.
The `android_only/` Java app is reference / legacy and is not the active delivery target.

---

## 2. What Was Completed Today

### Backend and data model alignment

The database model was aligned to the new marketplace + care direction.

Completed in source-of-truth SQL:

- `DONATION` was renamed to `GIFT`
- peer owners can now create `SALE` listings
- listing constraints were tightened by listing type
- handoff tracking was added through:
  - `listing_handoffs`
  - `listing_handoff_reviews`
- validation trigger functions were expanded for listings, applications, swaps, contracts, handoffs, and orders
- RLS policies were updated to enforce listing-specific behavior

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_19_marketplace_alignment.sql`

Important note:
The user reported that the migration file was run in Supabase. Treat the live database as migrated unless a later failure proves otherwise.

### Frontend listing creation

The app now supports creating more than sitting requests.

Completed:

- `PostListingScreen` supports `SITTING_REQUEST`, `GIFT`, and `SALE`
- listing form helpers now validate by mode
- payload construction is mode-aware
- plant cards in `PlantsScreen` now reflect active listing type instead of assuming sitting only

Files:

- `react_webiosand/src/screens/PostListingScreen.js`
- `react_webiosand/src/screens/PlantsScreen.js`
- `react_webiosand/src/utils/listingForm.js`
- `react_webiosand/src/api/listingsService.js`
- `react_webiosand/test/unit/listingForm.test.cjs`

### Frontend marketplace browsing and detail actions

The browse and detail experience now supports marketplace flows in-app.

Completed:

- browse feed shows all open listing types, not only sitting requests
- listing cards show type-aware summary and badges
- listing detail screen now branches by listing type
- non-owners can start gift or sale handoff flow from detail
- owners can view swap proposals on swap listings
- non-owners can propose swaps from detail
- handoff status, participant confirmations, and review entry points now appear on detail

Files:

- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/screens/ListingDetailScreen.js`

### Swap proposal and handoff review flows

Completed:

- user can propose a swap with one of their own plants
- owner can review incoming swap proposals
- owner can accept or decline a swap proposal
- accepting a swap proposal starts a listing handoff record
- participants can confirm handoff completion from the listing detail screen
- participants can leave a handoff review after completion

Files:

- `react_webiosand/src/screens/SwapProposalScreen.js`
- `react_webiosand/src/screens/SwapProposalsScreen.js`
- `react_webiosand/src/screens/HandoffReviewScreen.js`
- `react_webiosand/src/api/listingsService.js`
- `react_webiosand/src/navigation/AppNavigator.js`

### Documentation and product direction

The product and design docs were rewritten to match the broader marketplace direction.

Updated:

- `PRODUCT.md`
- `design.md`
- selected technical docs such as `tech-stack.md`, `android_only/README.md`, and `docs/database-and-supabase.md`

---

## 3. Verified Working State

The latest verified command was run from:

- `D:\PlantBuddy\react_webiosand`

Command:

```powershell
npm test
```

Result on 2026-05-19:

- unit tests passed: 14/14
- smoke tests passed: 5/5
- no editor errors were reported in the newly changed marketplace screens and navigation files

This means the current tracked implementation is at least syntax-clean and test-clean for the existing test suite.

---

## 4. Important Files To Read First Next Time

If someone resumes this project later, start here in this order:

1. `work_tracker.md`
2. `PRODUCT.md`
3. `design.md`
4. `android_only/db/2026_05_19_marketplace_alignment.sql`
5. `react_webiosand/src/api/listingsService.js`
6. `react_webiosand/src/screens/ListingDetailScreen.js`
7. `react_webiosand/src/navigation/AppNavigator.js`

Those seven files explain the current product model, database contract, and active app behavior fastest.

---

## 5. Current Reality By Layer

### Frontend

Implemented and usable now:

- auth flow
- plant CRUD
- listing creation for sitting, gift, and sale
- browse feed for all open listing types
- listing detail with type-specific actions
- sitting application flow and owner applicant review
- swap proposal create/review/accept-decline flow
- handoff confirmation flow
- handoff review submission flow

Still thin or missing:

- no dedicated "my exchanges" inbox yet
- no richer browse filters yet
- no push notifications for proposal / handoff updates
- no image upload flow for listings or plants beyond existing structure
- no explicit post-completion lifecycle UI beyond detail-screen actions

### Database / Supabase

Implemented in schema and migration source:

- marketplace listing types
- listing-specific validation rules
- swap proposal rules
- handoff and handoff review tables
- RLS policies for the new tables and flows

Important limitation:

The current app tracks handoffs and confirmations, but there is not yet a hardened server-side finalization path that atomically:

- transfers plant ownership
- closes the related listing
- marks any related records as complete in one authoritative operation

That should be implemented as a database function / RPC or trigger-backed workflow rather than relying on client orchestration.

### Tests

Current automated coverage is still lightweight.

Present:

- unit tests for plant form and listing form helpers
- smoke tests for key files and listing-detail action text

Missing:

- service-layer tests for Supabase query behavior
- interaction tests for new screens
- migration or SQL verification tests

---

## 6. Highest-Value Next Steps

These are the best next actions in priority order.

### 1. Harden handoff finalization in the database

Why this matters:
The current UI lets users start and confirm a handoff, but final business state should not depend on the client.

Recommended outcome:

- add a Supabase RPC or SQL function that finalizes a completed handoff
- update plant ownership where appropriate
- close the related listing
- mark any related swap proposal / order / contract state consistently
- enforce participant authorization in SQL

Likely files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- a new migration file under `android_only/db/`
- `react_webiosand/src/api/listingsService.js`

### 2. Build a dedicated exchanges inbox

Why this matters:
Users need a reliable place to return to swap proposals, active handoffs, and completed exchanges.

Recommended outcome:

- one screen for active proposals, accepted swaps, pending handoffs, and completed exchanges
- entry point from tabs or profile
- clear states for action needed vs waiting on other party

Likely files:

- new screen under `react_webiosand/src/screens/`
- `react_webiosand/src/navigation/AppNavigator.js`
- `react_webiosand/src/api/listingsService.js`

### 3. Add browse filters and sort options

Why this matters:
The feed now mixes four listing types, so filtering becomes necessary quickly.

Recommended outcome:

- filter by listing type
- sort by newest / price / soonest sitting dates
- optional plant-care filters later

Likely files:

- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/api/listingsService.js`

### 4. Add automated coverage for the new flows

Why this matters:
The service and screen surface area grew a lot today.

Recommended outcome:

- unit tests for new listing service payload decisions where possible
- smoke tests for new screen presence and key actions already started
- if the team adopts UI testing, cover swap acceptance and handoff confirmation paths

---

## 7. Known Risks And Caveats

### State docs were behind until this update

Older docs in the repo described a sitting-only app. This tracker should now be treated as the most current short-form handoff reference.

### Live Supabase may still contain environmental differences

The migration was reported as run, but this repository does not automatically verify the remote project state. If a future error appears, check the live tables, triggers, and policies first.

### Ownership transfer is the main unfinished integrity gap

This is the biggest remaining engineering risk because it affects correctness, trust, and downstream user state.

---

## 8. Resume Checklist

If a new engineer or AI takes over, use this checklist.

1. Read `work_tracker.md` fully.
2. Confirm `npm test` still passes in `react_webiosand/`.
3. Read `react_webiosand/src/api/listingsService.js` to understand the current service contract.
4. Read `react_webiosand/src/screens/ListingDetailScreen.js` because it is now the central decision point for handoff and swap actions.
5. Decide whether the next task is product-facing UI work or backend integrity work.
6. If backend integrity work, start with a Supabase RPC for handoff finalization.

---

## 9. Short Status Summary

Current state in one paragraph:

PlantBuddy now has a coherent marketplace + care foundation across docs, schema, RLS, migration scripts, and the Expo app. Users can create and browse sitting, gift, sale, and swap listings; propose and review swaps; start and confirm handoffs; and leave handoff reviews. The code is currently test-clean. The most important unfinished work is server-side finalization of completed exchanges so ownership transfer and listing closure become authoritative and atomic.