# Developer Handoff Report

## Executive Summary

PlantBuddy is currently a partially implemented Expo / React Native app backed by Supabase. The product direction is now a plant marketplace and care network covering sitting requests, gifts, swaps, and peer sales.

The active app already supports login/register, post-register profile setup, plant profile management, listing creation for sitting/gift/sale, browse search/filter/sort, sitting applications, owner accept/decline decisions, swap proposals, exchange inbox, handoff confirmation, and handoff reviews. The next major missing piece is a transactional sitting application accept flow that creates contracts.

## What To Work On First

1. Get the app running locally with real Supabase credentials.
2. Confirm the database schema is the UUID version.
3. Fix high-priority RLS issues around listing creation and private profile data.
4. Harden application authorization so owners cannot apply to their own listings and sitter requirements are clear.
5. Move accept/decline into a transactional RPC that also creates contracts.
6. Build contract list/detail and dual-confirmation screens.

## Current Source Of Truth

For current frontend implementation:

- `react_webiosand/`

For database schema:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`

For current project notes:

- `docs/`
- `_state.md`

For product vision:

- `PRODUCT.md`

## Things That May Confuse Contributors

### `react_webiosand/` Is The Main App

The folder name does not clearly say "frontend", but this is the active Expo app.

### `android_only/` Is Legacy/Reference

It has useful Java code and database files, but it is not the active build path.

### There Is No Custom Backend

Older docs mention Java/Tomcat and REST endpoints. The current direction is Supabase, not a custom server.

### Some Root Folders Are Build Noise

The root `app/`, `build/`, `.gradle/`, and `.idea/` folders appear to be generated or local tooling output.

### Supabase Schema May Be Out Of Sync

If Supabase still has old BIGINT user IDs, the current app/schema will break. The current schema requires UUID user IDs tied to Supabase Auth.

## Current App Screens

- Login
- Register
- Profile Setup
- My Plants
- Add/Edit Plant
- Post Sitting Request
- Browse Listings with search, listing-type filters, and sort options
- Listing Detail
- Apply
- Applications
- Exchanges
- Swap Proposal
- Swap Proposals
- Handoff Review

## Current Database Breadth

The database is much broader than the frontend. It already models:

- users
- roles
- plants
- listings
- applications
- swaps
- contracts
- messages
- notifications
- payments
- reviews
- moderation
- audit log

This is useful, but it also means the frontend is far behind the schema.

## Recommended Next PR

A strong next PR would be:

- Fix plant-listing ownership RLS.
- Add RLS/database checks for application eligibility.
- Add RPC for accepting an application and creating a contract.
- Add contract screens.
- Add docs note if setup changes.

This would make the project safer and move directly toward a complete sitting contract flow.

## Open Questions

- Should email confirmation be enabled during development?
- Should all active plants be visible, or only plants attached to open listings?
- Should users need a sitter profile before applying?
- Should accepting an application happen through a Supabase RPC transaction?
- Will the team use Supabase migrations, or keep applying SQL manually?
- Is the native Android implementation still needed?
- Should `react_webiosand/` be renamed before the project grows further?

## Practical Advice

Build vertically from the current marketplace/care foundation. Swap, gift, and sale skeletons exist now, but payments, messaging, and store-owner commerce should still wait until trust, authorization, and contract flows are stronger.

Because this is a direct-to-Supabase client app, database policies are not optional. Every feature should be designed with its RLS rules at the same time as its screen.
