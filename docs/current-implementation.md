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
- `react_webiosand/src/storage/SessionManager.js`
- `react_webiosand/src/lib/supabase.js`

Current behavior:

- Register uses `supabase.auth.signUp`.
- Login uses `supabase.auth.signInWithPassword`.
- Session is persisted through Supabase Auth using AsyncStorage.
- Navigation starts on either Login or Main depending on current session.

### Plant Management

Files:

- `react_webiosand/src/screens/PlantsScreen.js`
- `react_webiosand/src/screens/AddEditPlantScreen.js`
- `react_webiosand/src/api/apiService.js`

Current behavior:

- Logged-in users can see their active plants.
- Users can create plant profiles.
- Users can edit plant profiles.
- Delete is implemented as a soft delete by setting `is_active = false` and `archived_at`.
- Plant data is read/written directly through the `plants` table in Supabase.

Implemented plant fields include:

- name
- species
- description
- location notes
- size description
- health status
- light requirements
- humidity requirements
- watering frequency
- special instructions

### Listings

Files:

- `react_webiosand/src/screens/PostListingScreen.js`
- `react_webiosand/src/screens/ListingsScreen.js`
- `react_webiosand/src/screens/ListingDetailScreen.js`
- `react_webiosand/src/api/listingsService.js`

Current behavior:

- Owners can create a `SITTING_REQUEST` listing for one of their plants.
- The listing is inserted into `plant_listings` with status `OPEN`.
- Users can browse open sitting requests.
- Users can view listing detail, including plant care information.
- `Apply to Sit` is currently a placeholder alert.

### Navigation

File:

- `react_webiosand/src/navigation/AppNavigator.js`

Current navigation:

- Auth stack:
  - Login
  - Register
  - Main
- Main tabs:
  - My Plants
  - Browse
- My Plants stack:
  - Plants list
  - Add/edit plant
  - Post sitting request
- Browse stack:
  - Listings feed
  - Listing detail

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

- Sitter profile setup.
- Sitter availability screen.
- Application form.
- Owner application inbox.
- Accept/decline application.
- Contract screens.
- Messaging.
- Notifications UI.
- Reviews.
- Image upload.
- Donation listings.
- Swap listings.
- Store owner and sale listings.
- Payments.
- Admin/moderation UI.

Project tooling currently present:

- Node unit tests for plant and listing form logic.
- Node smoke tests for key app files, Supabase wiring, and schema/RLS files.

Project tooling still missing:

- CI.
- Supabase migrations folder.
- Seed data file.
- Local Supabase development setup.
- Production build/deployment instructions.

## Local Checkout Caveats

At the time this documentation was written:

- `react_webiosand/node_modules` was not installed.
- `react_webiosand/.env` was not present in this checkout.
- Root `app/`, `build/`, `.gradle/`, and `.idea/` look like generated or IDE/build output.
- Root `PlantBuddy/` contains only a nested `.git` folder and appears accidental or unused.
