# PlantBuddy — Project State

_Last updated: 2026-05-17 (docs and handoff refresh)_

---

## Current Phase

**Phase 1 — Core Sitting Flow (in progress)**

Schema (UUID users.id) and RLS policies are written on disk. Supabase dashboard setup still requires: (1) run `sql_build_tables.sql` to drop+recreate schema with UUID user ids if needed, (2) run `rls_policies.sql`. The active app folder is still `react_webiosand/` until the team confirms any rename. Current checkout still needs `react_webiosand/.env` and `npm.cmd install` before running Expo. Next product work: sitter profile setup + application flow.

---

## Build Status by Layer

### Database
- [x] Full schema designed and committed (`android_only/db/sql_build_tables.sql`)
- [x] `users.id` is UUID FK → `auth.users(id)` — matches Supabase Auth `auth.uid()` (session 4 fix)
- [x] `handle_new_user()` trigger auto-creates `public.users` row on Supabase Auth signup
- [x] All enums, constraints, and indexes defined
- [x] Covers: users, roles, plants, listings, applications, contracts, messaging, payments, notifications, reviews, moderation, audit log
- [ ] **PENDING: drop old schema + re-run `sql_build_tables.sql` in Supabase dashboard** (old tables have BIGINT user ids — causes `bigint = uuid` operator error)
- [ ] Seed data file (`002_seed_dev.sql`) not committed

### Backend — Supabase
- [x] **Switched from Java/Tomcat to Supabase** (managed PostgreSQL + Auth + PostgREST + Realtime)
- [x] Auth handled by Supabase Auth (JWT issued and refreshed automatically)
- [x] Plants table; PostgREST auto-exposes CRUD
- [x] **RLS policies written for all 23 tables** (`android_only/db/rls_policies.sql`) — `refresh_tokens` section removed (session 4 fix)
- [x] `plant_listings`, `listing_applications`, `contracts` secured by RLS and accessible via PostgREST
- [ ] `react_webiosand/.env` is not present in this checkout; create it locally with Supabase URL + anon key
- [ ] **PENDING: run `rls_policies.sql` in Supabase dashboard** (after re-running schema above)

### Expo Frontend (`react_webiosand/`) — Android + iOS + Web
- [x] Session management (AsyncStorage)
- [x] Login screen
- [x] Register screen
- [x] Plants list screen — with "Find sitter" button per plant card
- [x] Add/edit plant screen
- [x] Auth-gated navigation
- [x] **Tab navigation** — My Plants tab + Browse tab (Stage 1)
- [x] **ListingsScreen** — feed of open SITTING_REQUEST listings (Stage 1)
- [x] **ListingDetailScreen** — full plant + listing info, "Apply to Sit" stub (Stage 1)
- [x] **PostListingScreen** — create sitting request, plant picker, date validation (Stage 1)
- [x] **listingsService.js** — Supabase queries for listings CRUD (Stage 1)
- [x] **supabase.js** — Supabase client with AsyncStorage session persistence (Stage 1)
- [x] **LoginScreen** — migrated to `supabase.auth.signInWithPassword` (session 3)
- [x] **RegisterScreen** — migrated to `supabase.auth.signUp` with username/display_name in metadata (session 3)
- [x] **SessionManager** — replaced with thin Supabase Auth wrapper (session 3)
- [x] **apiService.js** — all plants CRUD now uses `supabase.from('plants')` (session 3)
- [x] **PlantsScreen** — updated to consume direct Supabase response (no `.data.data` wrapper) (session 3)
- [x] **AddEditPlantScreen** — field names updated to match schema snake_case columns (session 3)
- [ ] `.env` credentials are not present in this checkout; create `react_webiosand/.env` locally with `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `npm.cmd install` run after adding `@supabase/supabase-js` + `@react-navigation/bottom-tabs`
- [x] Node unit tests added for plant and listing form helpers
- [x] Node smoke tests added for app structure, Supabase env wiring, and schema/RLS files
- [x] **Stage 2a: owner_profiles auto-creation** — `handle_new_user()` trigger now also inserts into `owner_profiles`; every signup gets owner mode immediately
- [ ] **Stage 2: SitterProfileScreen** — activate sitter mode; set bio, daily rate, availability
- [ ] **Stage 2: Application flow** — apply to sit (ApplyScreen), owner inbox (ApplicationsScreen), accept
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

## Build Order (Agreed)

1. **Listings** — `POST/GET /api/listings` (sitting request type only); Post Listing screen in Expo; public listings feed
2. **Sitter profile setup** — activate sitter mode; set availability and daily rate
3. **Browse + Apply** — sitters browse open listings; apply with message and proposed dates
4. **Owner inbox + Accept** — owners review applications; accept one
5. **Contracts** — auto-generate from accepted application; dual-confirm screen
6. **Messaging** — chat attached to a listing or contract
7. **Reviews** — post-contract review flow (owner reviews sitter)
8. **Push notifications** — FCM integration (Android/iOS); web fallback
9. **Image uploads** — cloud storage (S3/GCS); replace URL stubs
10. **Payments** — Stripe integration; ledger posting
11. **Donation + Swap listing types** — same UI pattern as sitting request, minor variations
12. **Store owner + Sale listings** — admin approval, store profile, purchase flow

---

## Open Questions

| # | Question | Context |
|---|---|---|
| 1 | ~~Where is the backend source?~~ | **Resolved** — backend is Supabase; no custom server source. |
| 2 | `.env` credentials filled in? | Not present in this checkout. Create `react_webiosand/.env` locally with the real Supabase project URL and anon key. |
| 3 | RLS policies applied in Supabase dashboard? | Written in `android_only/db/rls_policies.sql`. Must be run in the Supabase SQL editor before the app goes live. |
| 4 | EAS Build or bare workflow? | `app.json` uses managed Expo config. Bare workflow needed for some native modules. Has `npx expo prebuild` been run? |
| 5 | Do swaps and donations have an agreed MVP scope? | Schema supports both fully. In scope for initial launch or post-launch? |
| 6 | Is the sitter rating algorithm defined? | Schema stores `rating_average` and `rating_count` on `sitter_profiles`. Trigger or application code on review submission? |
| 7 | What does "negotiated payment" mean for sitting requests? | Schema supports `agreed_price` on contract and `proposed_price` on application. In-app messaging or structured counter-offer UI? |
| 8 | Target app stores? | Google Play + Apple App Store assumed. Timeline or account setup done? |

---

## Current Documentation Refresh (2026-05-17)

- Kept `react_webiosand/` as the active app folder after the frontend rename was paused for team discussion
- Added root `.gitignore` coverage for generated/local files and the leftover untracked `frontend/` folder
- Added and linked `docs/risk-and-best-practices-guide.md`
- Added and linked `docs/ai-opportunities.md`
- Updated setup, testing, architecture, security, roadmap, and handoff docs to match current repo state
- Confirmed `npm.cmd test` passes from `react_webiosand/` with 16 tests passing
- Confirmed `react_webiosand/.env` and `react_webiosand/node_modules` are not present in this checkout, so full Expo runtime setup is still pending

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

## Last Session (2026-05-16, session 3)

- Created `react_webiosand/.env` template; added `.env` to `.gitignore`
- Migrated `SessionManager` → thin Supabase Auth wrapper (no more manual AsyncStorage token juggling)
- Migrated `LoginScreen` → `supabase.auth.signInWithPassword`
- Migrated `RegisterScreen` → `supabase.auth.signUp` (username + display_name stored in auth metadata)
- Replaced `apiService.js` — all plants CRUD now uses `supabase.from('plants')` directly
- Updated `PlantsScreen` and `AddEditPlantScreen` — response shape and field names aligned to schema snake_case
- Wrote `android_only/db/rls_policies.sql` — RLS policies for all 23 tables (run in Supabase SQL editor)
- **Remaining before running the app:** fill `.env` credentials → `npm.cmd install` → apply RLS SQL in Supabase dashboard
