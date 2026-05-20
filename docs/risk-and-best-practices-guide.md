# Risk And Best Practices Guide

This guide collects current and future risks to watch as PlantBuddy grows, plus development practices that should keep the codebase safer and easier to maintain.

## Current Highest Risks

### RLS Is The Main Backend Boundary

The frontend talks directly to Supabase, so Row Level Security is effectively the backend authorization layer.

Best practices:

- Design RLS policies before or alongside each feature.
- Test policies with at least two users: owner and non-owner.
- Never rely on hidden buttons or frontend checks as the only authorization control.
- Prefer database constraints and RPC functions for important state transitions.

### Listing Ownership Is Now Guarded, But Needs Live Verification

The source SQL and `android_only/db/2026_05_20_security_rls_hardening.sql` now require listing inserts/updates to reference an active, unarchived plant owned by the authenticated user. This should still be verified against live Supabase with multiple users.

Best practices:

- Use `EXISTS` checks against `plants` in insert/update policies.
- Prevent changing `plant_id` on an existing listing unless the new plant is also owned by the user.
- Add RLS tests before relying on applications with real users.
- Apply and verify the 2026-05-20 hardening migration before demoing with real accounts.

### Profile Data Exposure

The schema contains private fields such as email, phone, address, emergency contact, and store business details.

Best practices:

- Do not expose full profile tables to browse screens.
- Create safe public profile views with only display-safe fields.
- Keep private fields readable only by the owning user or explicitly authorized parties.

### Multi-Step Workflows Need Transactions

Accepting an application will likely update an application, decline others, update the listing, and create a contract.

Best practices:

- Implement multi-write business actions as Supabase RPC functions.
- Keep those functions idempotent where possible.
- Return the resulting contract/application state from the RPC.
- Avoid doing important multi-step state changes entirely in client code.
- Treat the current accept/decline UI as an interim implementation until contract creation is transactional.

### Anti-Spam And Text-Field Threats Need Controls

PlantBuddy has user-authored plant bios, listing descriptions, applications, swap proposals, reviews, reports, and future messages.

Best practices:

- Add maximum lengths and validation for every free-text field.
- Rate-limit high-abuse actions such as applications, listing creation, proposals, reviews, reports, and messages.
- Detect suspicious links, repeated messages, private-contact leakage, scams, threats, harassment, and unsafe content.
- Use deterministic checks first; add AI-assisted moderation only after privacy and escalation rules are defined.
- Store moderation outcomes in `moderation_cases` and important actions in `audit_log`.

## Current Functionality Risks

### Database Setup Is Manual

Schema and RLS are currently applied through SQL files and the Supabase dashboard.

Best practices:

- Move toward a `supabase/` migrations folder.
- Add seed data for development.
- Document a repeatable reset process.
- Consider generated TypeScript types from Supabase once the app moves toward TypeScript.

### Tests Are Still Narrow

Current tests cover form helpers and static smoke checks, not live auth or RLS behavior.

Best practices:

- Keep the current fast unit/smoke tests.
- Add integration tests for plant/listing writes against a controlled Supabase environment.
- Add Playwright tests for the web happy path once the app launches reliably.
- Add RLS-specific tests before accepting real user data.

### Frontend Is Plain JavaScript

The current app is JavaScript, which keeps setup simple but makes data-shape drift easier.

Best practices:

- Consider TypeScript before the app grows much larger.
- Define shared domain types for plants, sitting requests, applications, and contracts.
- Keep payload builders in `src/utils` or a domain-specific folder rather than inline in screens.

### Folder Naming Can Confuse Contributors

The active Expo app is currently `react_webiosand/`. The name is not ideal, but it should stay as-is until the team agrees on a rename because a folder rename touches many files at once.

Best practices:

- Treat `react_webiosand/` as the current active frontend until the team confirms a rename.
- If renaming later, stage the old deletions and new folder together so Git records a move.
- Keep setup docs and smoke tests aligned with whatever folder name is active.
- Avoid keeping duplicate active app folders in the repo.

### Legacy Android Code Can Confuse Contributors

`android_only/` is useful reference material, but it does not represent the active app.

Best practices:

- Keep docs clear that `react_webiosand/` is active.
- Avoid extending native Android and Expo in parallel unless there is a deliberate product decision.
- If the native code is retained, mark it as reference-only in its README.

## Future Security Risks

### Image Uploads

When Supabase Storage is added, upload rules need to match plant/listing visibility.

Best practices:

- Store files under user/plant-specific paths.
- Enforce upload ownership with Storage policies.
- Validate MIME type and size.
- Avoid making every plant photo public by default.

### Messaging

Messaging can expose users to spam, harassment, and unauthorized participant access.

Best practices:

- Create conversations only through controlled workflows.
- Restrict participants to listing owners, applicants, contract parties, or store order parties.
- Add blocking/reporting paths before public launch.
- Log system messages for important state changes.

### Payments

Payments introduce financial, fraud, refund, and tax concerns.

Best practices:

- Use a provider such as Stripe rather than storing card details.
- Keep payment secrets server-side only.
- Use an append-only ledger, as the schema already suggests.
- Treat payment webhooks as the source of truth for settlement state.

### Store Owner Approval

Store listings should not become public just because a user creates a store profile.

Best practices:

- Require `is_approved = true` and `approved_at IS NOT NULL`.
- Restrict approval changes to admin/server-side flows.
- Log approval actions in `audit_log`.

## Future Functionality Risks

### Contract State Drift

Contracts have multiple states and dual acceptance fields.

Best practices:

- Define allowed state transitions clearly.
- Enforce critical transitions in RPC functions.
- Record who performed each transition and when.
- Add tests for invalid transitions.

### Date And Time Handling

Sitting requests use dates, but later care tasks, reminders, and messages may use times.

Best practices:

- Store date-only fields as `DATE`.
- Store event timestamps as `TIMESTAMPTZ`.
- Decide how user locale/timezone affects reminders.
- Avoid parsing `YYYY-MM-DD` with raw JavaScript `Date` for display without a helper.

### Role Confusion

One user can be owner, sitter, and store owner. That flexibility is useful, but can create unclear UI and authorization rules.

Best practices:

- Keep role-specific profile tables.
- Make role activation explicit in the UI.
- Name screens and services by domain: `SitterProfile`, `OwnerApplications`, `SittingContracts`.
- Always test as users with one role and multiple roles.

## Development Best Practices

### Naming

- Prefer domain-specific names over generic names when the team is ready to rename files.
- Keep screen names aligned with routes when new screens are added.
- Record any broad rename in a short PR/commit description so collaborators understand that behavior should not have changed.
- Use boolean prefixes such as `isLoading`, `isSubmitting`, and `hasError`.
- Keep database columns snake_case and frontend variables camelCase.

### Feature Structure

- Keep screens thin.
- Put Supabase table calls in services.
- Put reusable form validation/payload builders in utilities.
- Move repeated domain logic into dedicated modules before it spreads across screens.

### Data Safety

- Add database constraints for business invariants.
- Use soft deletes where history matters.
- Avoid deleting financial, contract, or audit history.
- Add `created_at`, `updated_at`, and actor fields for important state changes.

### Code Review Checklist

Before merging a feature, check:

- Does it need an RLS change?
- Does it expose any private field?
- Does it require a transaction/RPC?
- Does it need a new test?
- Does it update docs if setup, schema, or flow changed?
- Does it avoid committing `.env`, build output, IDE files, or secrets?

### Release Readiness Checklist

Before a public MVP:

- RLS policies tested with multiple users.
- Supabase schema managed through migrations.
- No service role key or database password in frontend or repo.
- Sign-up/sign-in flow tested with intended email confirmation setting.
- Plant CRUD and sitting request flow verified on web and Android.
- Application and contract flows implemented or clearly hidden.
- Privacy policy and terms drafted if collecting real user data.
