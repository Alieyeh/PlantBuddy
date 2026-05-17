# Todo Roadmap

This is a prioritized list of what remains to make PlantBuddy usable.

## Immediate Setup Tasks

- Add `react_webiosand/.env` locally with Supabase URL and anon key.
- Run `npm.cmd install` in `react_webiosand/`.
- Confirm Supabase schema has been recreated with UUID user IDs.
- Run `rls_policies.sql` after schema creation.
- Smoke-test register, login, add plant, post listing, browse listing.
- Decide whether Supabase email confirmation should be on or off for local development.

## Priority 1 - Security And Data Integrity

- Tighten RLS for `plant_listings` so users can only create listings for plants they own.
- Tighten RLS for `plant_listings` updates so plant ownership cannot be bypassed.
- Decide whether all authenticated users should see all active plants.
- Restrict public visibility of sensitive profile fields such as email, phone, address, and emergency contacts.
- Fix or redesign permissive conversation participant policies before implementing messaging.
- Add missing sitter-role enforcement for listing applications.
- Keep generated local folders and `local.properties` out of commits.

## Priority 2 - Sitter Profile

- Add `SitterProfileScreen`.
- Allow current user to create/update a row in `sitter_profiles`.
- Add fields:
  - display name
  - experience summary
  - years experience
  - base daily rate
  - can travel
  - travel radius
- Add availability CRUD for `sitter_availability`.
- Add navigation entry for sitter mode/profile.

## Priority 3 - Application Flow

- Replace the `Apply to Sit` placeholder in `ListingDetailScreen`.
- Add `ApplyScreen`.
- Insert into `listing_applications`.
- Prevent owners from applying to their own listings.
- Require or encourage sitter profile activation before applying.
- Show submitted applications to the sitter.
- Handle duplicate applications cleanly.

## Priority 4 - Owner Application Inbox

- Add `ApplicationsScreen` for owners.
- Show applications for the owner's listings.
- Allow accept/decline.
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

- Donation listing flow.
- Swap proposal flow.
- Store owner profile and approval flow.
- Sale listings.
- Store orders.
- Payments.

## Priority 10 - Delivery And Quality

- Add automated tests.
- Add CI.
- Add formal Supabase migrations.
- Add seed data.
- Add production deployment docs.
- Add EAS build setup for mobile app distribution.
