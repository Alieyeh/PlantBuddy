# PlantBuddy — Project State

_Last updated: 2026-06-01 (plant age/life-stage dropdown and Supabase migration)_

---

## Current Phase

**Phase 2 — Marketplace + Care Foundation (listing modes, exchange RPC, and inbox live in app)**

The app is no longer sitting-only. The current product supports a hybrid model built around `SITTING_REQUEST`, `GIFT`, `SALE`, and `SWAP` listings. Users can browse those listing types in-app with search, listing-type filters, and sorting; owners can review sitting applicants; users can propose swaps; owners can accept or decline swap proposals; participants can confirm listing handoffs through a backend RPC; participants can leave handoff reviews; and users now have an `Exchanges` inbox. Recent UI work added a designed Add/Edit Plant form, optional plant age/life-stage choices, a more visual listing detail page, a raised bottom tab bar, and stronger shared text-input spellcheck/autocomplete defaults. The next highest-value step is applying or confirming the 2026-05-19, 2026-05-20, 2026-05-23, and 2026-06-01 migrations in the live Supabase project so the deployed backend matches the repo.

---

## Build Status by Layer

### Database
- [x] Full schema designed and committed (`android_only/db/sql_build_tables.sql`)
- [x] `users.id` is UUID FK → `auth.users(id)` — matches Supabase Auth `auth.uid()` (session 4 fix)
- [x] `handle_new_user()` trigger auto-creates `public.users` row on Supabase Auth signup
- [x] `handle_new_user()` also creates `owner_profiles` row on signup
- [x] All enums, constraints, and indexes defined
- [x] Covers: users, roles, plants, listings, applications, swaps, handoffs, contracts, messaging, payments, notifications, reviews, moderation, audit log
- [x] Added marketplace alignment migration: `android_only/db/2026_05_19_marketplace_alignment.sql`
- [x] Added security hardening migration: `android_only/db/2026_05_20_security_rls_hardening.sql`
- [x] Added watering frequency unit migration: `android_only/db/2026_05_23_watering_frequency_unit.sql`
- [x] Added plant age/life-stage migration: `android_only/db/2026_06_01_plant_age_description.sql`
- [x] Added `listing_handoffs` and `listing_handoff_reviews`
- [x] Listing type vocabulary aligned to `GIFT` instead of `DONATION`
- [x] Listing validation rules tightened by listing type
- [x] Added `confirm_listing_handoff` RPC for atomic handoff confirmation and ownership transfer
- [ ] Live Supabase should be checked for `2026_05_19_marketplace_alignment.sql`, `2026_05_20_security_rls_hardening.sql`, `2026_05_23_watering_frequency_unit.sql`, and `2026_06_01_plant_age_description.sql`; re-run or verify if behavior contradicts the repo
- [ ] Seed data file (`002_seed_dev.sql`) not committed

### Backend — Supabase
- [x] **Switched from Java/Tomcat to Supabase** (managed PostgreSQL + Auth + PostgREST + Realtime)
- [x] Auth handled by Supabase Auth (JWT issued and refreshed automatically)
- [x] Plants table; PostgREST auto-exposes CRUD
- [x] **RLS policies written for all 23 tables** (`android_only/db/rls_policies.sql`) — `refresh_tokens` section removed (session 4 fix)
- [x] `plant_listings`, `listing_applications`, `swap_proposals`, `listing_handoffs`, `listing_handoff_reviews`, and `contracts` secured by RLS and accessible via PostgREST
- [ ] `react_webiosand/.env` is not present in this checkout; create it locally with Supabase URL + anon key
- [ ] Live Supabase still needs migrations verified so `confirm_listing_handoff`, hardened RLS policies, `plants.watering_frequency_unit`, and `plants.age_description` exist remotely

### Expo Frontend (`react_webiosand/`) — Android + iOS + Web
- [x] Session management (AsyncStorage)
- [x] Login screen
- [x] Register screen
- [x] Plants list screen — with "Find sitter" button per plant card
- [x] Add/edit plant screen with designed hero, grouped sections, optional age/life-stage dropdown, care preview tiles, and watering frequency units
- [x] Auth-gated navigation
- [x] **Tab navigation** - raised bottom tabs for My Plants, Browse, and Exchanges
- [x] **ListingsScreen** — feed of all open marketplace and sitting listings
- [x] **ListingsScreen browse controls** — text search, listing-type filters, newest/sitting-date/price sorting
- [x] **ListingDetailScreen** — supports sitting, gift, sale, and swap actions
- [x] **PostListingScreen** — create sitting request, plant picker, date validation (Stage 1)
- [x] **listingsService.js** — Supabase queries for listings, applications, swaps, handoffs, and handoff reviews
- [x] **supabase.js** — Supabase client with AsyncStorage session persistence (Stage 1)
- [x] **LoginScreen** — migrated to `supabase.auth.signInWithPassword` (session 3)
- [x] **RegisterScreen** — migrated to `supabase.auth.signUp` with username/display_name in metadata (session 3)
- [x] **SessionManager** — replaced with thin Supabase Auth wrapper (session 3)
- [x] **apiService.js** — all plants CRUD now uses `supabase.from('plants')` (session 3)
- [x] **PlantsScreen** — updated to consume direct Supabase response (no `.data.data` wrapper) (session 3)
- [x] **AddEditPlantScreen** — field names updated to match schema snake_case columns (session 3)
- [x] Local `.env` exists in this working copy; keep it uncommitted and recreate it manually in fresh checkouts
- [x] `react_webiosand/node_modules` exists in this working copy
- [x] Node unit tests added for plant form, listing form, config, listing domain, browse, and exchange inbox helpers
- [x] Node smoke tests added for app structure, Supabase env wiring, browse wiring, exchange wiring, and schema/RLS files
- [x] **Stage 2a: owner_profiles auto-creation** — `handle_new_user()` trigger also inserts into `owner_profiles`; every signup gets owner mode immediately
- [x] **Stage 2b: ProfileSetupScreen** — post-register prompt; display name + sitter opt-in; writes sitter_profiles if toggled on; skippable
- [x] **Stage 2c: ApplyScreen** — sitter applies to a listing with message + proposed dates; duplicate guard on 23505
- [x] **Stage 2c: ApplicationsScreen** — owner views all applicants per listing; Accept / Decline with confirmation
- [x] **Stage 2c: listingsService** — `applyToListing`, `getApplicationsForListing`, `getMyApplications`, `updateApplicationStatus`
- [x] **Stage 2c: PlantsScreen** — plant cards show "Applicants" button when an open listing exists; "Find sitter" when none
- [x] **Design system** — `theme.js` (C/T/S/shared tokens), Fraunces + Bricolage Grotesque fonts, all 10 screens restyled
- [x] Marketplace listing creation for `GIFT` and peer `SALE`
- [x] `SwapProposalScreen` — user can offer one of their plants on a swap listing
- [x] `SwapProposalsScreen` — owner can review and accept/decline incoming swap proposals
- [x] Listing handoff start / confirm flow implemented in listing detail
- [x] `HandoffReviewScreen` — participants can leave a review after a completed handoff
- [x] `ExchangesScreen` — tab inbox for active proposals, pending handoffs, and completed exchanges
- [x] Shared text-input props request spellcheck, autocorrect, autocomplete, and explicit text/search input modes for user-authored fields
- [ ] Contract screens (Stage 3)
- [ ] Messaging (Stage 4)
- [ ] Notifications

### Native Android (`android_only/`) — Reference Build
- [x] Session management (EncryptedSharedPreferences, AES256-GCM)
- [x] Login activity
- [x] Register activity
- [x] Plants list activity (RecyclerView + ListAdapter)
- [x] Add/edit plant activity
- [x] MVVM wired: ViewModel + LiveData + Repository + Retrofit
- [ ] Same gaps as Expo frontend — no listings, applications, or contracts

---

## Decisions Made

| Date | Decision | Reason |
|---|---|---|
| — | Expo / React Native chosen as primary cross-platform frontend | Single codebase targets Android, iOS, and web; reduces maintenance surface |
| — | Native Android build kept as reference implementation | Demonstrates MVVM pattern cleanly; not extended in parallel with Expo going forward |
| — | PostgreSQL schema fully designed before backend is built | Schema is the source of truth for business rules; constraints enforced at DB level, not just app layer |
| — | Business rules enforced via CHECK constraints in schema | Prevents invalid state even if application layer has bugs |
| — | Listings, applications, contracts modeled as separate tables (not embedded) | Supports full lifecycle tracking, audit history, and dispute resolution |
| — | Payment ledger is append-only (no amount mutations) | Balance always derivable from history; no data loss on disputes |
| 2026-05-16 | **Backend switched from Java/Tomcat to Supabase** | Eliminates server ops; Auth, PostgREST API, Realtime, and Storage all managed; RLS replaces application-layer RBAC |
| 2026-05-16 | Axios replaced by `@supabase/supabase-js` SDK in Expo frontend | SDK handles auth session, token refresh, and typed DB queries natively |
| 2026-05-16 | Sitting request listing type to be built first | It is the core product interaction; donation/swap/sale are secondary |
| 2026-05-16 | Image uploads deferred (stub with URLs) | Supabase Storage ready but not blocking core flow |
| 2026-05-16 | Payments deferred until sitting flow works end-to-end | High complexity (Stripe), low day-1 value; add after core loop is validated |
| 2026-05-16 | Store owner / sale listing type deferred | Requires admin approval workflow; entirely separate user type |
| 2026-05-17 | Folder rename paused | `react_webiosand/` remains active until the team agrees on a rename; leftover `frontend/` folder is ignored locally |

---

## Build Order (Updated)

1. **Marketplace alignment** — completed across docs, schema, RLS, migration, and Expo app for sitting / gift / sale / swap
2. **Live Supabase rollout** — apply the updated 2026-05-19 migration so the repo and remote DB match
3. **Exchanges inbox polish** — action-needed indicators, richer participant context, better section states
4. **Richer discovery** — saved searches, favorites, plant-care filters, server-side search if listing volume grows
5. **Contracts** — if sitting contracts remain in scope as a distinct lifecycle beyond handoffs
6. **Messaging** — conversation flow attached to listings or exchanges
7. **Push notifications** — proposal accepted, handoff awaiting confirmation, review reminders
8. **Image uploads** — richer plant/listing media
9. **Payments** — only after server-side exchange finalization is authoritative

---

## Open Questions

| # | Question | Context |
|---|---|---|
| 1 | ~~Where is the backend source?~~ | **Resolved** — backend is Supabase; no custom server source. |
| 2 | `.env` credentials filled in? | Not present in this checkout. Create `react_webiosand/.env` locally with the real Supabase project URL and anon key. |
| 3 | Was the updated 2026-05-19 migration re-applied after the `confirm_listing_handoff` RPC was added? | The repo now expects that function to exist remotely. Re-run the updated SQL in Supabase before relying on exchange confirmation in production. |
| 4 | EAS Build or bare workflow? | `app.json` uses managed Expo config. Bare workflow needed for some native modules. Has `npx expo prebuild` been run? |
| 5 | Do swaps and gifts stay in MVP, or do they remain soft-launched behind limited UX polish? | Backend and core app flows now support both, and the inbox plus basic browse filters exist; notifications, trust hardening, and rollout polish are still pending. |
| 6 | Is the sitter rating algorithm defined? | Schema stores `rating_average` and `rating_count` on `sitter_profiles`. Trigger or application code on review submission? |
| 7 | What does "negotiated payment" mean for sitting requests? | Schema supports `agreed_price` on contract and `proposed_price` on application. In-app messaging or structured counter-offer UI? |
| 8 | Target app stores? | Google Play + Apple App Store assumed. Timeline or account setup done? |

---

## Current Documentation Refresh (2026-05-19)

- Added `work_tracker.md` as the fast handoff document for future engineers / AI sessions
- Refreshed state to reflect marketplace, swap, handoff RPC, and inbox work completed on 2026-05-19
- Confirmed `npm test` passes from `react_webiosand/` with 19 tests passing
- At that point, tests included 14 unit tests and 5 smoke tests. This has since expanded; see the 2026-05-20 refresh below.

## Current Documentation Refresh (2026-05-20)

- Added Browse search, listing-type filters, and sort options to `ListingsScreen`
- Added `src/utils/browseListings.js` for testable client-side search/filter/sort logic
- Added unit tests for Browse filtering and sorting
- Updated smoke tests to verify Browse wiring
- Confirmed `npm.cmd test` passes from `react_webiosand/` with 42 total tests passing: 34 unit, 1 integration, and 7 smoke

## Security/RLS Refresh (2026-05-20)

- Added `android_only/db/2026_05_20_security_rls_hardening.sql`
- Hardened listing insert/update RLS so listings must point at active plants owned by the authenticated user
- Hardened application insert/update RLS so sitting applicants need sitter profiles, cannot apply to their own listings, and new applications start as pending
- Hardened swap proposal insert RLS so proposers can only offer active plants they own on open swap listings owned by someone else
- Updated static smoke tests for these SQL expectations
- Confirmed `npm.cmd test` passes from `react_webiosand/` with 49 total tests passing: 38 unit, 1 integration, and 10 smoke

## Last Session (2026-06-01)

- Added an optional plant age/life-stage dropdown to `AddEditPlantScreen`
- Reused the existing `plants.age_description` database concept and constrained it to broad dropdown values suitable for most plants
- Added `android_only/db/2026_06_01_plant_age_description.sql` for existing Supabase databases
- Updated plant payload validation, Supabase selects, Browse chips, and listing detail plant care stats for age/life-stage
- Updated unit and smoke tests plus docs to reflect the new field

## Last Session (2026-05-23)

- Replaced fragile emoji tab icons in `AppNavigator.js` with shape-based My Plants, Browse, and Exchanges icons
- Restyled the authenticated bottom tab bar as a raised rounded navigation surface
- Added a designed Add/Edit Plant form hero, grouped form cards, and live care preview tiles
- Strengthened `textInputProps.js` with autocomplete and explicit text/search input modes alongside spellcheck/autocorrect
- Updated docs and smoke/unit tests to reflect the navigation, Add Plant UI, and text-input behavior
- Confirmed `npm.cmd test` passes from `react_webiosand/`
## Last Session (2026-05-19)

- Reframed the product around a plant marketplace + care network and rewrote `PRODUCT.md` and `design.md`
- Updated database source files to support `GIFT`, peer `SALE`, stricter listing rules, `listing_handoffs`, and `listing_handoff_reviews`
- Added migration `android_only/db/2026_05_19_marketplace_alignment.sql`
- Updated frontend listing creation flow to support sitting, gift, and sale modes
- Extended `listingsService.js` with marketplace, swap, handoff, and review operations
- Updated `ListingsScreen` to show all open listing types
- Updated `ListingDetailScreen` to drive sitting, swap, gift, and sale actions from one place
- Added `SwapProposalScreen`, `SwapProposalsScreen`, and `HandoffReviewScreen`
- Wired new marketplace routes into `AppNavigator.js`
- Added `confirm_listing_handoff` RPC to schema source and migration for atomic exchange finalization
- Added `ExchangesScreen` and wired it into the tab navigator
- Updated `listingsService.js` and `ListingDetailScreen` to use RPC-backed handoff confirmation
- Validated current repo state with `npm test` passing from `react_webiosand/`

## Last Session (2026-05-16, session 1)

- Wrote `PRODUCT.md` — full product document covering problem, user flows, core concepts, architecture, feature set, DB design, and setup
- Updated `PRODUCT.md` to reflect cross-platform scope (Android + iOS + web via Expo)
- Analyzed current build state across all three layers (DB, backend, Expo, Android)
- Agreed on build order: sitting request listing flow first, all other listing types and payments deferred
- Created `tech-stack.md` with pinned versions from `package.json` and source-derived versions for Android/backend
- Created this file (`_state.md`)

## Last Session (2026-05-16, session 2)

- Switched backend from Java/Tomcat to Supabase — updated `tech-stack.md`, `PRODUCT.md`, and `_state.md`
- Built Stage 1: Supabase client setup, listings API layer, `ListingsScreen` (feed), `PostListingScreen` (create sitting request), updated `AppNavigator` with tab navigation (My Plants / Browse), updated `PlantsScreen` plant cards to link to post listing flow

## Last Session (2026-05-16, session 4)

- Diagnosed `bigint = uuid` operator error: old Supabase schema had BIGINT user ids; new schema (UUID) hadn't been applied yet
- Fixed `rls_policies.sql`: removed `refresh_tokens` table references (table was removed from schema in session 3 rewrite)
- Confirmed `sql_build_tables.sql` on disk is correct — `users.id UUID PRIMARY KEY REFERENCES auth.users(id)`, all user FK columns are UUID, `handle_new_user()` trigger included
- Provided drop-all SQL to clear old schema from Supabase before re-running the fixed schema
- **Pending user action:** run drop SQL → run `sql_build_tables.sql` → run `rls_policies.sql` in Supabase dashboard

## Last Session (2026-05-16, session 5)

- Built **Stage 2b**: `ProfileSetupScreen` — post-register one-time prompt with display name field and "I want to sit plants" toggle; writes `owner_profiles.display_name` and optionally creates `sitter_profiles`; has "Skip for now" escape hatch
- Wired `ProfileSetup` into root stack navigator; `RegisterScreen` now navigates → `ProfileSetup` instead of alerting
- Built **Stage 2c**: `ApplyScreen` — sitter submits application with message + proposed dates (pre-filled from listing); duplicate application guard (Postgres 23505)
- Built **Stage 2c**: `ApplicationsScreen` — owner sees all applicants for a listing; Accept/Decline with confirmation dialogs; live optimistic status update
- Extended `listingsService` with `applyToListing`, `getApplicationsForListing`, `getMyApplications`, `updateApplicationStatus`
- Updated `PlantsScreen`: plant cards dynamically show "Applicants" (blue) when an open listing exists, "Find sitter" (green) when none
- `Applications` screen wired into `PlantsStack`; `Apply` screen wired into `BrowseStack`

## Last Session (2026-05-16, session 3)

- Created `react_webiosand/.env` template; added `.env` to `.gitignore`
- Migrated `SessionManager` → thin Supabase Auth wrapper (no more manual AsyncStorage token juggling)
- Migrated `LoginScreen` → `supabase.auth.signInWithPassword`
- Migrated `RegisterScreen` → `supabase.auth.signUp` (username + display_name stored in auth metadata)
- Replaced `apiService.js` — all plants CRUD now uses `supabase.from('plants')` directly
- Updated `PlantsScreen` and `AddEditPlantScreen` — response shape and field names aligned to schema snake_case
- Wrote `android_only/db/rls_policies.sql` — RLS policies for all 23 tables (run in Supabase SQL editor)
- **Remaining before running the app:** fill `.env` credentials → `npm.cmd install` → apply RLS SQL in Supabase dashboard
