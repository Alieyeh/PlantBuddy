# Testing And Quality Plan

PlantBuddy currently has no automated test suite. This document suggests a practical path to add confidence without overbuilding too early.

## Current Test Coverage

The Expo app now has a lightweight Node test suite. It does not require Jest or any added test dependency.

Run from `react_webiosand/`:

```powershell
npm.cmd test
```

Available scripts:

- `npm.cmd run test:unit` - tests extracted plant and listing form utilities.
- `npm.cmd run test:smoke` - checks the expected app files, Supabase wiring, and key schema/RLS files.
- `npm.cmd test` - runs both unit and smoke tests.

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
- Edit the plant.
- Confirm the plant appears in `My Plants`.
- Soft-delete/archive a plant and confirm it disappears.

### Listings

- Create a plant.
- Tap `Find sitter`.
- Create a sitting request with valid dates.
- Confirm the listing appears in Browse.
- Open the listing detail screen.
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

Add tests for pure logic:

- date validation
- date range formatting
- plant form payload construction
- listing form payload construction

Suggested tools:

- Jest
- React Native Testing Library

### Component Tests

Test important screens with mocked services:

- `LoginScreen`
- `RegisterScreen`
- `PlantsScreen`
- `AddEditPlantScreen`
- `PostListingScreen`
- `ListingsScreen`

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
- User can browse open listings.
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
- At least the high-priority RLS issues are fixed.
- No service role key or database password is present in source.
- Root generated files are cleaned or intentionally ignored.
