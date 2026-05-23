# Testing And Quality Plan

PlantBuddy currently has a small automated test suite. This document explains what it covers and what should be added next.

## Current Test Coverage

The Expo app now has a lightweight Node test suite. It does not require Jest or any added test dependency.

Run from `react_webiosand/`:

```powershell
npm.cmd test
```

Available scripts:

- `npm.cmd run test:unit` - tests extracted plant, listing, browse, config, domain, text-input, and exchange inbox utilities.
- `npm.cmd run test:integration` - tests exchange inbox composition from raw proposal/handoff rows.
- `npm.cmd run test:smoke` - checks expected app files, application-flow wiring, bottom navigation wiring, browse filter/sort wiring, text-input spellcheck/autocomplete wiring, exchange inbox wiring, Supabase wiring, design dependencies, and key schema/RLS files.
- `npm.cmd test` - runs unit, integration, and smoke tests.

Manual testing is still required for actual Supabase login/register/database flows.

## Minimum Manual Smoke Test

Run this after dependency install, `.env` setup, and Supabase schema/RLS setup.

### Auth

- Register a new account.
- Confirm email if Supabase requires it.
- Log in.
- Log out.
- Log back in.

### Plants

- Add a plant with only a name.
- Add a plant with full care details.
- Confirm the Add/Edit Plant screen shows the designed plant-profile hero, grouped form sections, and live care preview tiles.
- Type a deliberately misspelled word into a natural-language field such as Description or Special Instructions and confirm the browser/mobile keyboard offers spellcheck suggestions when OS/browser spellcheck is enabled.
- Edit the plant.
- Confirm the plant appears in `My Plants`.
- Soft-delete/archive a plant and confirm it disappears.

### Listings

- Create a plant.
- Tap `Find sitter`.
- Create a sitting request with valid dates.
- Confirm the listing appears in Browse.
- Search for the plant/species and confirm the listing remains visible.
- Try listing-type filters and sort options in Browse.
- Open the listing detail screen.
- Confirm the plant detail hero and care snapshot render cleanly on desktop and mobile widths.
- Confirm the bottom tab bar renders as a raised rounded bar with visible My Plants, Browse, and Exchanges icons/labels.
- Tap `Apply to Sit`.
- Submit an application with a message and proposed dates.
- As the listing owner, open the plant card's `Applicants` action.
- Accept and decline test applications.
- Try invalid dates and confirm validation catches them.

### Database

In Supabase, confirm:

- `auth.users` row exists.
- `public.users` row exists.
- `owner_profiles` row exists.
- `plants` rows point to the current user's UUID.
- `plant_listings` rows point to the current user's UUID.

## Recommended Frontend Test Layers

### Unit Tests

Continue expanding tests for pure logic:

- date validation
- date range formatting
- plant form payload construction
- listing form payload construction
- browse listing search, filtering, and sorting
- exchange inbox counts, action-needed state, and date/participant helpers

Suggested tools:

- Keep the built-in Node test runner for pure JavaScript helpers.
- Consider Jest and React Native Testing Library when screen/component tests are added.

### Component Tests

Test important screens with mocked services:

- `LoginScreen`
- `RegisterScreen`
- `PlantsScreen`
- `AddEditPlantScreen`
- `PostListingScreen`
- `ListingsScreen`
- `ListingDetailScreen`
- `ApplyScreen`
- `ApplicationsScreen`
- `ProfileSetupScreen`

Focus on:

- form validation
- loading state
- error state
- successful submit path

### End-To-End Tests

For web:

- Playwright can test Expo web flows once the app runs reliably.

For mobile:

- Consider Maestro or Detox later.

## Recommended Database Tests

RLS is central to this app, so database behavior needs direct testing.

Minimum RLS tests:

- User can insert their own plant.
- User cannot update another user's plant.
- User can create listing only for their own plant.
- User cannot create or update a listing using another user's plant.
- Store-owner listing writes require an approved store profile.
- User can browse open listings.
- User cannot apply to their own listing.
- User cannot apply without a sitter profile.
- New applications must start as `PENDING`.
- User can apply only once to the same listing.
- Owner can see applications for their own listing.
- Owner cannot accept applications for someone else's listing.
- Swap proposer can only offer an active plant they own.
- User cannot see private profile details they should not see.
- User cannot add themselves to unrelated conversations.

These can be tested with:

- Supabase local development.
- SQL scripts using different JWT claims.
- Integration tests against a disposable Supabase project.

## CI Recommendation

Start simple:

1. Install dependencies.
2. Run lint when linting is added.
3. Run tests.
4. Build Expo web.

Later:

- Add migration validation.
- Add generated Supabase types check.
- Add EAS build checks.

## Quality Gates Before MVP Demo

Before showing this as an MVP:

- App can be set up from docs on a clean machine.
- Register/login works.
- Plant CRUD works.
- Sitting request creation works.
- Browse/detail works.
- Application submission works.
- Owner application review works.
- At least the high-priority RLS issues are fixed.
- No service role key or database password is present in source.
- Root generated files are cleaned or intentionally ignored.
