# Project Plan

## Product Summary

PlantBuddy is intended to be a plant care marketplace: a pet-sitting style app for plants that has expanded into a plant marketplace and care network. A user can own plants, create plant profiles, request sitters, browse plants that need care, and participate in gift, swap, and peer-sale flows.

The project started as an Android application, but the active direction is now a cross-platform Expo / React Native app for Android, iOS, and web, backed by Supabase.

## Core User Roles

PlantBuddy is designed around additive roles. One account can have more than one role.

| Role | Intended capabilities |
| --- | --- |
| Owner | Create plant profiles, request sitters, post donations, propose swaps |
| Sitter | Browse sitting requests, apply, set availability and daily rate |
| Store owner | Sell plants after platform approval |

The current app automatically creates an owner profile for every signed-up user. A post-register profile setup screen can also create a basic sitter profile. Store-owner flows are not implemented in the frontend yet.

## Target Core Loop

The first complete product loop should be:

1. User registers and logs in.
2. User creates a plant profile.
3. Owner posts a sitting request for that plant.
4. Sitter browses open listings and can narrow to sitting requests.
5. Sitter applies to care for the plant.
6. Owner reviews applications and accepts one.
7. Contract is created.
8. Owner and sitter both confirm.
9. Contract becomes active.
10. Contract completes and both users can review.

## MVP Scope

The original recommended MVP was the sitting flow first. The current implementation has already expanded into sitting, gift, sale, and swap foundations, so the practical MVP should now stabilize those existing flows while still deferring payments, store-owner commerce, and advanced messaging.

### MVP Should Include

- Supabase Auth login/register.
- Owner profile creation during signup.
- Plant profile CRUD.
- Sitting request creation.
- Browse open listings with search, listing-type filters, and sort options.
- Sitter profile activation.
- Application submission.
- Owner application inbox.
- Accept/decline application.
- Contract creation from accepted application.
- Basic contract status flow.

### MVP Can Defer

- Payment processing.
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
- Create sitting, gift, and sale listings.
- Browse open listings with search, listing-type filters, and sort options.
- View listing details.

### Phase 2 - Sitter Application Flow

Status: partly implemented.

- Post-register `ProfileSetupScreen`.
- Allow users to activate basic sitter mode.
- Capture display name, experience summary, and optional base daily rate.
- `Apply to Sit` opens `ApplyScreen`.
- Insert into `listing_applications`.
- Still missing sitter availability CRUD.
- Still missing a screen for users to view their own submitted applications.
- Still missing owner/self-application prevention and sitter-profile enforcement.

### Phase 3 - Owner Application Management

Status: partly implemented.

- `ApplicationsScreen` lets owners view applications for one listing.
- Owners can accept or decline an application.
- Still missing a transactional accept flow that updates the listing, handles competing applications, and creates a contract.
- Still missing a broader owner inbox across all listings.

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

Status: core peer marketplace flows are partly implemented; store-owner commerce and payments are still missing.

- Richer browse filters, saved searches, and favorites.
- Store owner approval.
- Payments.
- Image storage.

## Product Decisions Already Made

- Expo / React Native is the active frontend direction.
- Supabase is the backend: Auth, Postgres, PostgREST, Storage, and RLS.
- The old native Android app is a reference implementation, not the primary build path.
- Sitting requests come before donations, swaps, or sale listings.
- Payments and image uploads are deferred.
- Database constraints and RLS should enforce business rules because the client talks directly to Supabase.
