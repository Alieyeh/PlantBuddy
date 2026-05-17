# Project Plan

## Product Summary

PlantBuddy is intended to be a plant care marketplace: a pet-sitting style app for plants. A user can own plants, create plant profiles, request sitters, browse plants that need care, and eventually support donation, swapping, and selling.

The project started as an Android application, but the active direction is now a cross-platform Expo / React Native app for Android, iOS, and web, backed by Supabase.

## Core User Roles

PlantBuddy is designed around additive roles. One account can have more than one role.

| Role | Intended capabilities |
| --- | --- |
| Owner | Create plant profiles, request sitters, post donations, propose swaps |
| Sitter | Browse sitting requests, apply, set availability and daily rate |
| Store owner | Sell plants after platform approval |

The current app automatically creates an owner profile for every signed-up user. Sitter and store-owner flows are not implemented in the frontend yet.

## Target Core Loop

The first complete product loop should be:

1. User registers and logs in.
2. User creates a plant profile.
3. Owner posts a sitting request for that plant.
4. Sitter browses open sitting requests.
5. Sitter applies to care for the plant.
6. Owner reviews applications and accepts one.
7. Contract is created.
8. Owner and sitter both confirm.
9. Contract becomes active.
10. Contract completes and both users can review.

## MVP Scope

The recommended MVP is the sitting flow only. Donation, swap, store sale, payments, and advanced messaging should wait until sitting works end to end.

### MVP Should Include

- Supabase Auth login/register.
- Owner profile creation during signup.
- Plant profile CRUD.
- Sitting request creation.
- Browse open sitting requests.
- Sitter profile activation.
- Application submission.
- Owner application inbox.
- Accept/decline application.
- Contract creation from accepted application.
- Basic contract status flow.

### MVP Can Defer

- Payment processing.
- Donation listings.
- Swap listings.
- Store owner sale listings.
- Image uploads.
- Push notifications.
- Realtime messaging.
- Admin dashboard.

## Build Phases

### Phase 0 - Stabilize Foundation

Status: partly done.

- Confirm the Supabase schema has been applied correctly.
- Confirm RLS policies have been applied.
- Add a local `.env` with Supabase URL and anon key.
- Run `npm.cmd install` from PowerShell.
- Verify login, register, plants, and listings on web.
- Decide whether email confirmation should be enabled or disabled for local development.

### Phase 1 - Owner Plants And Listings

Status: mostly implemented in Expo.

- Plant list.
- Add/edit plant.
- Soft-delete plant.
- Create sitting request.
- Browse open sitting requests.
- View listing details.

### Phase 2 - Sitter Application Flow

Status: not implemented.

- Add sitter profile screen.
- Allow users to activate sitter mode.
- Add availability and base daily rate fields.
- Replace the current `Apply to Sit` placeholder with an application form.
- Insert into `listing_applications`.
- Show user's own submitted applications.

### Phase 3 - Owner Application Management

Status: not implemented.

- Add owner inbox for listing applications.
- Allow owner to accept or decline.
- Ensure accepting one application updates the listing and other applications safely.
- Create a contract record from the accepted application.

### Phase 4 - Contracts

Status: schema exists, frontend missing.

- Contract detail screen.
- Owner confirmation.
- Sitter confirmation.
- Status transitions from draft/pending to active/completed/cancelled/disputed.
- Contract plant list.

### Phase 5 - Communication And Trust

Status: schema exists, frontend missing.

- Messaging attached to listings or contracts.
- Notifications.
- Reviews.
- Dispute path.

### Phase 6 - Expanded Marketplace

Status: schema exists, frontend missing.

- Donations.
- Swaps.
- Store owner approval.
- Sale listings.
- Payments.
- Image storage.

## Product Decisions Already Made

- Expo / React Native is the active frontend direction.
- Supabase is the backend: Auth, Postgres, PostgREST, Storage, and RLS.
- The old native Android app is a reference implementation, not the primary build path.
- Sitting requests come before donations, swaps, or sale listings.
- Payments and image uploads are deferred.
- Database constraints and RLS should enforce business rules because the client talks directly to Supabase.
