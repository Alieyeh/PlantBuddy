# Todo Roadmap

This is a prioritized list of what remains to make PlantBuddy usable.

## Immediate Setup Tasks

- Add `react_webiosand/.env` locally with Supabase URL and anon key.
- Run `npm.cmd install` in `react_webiosand/`.
- Confirm Supabase schema has been recreated with UUID user IDs.
- Run `rls_policies.sql` after schema creation.
- Smoke-test register, profile setup, login, add plant, post listing, browse listing, apply, and owner accept/decline.
- Include Browse search, listing-type filters, and sort options in the manual smoke test.
- Decide whether Supabase email confirmation should be on or off for local development.

## Priority 1 - Security And Data Integrity

- Improve the existing Supabase email verification UX so users clearly know when they must confirm their email before logging in.
- Add resend-confirmation, post-confirmation guidance, and clearer login/register messages for unconfirmed accounts.
- Apply `android_only/db/2026_05_20_security_rls_hardening.sql` to live Supabase if it has not already been run.
- Verify hardened RLS for `plant_listings` so users can only create/update listings for active plants they own.
- Verify sitter-profile enforcement and self-application prevention for `listing_applications`.
- Verify swap proposals can only offer active plants owned by the proposer.
- Decide whether all authenticated users should see all active plants.
- Restrict public visibility of sensitive profile fields such as email, phone, address, and emergency contacts.
- Fix or redesign permissive conversation participant policies before implementing messaging.
- Add anti-spam and text-field threat safeguards:
  - max lengths and validation for free-text fields
  - cooldowns/rate limits for applications, listings, proposals, reviews, reports, and future messages
  - scam-link and suspicious-contact checks
  - moderation categories for spam, harassment, fraud, threats, unsafe content, and private-info leakage
- Keep generated local folders and `local.properties` out of commits.

## Priority 2 - Complete Sitter Profile

- Expand the current post-register `ProfileSetupScreen` or add a dedicated sitter profile edit screen.
- Add missing sitter fields:
  - years experience
  - can travel
  - travel radius
- Add availability CRUD for `sitter_availability`.
- Add navigation entry for sitter mode/profile.
- Let users edit sitter profile after initial setup.

## Priority 3 - Harden Application Flow

- Prevent owners from applying to their own listings.
- Require or encourage sitter profile activation before applying.
- Show submitted applications to the sitter.
- Handle duplicate applications cleanly.
- Add validation around proposed dates and listing status at the database/RLS level.

## Priority 4 - Complete Owner Application Management

- Add a broader owner inbox across all open listings.
- When accepting:
  - mark selected application accepted
  - decline or expire competing applications
  - mark listing matched
  - create contract
- Make this operation transactional, preferably through a Supabase RPC function.

## Priority 5 - Contract Flow

- Add contract list/detail screens.
- Show plant, owner, sitter, dates, and price.
- Add owner confirmation.
- Add sitter confirmation.
- Move contract status to active only after both parties confirm.
- Add cancel/complete actions.

## Priority 6 - Better Plant Profiles

- Add plant photos with Supabase Storage.
- Add separate plant size value and unit fields, such as `size_value` plus a cm/inch/unit dropdown.
- Reflect plant size unit fields in the database, migrations, form validation, and Browse/search filters.
- Expand the new common plant care profile table with more species, cultivar notes, and age-specific rows.
- Later, add AI-assisted wording or less-common species suggestions on top of the deterministic common-care table.
- Keep species-based suggestions editable and clearly marked as suggestions, not facts, because care needs vary by cultivar, pot, soil, season, room temperature, and local climate.
- Add recurring care tasks.
- Add profile completeness indicators.
- Add better plant card design for web and mobile.

## Priority 7 - Messaging And Notifications

- Add conversation list.
- Add contract/listing chat.
- Add system messages for application/contract events.
- Add notification screen.
- Consider Supabase Realtime for live updates.

## Priority 8 - Trust Features

- Add sitter reviews.
- Update sitter rating average/count when reviews are created.
- Add moderation report flow.
- Add audit log writes for important events.

## Priority 9 - Marketplace Expansion

- Saved searches and favorites.
- Server-side browse filtering/search once the listing dataset grows.
- Richer plant-care filters such as light, watering frequency, size, and distance.
- Store owner profile and approval flow.
- Store orders.
- Payments.

## Priority 10 - Delivery And Quality

- Keep smoke tests aligned with implemented screens and flows.
- Expand automated tests beyond form utilities and static smoke checks.
- Add CI.
- Add formal Supabase migrations.
- Add seed data.
- Add production deployment docs.
- Add EAS build setup for mobile app distribution.
