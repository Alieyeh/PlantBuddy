# Security And Vulnerabilities

This is a current risk register based on the repo as it exists now. It is not a full security audit, but it identifies issues that should be addressed before real users or real data.

## High Priority

### Listing Creation Plant Ownership Guard

File:

- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`

Status:

Mitigated in source SQL and the 2026-05-20 hardening migration.

Previous risk:

An authenticated user may be able to create a listing using a `plant_id` they do not own, as long as they set `owner_user_id` to themselves. The policy checks the listing owner field, but not whether the selected plant belongs to that owner.

Current fix:

The insert policy now requires an active, unarchived plant owned by `auth.uid()`:

```sql
EXISTS (
  SELECT 1 FROM plants p
  WHERE p.id = plant_listings.plant_id
    AND p.current_owner_user_id = auth.uid()
    AND p.is_active = TRUE
    AND p.archived_at IS NULL
)
```

### Listing Updates Plant Ownership Guard

File:

- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`

Status:

Mitigated in source SQL and the 2026-05-20 hardening migration.

Previous risk:

A listing owner can update their own listing, but the policy does not appear to stop them from changing `plant_id` to another user's plant. This is closely related to the listing creation issue.

Current fix:

The update policy now uses the same plant ownership `EXISTS` check as listing creation, so the final row must still point at an active plant owned by the authenticated user.

### Sensitive Profile Data Is Broadly Readable

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`

Current policies allow authenticated users to select from:

- `users`
- `owner_profiles`
- `sitter_profiles`
- `store_owner_profiles`

Risk:

These tables contain sensitive or semi-sensitive fields:

- email
- phone number
- address
- emergency contact
- business tax identifier
- business contact details

Recommended fix:

Use restricted views for public profile display, or tighten RLS so users can only read full private profile rows for themselves. Public browse screens should query safe profile views.

### Conversation Policies Are Too Permissive

File:

- `android_only/db/rls_policies.sql`

Policies include broad checks such as:

```sql
WITH CHECK (true)
```

Risk:

If messaging is implemented on top of these policies, users may be able to create conversations or participants in ways the app does not intend.

Recommended fix:

Before building messaging, define exact participant rules:

- listing owner can message applicant
- applicant can message listing owner
- contract owner and sitter can message each other
- participants cannot add unrelated users without authorization

Use RLS or RPC functions to enforce those rules.

## Medium Priority

### Sitter Role Is Enforced For Applications

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`
- `react_webiosand/src/screens/ApplyScreen.js`

Status:

Mitigated in source SQL and the 2026-05-20 hardening migration.

Current behavior:

- RLS requires a matching `sitter_profiles` row before inserting into `listing_applications`.
- The application validation trigger also raises `Applicants must have a sitter profile` if the applicant lacks that row.

Residual risk:

This still needs live Supabase verification with two users because current automated tests are static checks, not live RLS execution tests.

### Owners Are Blocked From Applying To Their Own Listings

Files:

- `react_webiosand/src/screens/ApplyScreen.js`
- `android_only/db/rls_policies.sql`
- `android_only/db/2026_05_20_security_rls_hardening.sql`

Status:

Mitigated in source SQL and the 2026-05-20 hardening migration.

Current behavior:

Application insert now requires `COALESCE(pl.owner_user_id, pl.store_owner_user_id) <> auth.uid()`, and the validation trigger raises `Listing owners cannot apply to their own listings`.

### Accepting Applications Is Not Transactional

Files:

- `react_webiosand/src/screens/ApplicationsScreen.js`
- `react_webiosand/src/api/listingsService.js`

Risk:

The current owner screen can mark one application as `ACCEPTED`, but it does not yet mark the listing as matched, decline/expire competing applications, or create a contract. This can leave the marketplace in a partial state.

Recommended fix:

Move application acceptance into a Supabase RPC function that updates the selected application, competing applications, listing status, and contract rows in one transaction.

### Active Plants Are Visible To All Authenticated Users

File:

- `android_only/db/rls_policies.sql`

Risk:

All active plants are visible to authenticated users, even when not attached to an open listing. This may expose private plant/profile details.

Recommended fix:

Only expose:

- plants owned by the current user
- plants attached to open listings
- plants attached to active contracts involving the current user

### Plant Photos Are Broadly Readable

File:

- `android_only/db/rls_policies.sql`

Risk:

`plant_photos_select_authenticated` uses `USING (true)`. Once image upload exists, all authenticated users may be able to read photo metadata for all plant photos.

Recommended fix:

Tie photo visibility to plant visibility.

### Frontend Supabase Env Vars Are Guarded

File:

- `react_webiosand/src/lib/supabase.js`
- `react_webiosand/src/config/environment.js`
- `react_webiosand/App.js`

Status:

Mitigated in the current app.

Current behavior:

`src/config/environment.js` validates `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `App.js` shows a clear Supabase configuration message when either value is missing.

Remaining best practice:

Keep the frontend limited to public Expo variables and never add a service role key, database password, or other server secret to `.env`.

### Manual Schema Setup Is Error-Prone

Files:

- `android_only/db/sql_build_tables.sql`
- `android_only/db/rls_policies.sql`

Risk:

The schema is applied manually through the Supabase dashboard. This already appears to have caused a UUID/BIGINT mismatch in a previous session.

Recommended fix:

Move to formal Supabase migrations and document the reset process.

## Low Priority / Hygiene

### Generated And Local Files Are Present At Repo Root

Folders/files:

- `.gradle/`
- `.idea/`
- `app/build/`
- `build/`
- `local.properties`

Risk:

Noise, accidental local config commits, and confusion about source vs generated output.

Recommended fix:

Keep root `.gitignore` coverage in place and clean generated output after confirming it is not needed.

### Automated Tests Are Still Narrow

Risk:

The current Node unit, integration, and smoke tests cover helper logic, browse filtering/sorting, config validation, exchange inbox shaping, and static project structure, but not real auth, RLS behavior, or end-to-end app flows.

Recommended fix:

Continue expanding tests around:

- plant CRUD
- listing creation
- listing browse
- application submission and owner accept/decline
- RLS policy expectations

### No Service Boundary For Multi-Step Business Operations

Risk:

Accepting an application will require several writes. Doing this directly from the client can create partial state if one write succeeds and another fails.

Recommended fix:

Use Supabase RPC functions for transactional operations such as:

- accept application
- create contract
- complete contract
- transfer ownership
- post payment ledger rows

## Secret Handling Rules

- Safe in frontend: Supabase anon key.
- Not safe in frontend: service role key.
- Not safe in repo: Postgres password.
- Not safe in repo: payment provider secrets.
- Not safe in repo: private signing keys.

The `.env` file is ignored inside `react_webiosand/`, which is good. Keep it that way.
