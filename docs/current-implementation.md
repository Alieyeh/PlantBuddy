# Current Implementation

This document describes what is actually present in the repository right now.

## Current High-Level State

The active app is in `react_webiosand/`. It is an Expo / React Native app that can target web, Android, and iOS.

The backend is Supabase. There is no custom server source in the active architecture. The frontend calls Supabase directly through `@supabase/supabase-js`.

The `android_only/` folder contains an older native Android Java implementation and useful database files. It should be treated as reference/legacy unless the team explicitly decides to revive it.

## Implemented In The Expo App

### Authentication

Files:

- `react_webiosand/src/screens/LoginScreen.js`
- `react_webiosand/src/screens/RegisterScreen.js`
- `react_webiosand/src/screens/ProfileSetupScreen.js`
- `react_webiosand/src/storage/SessionManager.js`
- `react_webiosand/src/lib/supabase.js`

Current behavior:

- Register uses `supabase.auth.signUp`.
- If Supabase email confirmation is enabled, registration tells the user to confirm their email and returns them to Login instead of sending them into authenticated setup without a session.
- If registration returns an authenticated session, users are sent to `ProfileSetupScreen`.
- Profile setup updates `owner_profiles.display_name` and can create/update a `sitter_profiles` row when the user opts into plant sitting.
- Login uses `supabase.auth.signInWithPassword`.
- Login now checks that Supabase returned a session before resetting navigation to the authenticated app.
- Session is persisted through Supabase Auth using AsyncStorage.
- Navigation starts on either Login or Main depending on current session.

### Plant Management

Files:

- `react_webiosand/src/screens/PlantsScreen.js`
- `react_webiosand/src/screens/AddEditPlantScreen.js`
- `react_webiosand/src/api/apiService.js`
- `react_webiosand/src/api/commonPlantCareService.js`
- `react_webiosand/src/utils/plantCareProfiles.js`

Current behavior:

- Logged-in users can see their active plants.
- Users can create plant profiles.
- Users can edit plant profiles.
- The add/edit plant form now uses a designed plant-profile hero, grouped form cards, and care preview tiles for water, light, and humidity.
- The add/edit plant form validates user input against the database shape before saving, including varchar-style text limits, positive whole-number watering frequency, allowed watering units, and the controlled age/life-stage options.
- The add/edit plant form can autofill editable care guidance from `common_plant_care_profiles` using the entered species/common name and, when available, the selected age/life-stage.
- Autofill prefers age-specific rows over generic species rows and asks before replacing care fields the user already typed.
- Delete is implemented as a soft delete by setting `is_active = false` and `archived_at`.
- Plant data is read/written directly through the `plants` table in Supabase.

Implemented plant fields include:

- name
- species
- description
- location notes
- optional age / life stage (`Cutting / propagation`, `Seedling`, `Young plant`, `Mature plant`, or `Established plant`)
- size description
- health status
- light requirements
- humidity requirements
- watering frequency amount and unit (`days`, `weeks`, or `months`)
- special instructions

### Listings

Files:

- `react_webiosand/src/screens/PostListingScreen.js`
- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/screens/ListingDetailScreen.js`
- `react_webiosand/src/screens/ApplyScreen.js`
- `react_webiosand/src/screens/ApplicationsScreen.js`
- `react_webiosand/src/api/listingsService.js`
- `react_webiosand/src/domain/listings.js`
- `react_webiosand/src/utils/browseListings.js`
- `react_webiosand/src/utils/listingForm.js`
- `react_webiosand/src/utils/textInputProps.js`

Current behavior:

- Owners can create `SITTING_REQUEST`, `GIFT`, and `SALE` listings for one of their plants.
- The listing is inserted into `plant_listings` with status `OPEN`.
- Users can browse all open listing modes: `SITTING_REQUEST`, `GIFT`, `SALE`, and `SWAP`.
- Browse reads from `plant_listings` joined to `plants`; it does not show every plant row unless that plant has an open listing.
- Browse supports text search across listing and plant fields.
- Browse supports listing-type filters for all, sitting, gifts, sales, and swaps.
- Browse supports sorting by newest, soonest sitting date, price low-to-high, and price high-to-low.
- Users can view listing detail, including plant care information and a polished plant hero with lightweight decorative graphics.
- `Apply to Sit` opens `ApplyScreen`.
- Users can submit an application with a message and proposed dates.
- Duplicate applications are handled from Postgres error code `23505`.
- Owners can open `ApplicationsScreen` from plant cards that already have an open listing.
- Owners can view applicants and mark applications as `ACCEPTED` or `DECLINED`.
- Users can propose swaps for swap listings.
- Owners can review incoming swap proposals.
- Gift, sale, and accepted swap flows can start listing handoffs.
- Handoff participants can confirm handoff completion and leave reviews.

Architecture notes:

- `src/domain/listings.js` centralizes listing types, statuses, handoff statuses, and listing insert payload construction.
- `src/utils/browseListings.js` contains the pure browse search/filter/sort logic used by `ListingsScreen` and covered by unit tests.
- `src/utils/textInputProps.js` centralizes spellcheck/suggestion behavior for user-authored text boxes.
- `src/config/environment.js` validates required public Supabase environment variables before the app tries to use the Supabase client.

Current application-flow limitations:

- Accepting an application only updates the selected application status.
- Accepting does not yet mark the listing as matched.
- Accepting does not yet decline competing applications.
- Accepting does not yet create a contract.
- The frontend does not yet prevent owners from applying to their own listings.
- The frontend does not yet require a sitter profile before applying.

### Design System

Files:

- `design.md`
- `react_webiosand/src/lib/theme.js`
- `react_webiosand/App.js`

Current behavior:

- Shared color, spacing, typography, shadow, button, input, card, and section-label styles live in `theme.js`.
- App-level font loading uses Fraunces and Bricolage Grotesque through Expo Google Fonts.
- The current Expo screens have been restyled around the shared theme tokens.
- The authenticated bottom navigation uses a raised rounded tab bar with shape-based icons for My Plants, Browse, and Exchanges.
- User-authored text fields now request spellcheck, autocorrect, autocomplete, and text/search input modes where appropriate; dates, currency, email, password, and numeric fields keep spelling behavior disabled.
- Browser-visible spellcheck suggestions still depend on the user's browser and operating-system language/spellcheck settings.
- `design.md` documents the intended visual language and interaction patterns.

### Navigation

File:

- `react_webiosand/src/navigation/AppNavigator.js`

Current navigation:

- Auth stack:
  - Login
  - Register
  - ProfileSetup
  - Main
- Main tabs:
  - My Plants
  - Browse
  - Exchanges
- My Plants stack:
  - Plants list
  - Add/edit plant
  - Post sitting request
  - Applications
- Browse stack:
  - Listings feed
  - Listing detail
  - Apply
- Exchanges stack:
  - Exchanges inbox
  - Listing detail
  - Swap proposals
  - Handoff review
  - Apply

## Implemented In The Database

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`

The schema defines tables for:

- users
- owner profiles
- sitter profiles
- store owner profiles
- plants
- plant photos
- plant care tasks
- common plant care profiles
- plant listings
- listing applications
- swap proposals
- contracts
- contract plants
- store orders
- conversations
- conversation participants
- messages
- message attachments
- notifications
- payment ledger
- sitter availability
- sitter reviews
- moderation cases
- audit log

The schema also defines enums for listing types/statuses, contracts, messages, payments, availability, orders, and moderation.

Important current database behavior:

- `users.id` is a UUID tied to Supabase Auth's `auth.users(id)`.
- `handle_new_user()` is intended to create a public `users` row and an `owner_profiles` row after Supabase Auth signup.
- Non-user entity IDs, such as plants and listings, are still BIGINT identity columns.
- `android_only/db/2026_05_20_security_rls_hardening.sql` adds RLS hardening for listing plant ownership, sitter-only applications, self-application prevention, and swap proposal ownership.
- The source RLS file has also been updated with those rules, but live Supabase still needs the migration applied and manually verified.

## Legacy Native Android Implementation

Folder:

- `android_only/`

Current native Android code includes:

- login/register activities
- plant list activity
- add/edit plant activity
- Java models
- Retrofit API client
- repositories
- view models
- encrypted session manager

Limitations:

- It appears to depend on a custom REST backend API shape.
- The old custom backend is not present in the repo.
- Gradle project files are not committed inside `android_only/`.
- The active backend has moved to Supabase, so the Android code is likely outdated.

## Not Implemented Yet

Frontend missing:

- Sitter availability screen.
- Submitted-applications view for sitters.
- Transactional accept flow that marks a listing matched, declines/expires competing applications, and creates a contract.
- Contract screens.
- Messaging.
- Notifications UI.
- Reviews.
- Image upload.
- Store-owner listing and approval flows.
- Payments.
- Admin/moderation UI.
- Saved searches and favorites.
- Server-side or database-backed browse search for larger datasets.
- Plant size value/unit fields, such as a cm/inch unit dropdown reflected in the database and Browse/search.
- Anti-spam and text-field threat safeguards for listings, applications, swap proposals, reviews, reports, and future messages.

Project tooling currently present:

- Node unit tests for plant forms, listing forms, listing domain helpers, Supabase environment validation, browse filters/sorting, and exchange inbox helpers.
- Node integration test for exchange inbox composition.
- Node smoke tests for key app files, bottom navigation wiring, browse wiring, exchange inbox wiring, text-input defaults, Supabase wiring, schema/RLS files, and static RLS hardening expectations.

Project tooling still missing:

- CI.
- Supabase migrations folder.
- Seed data file.
- Local Supabase development setup.
- Production build/deployment instructions.

## Local Checkout Caveats

At the time this documentation was written:

- `react_webiosand/.env` may not be present in a fresh checkout. If it is missing, the app now shows a clear Supabase configuration screen instead of failing as a blank page.
- Root `app/`, `build/`, `.gradle/`, and `.idea/` look like generated or IDE/build output.
- Root `PlantBuddy/` contains only a nested `.git` folder and appears accidental or unused.
