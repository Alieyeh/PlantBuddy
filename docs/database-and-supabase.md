# Database And Supabase

## Backend Choice

The current backend is Supabase. Supabase provides:

- Auth
- PostgreSQL
- PostgREST auto-generated API
- Row Level Security
- Storage, planned
- Realtime, planned

There is no active Java/Tomcat backend in the current project direction.

## Important Files

- `android_only/db/sql_build_tables.sql` - schema, enum types, indexes, auth trigger.
- `android_only/db/rls_policies.sql` - Row Level Security policies.
- `android_only/db/2026_05_23_watering_frequency_unit.sql` - forward migration for plant watering frequency units.
- `android_only/db/2026_06_01_plant_age_description.sql` - forward migration for the optional plant age/life-stage dropdown.
- `react_webiosand/src/lib/supabase.js` - frontend Supabase client.

## Schema Summary

### Identity And Roles

- `users`
- `owner_profiles`
- `sitter_profiles`
- `store_owner_profiles`

`users.id` is a UUID and references `auth.users(id)`. This is important because Supabase Auth uses UUID user IDs.

Every new signup should get:

- a `users` row
- an `owner_profiles` row

This is handled by the `handle_new_user()` trigger.

### Plants

- `plants`
- `plant_photos`
- `plant_care_tasks`

Plants are owned through `current_owner_user_id`, which references `owner_profiles(user_id)`.

Plant care fields now include:

- `watering_frequency_days` - the numeric frequency amount retained for backward compatibility.
- `watering_frequency_unit` - the frequency unit, constrained to `days`, `weeks`, or `months`, with existing rows defaulting to `days`.
- `age_description` - an optional life-stage value constrained to `Cutting / propagation`, `Seedling`, `Young plant`, `Mature plant`, or `Established plant`.

### Listings And Matching

- `plant_listings`
- `listing_applications`
- `swap_proposals`

The schema supports four listing types:

- `SITTING_REQUEST`
- `GIFT`
- `SWAP`
- `SALE`

The frontend can create sitting, gift, and sale listings, browse all four listing types, and supports swap proposals for swap listings. The frontend also writes and reads `listing_applications` for sitter applications and owner accept/decline decisions.

### Contracts

- `contracts`
- `contract_plants`

Contracts are designed to represent accepted sitting arrangements. Frontend screens and transactional contract creation do not exist yet.

### Handoffs

- `listing_handoffs`
- `listing_handoff_reviews`

Peer-to-peer sale, gift, and swap flows use listing handoffs to track who the plant is moving to, who confirmed the handoff, and when the exchange completed.

### Communication

- `conversations`
- `conversation_participants`
- `messages`
- `message_attachments`
- `notifications`

The schema exists, but there is no frontend messaging or notification implementation yet.

### Payments And Trust

- `payment_ledger`
- `sitter_reviews`
- `moderation_cases`
- `audit_log`
- `store_orders`

These are mostly future-facing right now.

## Setup Order

For a fresh Supabase setup, run in Supabase SQL editor:

1. Run `android_only/db/sql_build_tables.sql`.
2. Run `android_only/db/rls_policies.sql`.
3. Register a test user through the app.
4. Confirm the test user created rows in:
   - `auth.users`
   - `public.users`
   - `public.owner_profiles`

For an existing Supabase database that already has the `plants` table, also run:

```sql
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS watering_frequency_unit TEXT NOT NULL DEFAULT 'days';

UPDATE public.plants
SET watering_frequency_unit = 'days'
WHERE watering_frequency_unit IS NULL;

ALTER TABLE public.plants
DROP CONSTRAINT IF EXISTS plants_watering_unit_chk;

ALTER TABLE public.plants
ADD CONSTRAINT plants_watering_unit_chk
CHECK (watering_frequency_unit IN ('days', 'weeks', 'months'));
```

This is also saved in `android_only/db/2026_05_23_watering_frequency_unit.sql`.

For an existing Supabase database that already has the `plants` table but does not have the controlled age/life-stage field, also run:

```sql
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS age_description VARCHAR(100);

UPDATE public.plants
SET age_description = NULL
WHERE age_description IS NOT NULL
  AND age_description NOT IN (
    'Cutting / propagation',
    'Seedling',
    'Young plant',
    'Mature plant',
    'Established plant'
  );

ALTER TABLE public.plants
DROP CONSTRAINT IF EXISTS plants_age_description_chk;

ALTER TABLE public.plants
ADD CONSTRAINT plants_age_description_chk
CHECK (
  age_description IS NULL OR age_description IN (
    'Cutting / propagation',
    'Seedling',
    'Young plant',
    'Mature plant',
    'Established plant'
  )
);
```

This is also saved in `android_only/db/2026_06_01_plant_age_description.sql`. The cleanup step clears old custom age strings that do not match the current dropdown choices.

## Important Schema Warning

Previous project notes mention a likely old Supabase schema with BIGINT user IDs. The current schema expects UUID user IDs.

If the app shows errors like:

```text
operator does not exist: bigint = uuid
```

then the Supabase database is probably not using the current schema.

Recommended fix:

1. Back up anything valuable.
2. Drop the old incompatible public schema/tables.
3. Re-run `sql_build_tables.sql`.
4. Re-run `rls_policies.sql`.

## Direct Postgres Access

The frontend app should not use the Postgres password directly.

For the app, use:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

For direct database tools, get the connection string from the Supabase dashboard:

- Project
- Connect

Use the direct Postgres password only in trusted local tools or server-side migration environments. Do not commit it.

## RLS Notes

Because the frontend talks directly to Supabase, RLS is the main security boundary.

That means all important authorization rules must be enforced in:

- RLS policies
- CHECK constraints
- foreign keys
- triggers
- controlled RPC functions, if added later

Do not rely only on frontend UI checks.

Current RLS hardening source:

- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`

The 2026-05-20 hardening migration adds:

- plant ownership checks for `plant_listings` insert/update policies
- approved store-owner checks for store-backed listing writes
- sitter-profile requirements for `listing_applications`
- self-application prevention for listing owners
- stricter application update rules so applicants can only withdraw their own applications
- swap proposal checks requiring an active offered plant owned by the proposer

After applying it, manually verify with at least two Supabase users because the current automated suite only performs static SQL checks.

## Missing Database Tooling

Currently missing:

- Supabase migrations folder.
- Seed data file.
- Automated schema reset command.
- Local Supabase CLI setup.
- Type generation for frontend queries.

Recommended next improvement:

Create a formal `supabase/` folder with migrations and seed data so the database state is reproducible outside the dashboard.
