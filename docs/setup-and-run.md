# Setup And Run

This document explains how to get the current Expo/Supabase app running.

## Prerequisites

Install:

- Node.js 18 or newer.
- npm.
- A Supabase project.
- Optional: Android Studio if running on an Android emulator.
- Optional: Expo Go if running on a physical phone.

You do not need to install a custom backend server for the current app.

## 1. Install Frontend Dependencies

From PowerShell:

```powershell
cd C:\PlantBuddy\react_webiosand
npm.cmd install
```

This installs Expo, React Native, React Navigation, Supabase JS, Expo Google Fonts, and related dependencies.

## 2. Create Supabase Environment File

Create:

```text
C:\PlantBuddy\react_webiosand\.env
```

Add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Where to find these:

- Supabase Dashboard
- Project Settings
- API
- Project URL
- anon/public key

Do not put the Supabase service role key in this app. The frontend should only use the anon key.

## 3. Set Up The Supabase Database

In the Supabase SQL editor, run these files in order:

1. `android_only/db/sql_build_tables.sql`
2. `android_only/db/rls_policies.sql`

The schema file creates tables, enum types, indexes, and the `handle_new_user()` trigger.

The RLS file enables Row Level Security and creates access policies.

## 4. Check Auth Settings

In Supabase Auth settings, decide how local development should work:

- If email confirmation is enabled, users must confirm their email before logging in.
- If email confirmation is disabled for local development, test accounts can log in immediately after registration.

This is a Supabase dashboard setting, not a code setting in this repo.

## 5. Run The Web App

```powershell
cd C:\PlantBuddy\react_webiosand
npm.cmd run web
```

Equivalent command:

```powershell
npx expo start --web
```

Expo should open the web app in a browser.

## 6. Run On Android

With Android Studio/emulator configured:

```powershell
cd C:\PlantBuddy\react_webiosand
npm.cmd run android
```

Equivalent command:

```powershell
npx expo start --android
```

## 7. Run The Interactive Expo Launcher

```powershell
cd C:\PlantBuddy\react_webiosand
npm.cmd start
```

From there you can choose web, Android, iOS, or a QR code flow if supported.

## Direct Postgres Connection

The app itself does not need the Postgres password. It connects through Supabase's client API using the URL and anon key.

Use the Postgres password only for tools such as:

- Supabase SQL editor
- pgAdmin
- DBeaver
- `psql`
- migrations from a server/CLI environment

Find connection strings in:

- Supabase Dashboard
- Project
- Connect

If nobody knows the database password, reset it in Supabase Database Settings. Do not commit it to the repo.

## Common Problems

### `node_modules` Missing

Run:

```powershell
cd C:\PlantBuddy\react_webiosand
npm.cmd install
```

### Supabase URL Or Anon Key Missing

Create `react_webiosand/.env` and restart Expo. Expo reads `EXPO_PUBLIC_*` variables at bundling time.

### `bigint = uuid` Error

This means the Supabase database probably still has an older schema using BIGINT user IDs. The current schema expects UUID user IDs that match Supabase Auth.

Fix:

1. Back up any useful Supabase data.
2. Drop/recreate the old schema if needed.
3. Re-run `android_only/db/sql_build_tables.sql`.
4. Re-run `android_only/db/rls_policies.sql`.

### Register Works But Login Fails

Check whether Supabase email confirmation is enabled. If it is enabled, confirm the account email before logging in.

### RLS Permission Errors

Likely causes:

- `rls_policies.sql` was not run.
- The current user lacks the required owner/sitter profile.
- The frontend is inserting a row with the wrong `owner_user_id`, `current_owner_user_id`, or `applicant_user_id`.

### Expo Web Does Not Pick Up Env Changes

Stop and restart Expo after changing `.env`.

## What Not To Run

Do not try to run `android_only/` as the main app unless you intentionally want to revive the older native Android implementation. It does not currently contain a complete Gradle project and expects an older REST backend API shape.
