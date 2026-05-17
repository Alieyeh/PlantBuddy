# Architecture And File Structure

## Active Architecture

PlantBuddy currently uses this shape:

```text
Expo / React Native app
        |
        | @supabase/supabase-js
        v
Supabase
  - Auth
  - PostgREST API over PostgreSQL
  - Row Level Security
  - Storage later
  - Realtime later
        |
        v
PostgreSQL schema
```

There is no active custom backend server in this repo.

## Data Flow

### Login/Register

1. User submits email/password in Expo app.
2. `LoginScreen` or `RegisterScreen` calls Supabase Auth.
3. Supabase Auth returns/persists a session.
4. The app checks session state through `SessionManager`.
5. On signup, the database trigger `handle_new_user()` should create:
   - `public.users`
   - `public.owner_profiles`
6. `RegisterScreen` routes new users to `ProfileSetupScreen`, where they can set a display name and optionally create a sitter profile.

### Plants

1. `PlantsScreen` calls `api.getPlants()`.
2. `apiService.js` gets the current Supabase user.
3. It queries `plants` where `current_owner_user_id = user.id`.
4. Add/edit/delete operations write directly to `plants`.

### Sitting Listings

1. Owner taps `Find sitter` from a plant card.
2. `PostListingScreen` inserts a `SITTING_REQUEST` into `plant_listings`.
3. `ListingsScreen` queries open sitting requests.
4. `ListingDetailScreen` fetches a single listing and joined plant details.
5. `ApplyScreen` inserts into `listing_applications`.
6. `ApplicationsScreen` loads applications for an owner's listing and can update application status to `ACCEPTED` or `DECLINED`.
7. Contract creation after accepting an application is not implemented yet.

### Design System

1. `App.js` loads Fraunces and Bricolage Grotesque fonts.
2. `src/lib/theme.js` exposes shared color, typography, spacing, and reusable style tokens.
3. Screens import theme tokens rather than defining each visual pattern from scratch.
4. `design.md` describes the intended visual language and should guide new screen work.

## Current File Tree

Important files and folders:

```text
C:\PlantBuddy
|
|-- PRODUCT.md
|-- tech-stack.md
|-- _state.md
|-- design.md
|-- docs\
|
|-- react_webiosand\
|   |-- package.json
|   |-- package-lock.json
|   |-- app.json
|   |-- App.js
|   |-- index.js
|   |-- assets\
|   |-- src\
|       |-- api\
|       |   |-- apiService.js
|       |   |-- listingsService.js
|       |-- lib\
|       |   |-- supabase.js
|       |   |-- theme.js
|       |-- navigation\
|       |   |-- AppNavigator.js
|       |-- screens\
|       |   |-- LoginScreen.js
|       |   |-- RegisterScreen.js
|       |   |-- ProfileSetupScreen.js
|       |   |-- PlantsScreen.js
|       |   |-- AddEditPlantScreen.js
|       |   |-- ListingsScreen.js
|       |   |-- ListingDetailScreen.js
|       |   |-- PostListingScreen.js
|       |   |-- ApplyScreen.js
|       |   |-- ApplicationsScreen.js
|       |-- storage\
|       |   |-- SessionManager.js
|       |-- utils\
|       |   |-- plantForm.js
|       |   |-- listingForm.js
|   |-- test\
|       |-- smoke\
|       |-- unit\
|
|-- android_only\
|   |-- README.md
|   |-- db\
|   |   |-- sql_build_tables.sql
|   |   |-- rls_policies.sql
|   |   |-- db_schema_mermaid.png
|   |-- docs\
|   |   |-- ER.jpg
|   |   |-- Tables.jpg
|   |   |-- UML.jpg
|   |-- app\
|       |-- src\main\java\com\plantbuddy\
|           |-- model\
|           |-- network\
|           |-- repository\
|           |-- storage\
|           |-- ui\
|           |-- viewmodel\
|
|-- app\
|-- build\
|-- .gradle\
|-- .idea\
|-- PlantBuddy\
|-- local.properties
```

## Source Folders

### `react_webiosand/`

This is the active app. The name is awkward, but it is the main frontend.

Key files:

- `package.json` - scripts and dependencies.
- `app.json` - Expo configuration.
- `src/lib/supabase.js` - Supabase client.
- `src/lib/theme.js` - shared design tokens and reusable style fragments.
- `src/navigation/AppNavigator.js` - app navigation.
- `src/api/apiService.js` - plant CRUD.
- `src/api/listingsService.js` - listing queries, creation, application submission, and application status updates.
- `src/screens/*` - UI screens.
- `src/utils/*` - shared form validation/payload helpers used by screens and tests.
- `test/` - Node unit and smoke tests.

### `android_only/`

This is legacy/reference native Android code and database material.

Useful parts:

- `db/sql_build_tables.sql`
- `db/rls_policies.sql`
- diagrams in `docs/`

Use caution with:

- Android Java app code, because it expects an older custom REST API.
- `android_only/README.md`, because it still describes the older Java/Tomcat backend direction.

## Generated Or Local Folders

These folders should generally not be edited by hand:

- `.gradle/`
- `.idea/`
- `app/build/`
- `build/`

The root `app/` folder currently contains only build output, not source code.

The root `PlantBuddy/` folder contains only a nested `.git` directory and appears to be accidental or unused.

## Suggested Cleanup Later

Do not delete these without confirming with the team, but the repo would be clearer if later cleanup addressed:

- Decide whether to remove the root `app/` generated output.
- Decide whether to remove or document the nested `PlantBuddy/` folder.
- Consider renaming `react_webiosand/` to something clearer, such as `app/` or `frontend/`, if the team can handle the path change.
