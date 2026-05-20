# PlantBuddy Work Tracker

Date: 2026.5.19
Done by: EZ
Last updated: 2026-05-20
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
- browse feed has text search across listing and plant fields
- browse feed has listing-type filters for sitting, gifts, sales, and swaps
- browse feed has sort options for newest, soonest sitting date, price low-to-high, and price high-to-low
- listing cards show type-aware summary and badges
- listing detail screen now branches by listing type and has a more polished plant-detail hero with lightweight decorative plant graphics
- non-owners can start gift or sale handoff flow from detail
- owners can view swap proposals on swap listings
- non-owners can propose swaps from detail
- handoff status, participant confirmations, and review entry points now appear on detail

Files:

- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/screens/ListingDetailScreen.js`
- `react_webiosand/src/utils/browseListings.js`

### User text input polish

Completed:

- natural-language text boxes now share spellcheck and keyboard suggestion defaults
- machine-readable fields such as dates, currency, email, password, and numeric values explicitly disable spelling behavior
- Browse search uses suggestion/spellcheck defaults while keeping lowercase search entry

Files:

- `react_webiosand/src/utils/textInputProps.js`
- `react_webiosand/src/screens/AddEditPlantScreen.js`
- `react_webiosand/src/screens/PostListingScreen.js`
- `react_webiosand/src/screens/ApplyScreen.js`
- `react_webiosand/src/screens/SwapProposalScreen.js`
- `react_webiosand/src/screens/HandoffReviewScreen.js`
- `react_webiosand/src/screens/ProfileSetupScreen.js`
- `react_webiosand/src/screens/RegisterScreen.js`
- `react_webiosand/src/screens/ListingsScreen.js`

### Auth flow clarification

Completed:

- login now checks that Supabase returned a real session before resetting into the app
- registration now handles Supabase email-confirmation mode by telling users to confirm their email and returning them to Login when no session is returned
- machine-readable login/register fields explicitly disable spelling behavior

Files:

- `react_webiosand/src/screens/LoginScreen.js`
- `react_webiosand/src/screens/RegisterScreen.js`
- `react_webiosand/test/smoke/projectStructure.test.cjs`

### Swap proposal and handoff review flows

Completed:

- user can propose a swap with one of their own plants
- owner can review incoming swap proposals
- owner can accept or decline a swap proposal
- accepting a swap proposal starts a listing handoff record
- participants now confirm handoff completion through a backend RPC instead of a raw client-side row update
- participants can leave a handoff review after completion
- users now have an `Exchanges` inbox tab for active proposals, pending handoffs, and completed exchanges

Files:

- `react_webiosand/src/screens/SwapProposalScreen.js`
- `react_webiosand/src/screens/SwapProposalsScreen.js`
- `react_webiosand/src/screens/HandoffReviewScreen.js`
- `react_webiosand/src/screens/ExchangesScreen.js`
- `react_webiosand/src/api/listingsService.js`
- `react_webiosand/src/navigation/AppNavigator.js`

### Backend handoff finalization

Completed:

- added `confirm_listing_handoff` RPC in SQL source and migration
- handoff confirmation now performs participant confirmation and finalization in one backend operation
- completed `SALE` and `GIFT` handoffs transfer plant ownership to the recipient
- completed `SWAP` handoffs transfer both plants to their new owners
- completed handoffs close the listing and settle swap proposal state server-side
- listing visibility was widened so handoff participants can still access completed exchange listings

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_19_marketplace_alignment.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`
- `react_webiosand/src/api/listingsService.js`

### Security and RLS hardening

Completed in source SQL and migration:

- listing insert/update policies now verify the listing plant is active, unarchived, and owned by the authenticated user
- store-backed listing writes require an approved store owner profile
- sitting applications require a sitter profile and cannot target a listing owned by the applicant
- new applications must start as `PENDING`
- applicants can only update their own application into `WITHDRAWN`; owners still handle application status decisions
- swap proposals must target open swap listings owned by someone else and offer an active plant owned by the proposer

Files:

- `android_only/db/rls_policies.sql`
- `android_only/db/sql_build_tables.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`

### Documentation and product direction

The product and design docs were rewritten to match the broader marketplace direction.

Updated:

- `PRODUCT.md`
- `design.md`
- selected technical docs such as `tech-stack.md`, `android_only/README.md`, and `docs/database-and-supabase.md`

---

## 3. Verified Working State

The latest verified command was run from:

- `C:\PlantBuddy\react_webiosand`

Command:

```powershell
npm test
```

Latest result after Security/RLS hardening:

- unit tests passed: 38/38
- integration tests passed: 1/1
- smoke tests passed: 9/9
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

If the next task is specifically about exchange finalization, also read:

8. `react_webiosand/src/screens/ExchangesScreen.js`
9. `android_only/db/sql_build_tables.sql`

---

## 5. Current Reality By Layer

### Frontend

Implemented and usable now:

- auth flow
- plant CRUD
- listing creation for sitting, gift, and sale
- browse feed for all open listing types with search, type filters, and sorting
- spellcheck and writing suggestions for user-authored text boxes
- listing detail with type-specific actions
- prettier plant detail/listing detail hero with lightweight plant graphics
- sitting application flow and owner applicant review
- swap proposal create/review/accept-decline flow
- exchanges inbox for proposals, pending handoffs, and completed exchanges
- RPC-backed handoff confirmation flow
- handoff review submission flow

Still thin or missing:

- no saved searches or favorites yet
- browse filtering is currently client-side and should move closer to the database if the dataset grows
- no push notifications for proposal / handoff updates
- no image upload flow for listings or plants beyond existing structure
- no dedicated notification or badge counts for exchange state changes yet

### Database / Supabase

Implemented in schema and migration source:

- marketplace listing types
- listing-specific validation rules
- swap proposal rules
- handoff and handoff review tables
- RLS policies for the new tables and flows
- `confirm_listing_handoff` RPC for atomic exchange confirmation and finalization

Important limitation:

The repo now contains the server-side finalization path, but the live Supabase project must have the updated migration applied before the frontend can rely on it safely. Until that SQL is run remotely, the app code and the deployed database may be out of sync.

### Tests

Current automated coverage is still lightweight.

Present:

- unit tests for plant form, listing form, listing domain, Supabase config, browse filters/sorting, text-input defaults, and exchange inbox helpers
- integration test for composing exchange inbox rows into proposals, pending handoffs, and completed exchanges
- smoke tests for key files, marketplace flow wiring, browse wiring, exchange inbox wiring, and schema/RLS files

Missing:

- service-layer tests for Supabase query behavior
- interaction tests for new screens
- migration or SQL verification tests

---

## 6. Highest-Value Next Steps

These are the best next actions in priority order.

### 1. Apply the updated migration to live Supabase

Why this matters:
The repo now expects `confirm_listing_handoff` to exist in the database.

Recommended outcome:

- run the updated `android_only/db/2026_05_19_marketplace_alignment.sql` in the Supabase SQL editor
- verify the `confirm_listing_handoff` function exists and executes as `authenticated`
- confirm completed exchanges update plant ownership and listing status remotely

Likely files:

- `android_only/db/2026_05_19_marketplace_alignment.sql`
- live Supabase project

### 2. Continue exchanges inbox polish

Why this matters:
The inbox now has action-needed counts, pull-to-refresh, richer metadata, and review/confirmation highlighting. It can still become a stronger operational surface.

Recommended outcome:

- add notification badges at tab level
- add deeper participant profile previews
- add filter chips for action-needed, proposals, handoffs, and completed exchanges
- add section-level empty states if sections are hidden by filters

Likely files:

- `react_webiosand/src/screens/ExchangesScreen.js`
- `react_webiosand/src/navigation/AppNavigator.js`
- `react_webiosand/src/api/listingsService.js`

### 3. Add saved searches, favorites, and richer browse filters

Why this matters:
The feed now mixes four listing types and basic filtering exists. The next discovery step is making useful searches reusable and adding plant-care-specific filters.

Recommended outcome:

- saved searches
- favorite listings
- optional plant-care filters such as light, watering cadence, size, and distance
- move filtering/search server-side if listing volume grows

Likely files:

- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/api/listingsService.js`
- `react_webiosand/src/utils/browseListings.js`

### 4. Add plant size unit dropdown and unit-aware discovery

Why this matters:
Plant size is currently free text. A separate unit selector such as cm, inches, or meters would make plant profiles easier to compare, validate, and search.

Recommended outcome:

- add a dedicated plant size unit dropdown in `AddEditPlantScreen`
- decide the storage model, for example `size_value` numeric plus `size_unit` enum/text while keeping `size_description` for notes
- reflect the new fields in the database schema and a forward migration
- update plant form validation and payload helpers
- include size value/unit in Browse search and future plant-care filters
- document whether existing `size_description` remains as free-form context

Likely files:

- `react_webiosand/src/screens/AddEditPlantScreen.js`
- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/utils/browseListings.js`
- `react_webiosand/src/utils/plantForm.js`
- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- a future Supabase migration file

### 5. Add anti-spam and text-field threat safeguards

Why this matters:
The app now has many user-authored fields: plant bios, listing descriptions, application messages, swap proposals, reviews, and future chat. These need abuse controls before public use.

Recommended outcome:

- add length limits and consistent validation for user-authored text fields
- add rate limits or cooldowns for listings, applications, swap proposals, reviews, reports, and future messages
- add blocked-word/scam-link checks where appropriate
- add moderation flags for spam, harassment, fraud, threats, unsafe content, and private-info leakage
- consider AI-assisted moderation only after deterministic checks and privacy rules are defined
- store moderation outcomes in `moderation_cases` and keep audit trails for important actions

Likely files:

- `react_webiosand/src/utils/*Form.js`
- `react_webiosand/src/screens/*`
- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- future moderation/RPC migration files
- `docs/ai-opportunities.md`

### 6. Add automated coverage for the new flows

Why this matters:
The service and screen surface area grew a lot today.

Recommended outcome:

- unit tests for new listing service payload decisions where possible
- smoke tests for new screen presence and key actions
- integration tests for additional exchange state shaping as new flows are added
- if the team adopts UI testing, cover swap acceptance and handoff confirmation paths

---

## 7. Known Risks And Caveats

### State docs were behind until this update

Older docs in the repo described a sitting-only app. This tracker should now be treated as the most current short-form handoff reference.

### Live Supabase may still contain environmental differences

The migration was reported as run, but this repository does not automatically verify the remote project state. If a future error appears, check the live tables, triggers, and policies first.

### Live database rollout is now the main integrity gap

The source code is ahead of the deployed backend until the new SQL is applied remotely.

---

## 8. Resume Checklist

If a new engineer or AI takes over, use this checklist.

1. Read `work_tracker.md` fully.
2. Confirm `npm test` still passes in `react_webiosand/`.
3. Confirm the live Supabase project has the updated 2026-05-19 migration, including `confirm_listing_handoff`.
4. Read `react_webiosand/src/api/listingsService.js` to understand the current service contract.
5. Read `react_webiosand/src/screens/ExchangesScreen.js` and `react_webiosand/src/screens/ListingDetailScreen.js` because they are now the main exchange surfaces.
6. Decide whether the next task is backend rollout, inbox polish, richer discovery, or contract flow.

---

## 9. Short Status Summary

Current state in one paragraph:

PlantBuddy now has a coherent marketplace + care foundation across docs, schema, RLS, migration scripts, and the Expo app. Users can create and browse sitting, gift, sale, and swap listings with search, filters, and sorting; propose and review swaps; use an Exchanges inbox; start and confirm handoffs; and leave handoff reviews. The code is currently test-clean. The most important immediate task is applying or confirming the updated migration in live Supabase so the new `confirm_listing_handoff` RPC-backed finalization path is available remotely.
