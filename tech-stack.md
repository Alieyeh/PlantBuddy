# PlantBuddy — Tech Stack

## Cross-Platform Frontend (`react_webiosand/`)

### Runtime & Framework

| Package | Version | Docs |
|---|---|---|
| [Expo](https://expo.dev) | `~54.0.33` | https://docs.expo.dev |
| [React](https://react.dev) | `19.1.0` | https://react.dev/reference/react |
| [React Native](https://reactnative.dev) | `0.81.5` | https://reactnative.dev/docs/getting-started |
| [React Native Web](https://necolas.github.io/react-native-web/) | `~0.21.0` | https://necolas.github.io/react-native-web/docs |

### Navigation

| Package | Version | Docs |
|---|---|---|
| [@react-navigation/native](https://reactnavigation.org) | `^7.2.4` | https://reactnavigation.org/docs/getting-started |
| [@react-navigation/native-stack](https://reactnavigation.org/docs/native-stack-navigator) | `^7.14.14` | https://reactnavigation.org/docs/native-stack-navigator |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | `~4.16.0` | https://github.com/software-mansion/react-native-screens |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | `~5.6.0` | https://github.com/th3rdwave/react-native-safe-area-context |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | `~2.28.0` | https://docs.swmansion.com/react-native-gesture-handler/docs |

### Supabase Client / Data Access

| Package | Version | Docs |
|---|---|---|
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | `^2.49.4` | https://supabase.com/docs/reference/javascript/introduction |
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` | https://react-native-async-storage.github.io/async-storage/docs/install |

### Design And Fonts

| Package | Version | Docs |
|---|---|---|
| [expo-font](https://docs.expo.dev/versions/latest/sdk/font/) | `~14.0.11` | https://docs.expo.dev/versions/latest/sdk/font |
| [@expo-google-fonts/fraunces](https://github.com/expo/google-fonts) | `^0.4.1` | https://github.com/expo/google-fonts |
| [@expo-google-fonts/bricolage-grotesque](https://github.com/expo/google-fonts) | `^0.4.1` | https://github.com/expo/google-fonts |

### Legacy / Currently Unused Dependency

| Package | Version | Notes |
|---|---|---|
| [axios](https://axios-http.com) | `^1.16.0` | Still in `package.json`, but active Expo data access now uses `@supabase/supabase-js`. |

### Storage

| Package | Version | Docs |
|---|---|---|
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` | https://react-native-async-storage.github.io/async-storage/docs/install |

### Build & Dev Tools

| Package | Version | Docs |
|---|---|---|
| [@expo/metro-runtime](https://github.com/expo/expo/tree/main/packages/@expo/metro-runtime) | `~6.1.2` | https://docs.expo.dev/guides/customizing-metro |
| [expo-status-bar](https://docs.expo.dev/versions/latest/sdk/status-bar/) | `~3.0.9` | https://docs.expo.dev/versions/latest/sdk/status-bar |

### Target Platforms

| Platform | How |
|---|---|
| Android | `npx expo start --android` / Expo Go / EAS Build |
| iOS | `npx expo start --ios` / Expo Go / EAS Build |
| Web | `npx expo start --web` (React Native Web via Metro) |

---

## Native Android Build (`android_only/`)

> Standalone Java implementation. Build files (Gradle) are not committed to the repo.
> Versions below are derived from import statements and API usage in source.

### Language & Platform

| Component | Version | Docs |
|---|---|---|
| Java | JDK 17 | https://docs.oracle.com/en/java/javase/17 |
| Android SDK | Target API 33+ (inferred from `EncryptedSharedPreferences` usage) | https://developer.android.com/reference |
| Android Architecture Components (MVVM) | Part of AndroidX lifecycle | https://developer.android.com/topic/libraries/architecture |

### Networking

| Library | Notes | Docs |
|---|---|---|
| [Retrofit 2](https://square.github.io/retrofit/) | HTTP client; version not pinned in committed files | https://square.github.io/retrofit |
| [OkHttp 4](https://square.github.io/okhttp/) | Underlying HTTP engine; used for logging interceptor | https://square.github.io/okhttp |
| [Gson](https://github.com/google/gson) | JSON serialization via `GsonConverterFactory` | https://github.com/google/gson |

### Storage & Security

| Library | Notes | Docs |
|---|---|---|
| [EncryptedSharedPreferences](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences) | AES256-GCM token storage | https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences |
| [MasterKey (AES256_GCM)](https://developer.android.com/reference/androidx/security/crypto/MasterKey) | Key management for encrypted prefs | https://developer.android.com/reference/androidx/security/crypto/MasterKey |

### UI

| Component | Notes | Docs |
|---|---|---|
| View Binding | `ActivityPlantsBinding`, `ActivityAddEditPlantBinding` | https://developer.android.com/topic/libraries/view-binding |
| RecyclerView + ListAdapter | Plant list with `DiffUtil` | https://developer.android.com/reference/androidx/recyclerview/widget/ListAdapter |
| LiveData + ViewModel | Reactive state in MVVM | https://developer.android.com/topic/libraries/architecture/livedata |

---

## Backend — Supabase

Supabase replaces the custom Java/Tomcat backend. It provides auth, a PostgREST auto-API over PostgreSQL, realtime subscriptions, and file storage — all managed, no server to deploy.

### Core Services Used

| Service | What it replaces | Docs |
|---|---|---|
| Supabase Auth | Custom JWT auth + refresh token table | https://supabase.com/docs/guides/auth |
| PostgREST (auto-API) | Java Servlet REST endpoints | https://supabase.com/docs/guides/api |
| Supabase Realtime | Custom messaging / polling | https://supabase.com/docs/guides/realtime |
| Supabase Storage | Planned S3/GCS image upload | https://supabase.com/docs/guides/storage |
| Row Level Security (RLS) | Role-based access control | https://supabase.com/docs/guides/auth/row-level-security |

### Client SDK

| Package | Version | Docs |
|---|---|---|
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | `^2.x` (latest) | https://supabase.com/docs/reference/javascript/introduction |

Install current dependencies from `react_webiosand/`:
```powershell
npm.cmd install
```

AsyncStorage is used as the Supabase auth persistence layer (already installed as `@react-native-async-storage/async-storage`).

### Authentication Flow (Supabase)

- Supabase Auth issues JWTs automatically; tokens are refreshed transparently by the SDK
- Session is persisted in `AsyncStorage` via the `ExpoSecureStoreAdapter` or plain AsyncStorage
- Auth state is observed via `supabase.auth.onAuthStateChange()`
- Row Level Security policies replace explicit role checks in application code

### Environment Variables (Expo)

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your project URL (e.g. `https://xxxx.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe to expose in client) |

Set in `.env` at the root of `react_webiosand/`. Expo automatically exposes `EXPO_PUBLIC_*` vars to the client bundle.

---

## Database — Supabase (PostgreSQL)

Supabase hosts a managed PostgreSQL instance. The existing schema (`android_only/db/sql_build_tables.sql`) is applied directly via the Supabase SQL editor or migrations.

| Component | Version | Docs |
|---|---|---|
| PostgreSQL (managed by Supabase) | 15 | https://supabase.com/docs/guides/database |
| [citext extension](https://www.postgresql.org/docs/current/citext.html) | Case-insensitive text for `username` and `email` | https://supabase.com/docs/guides/database/extensions |
| Row Level Security | Per-table access policies replacing API-layer RBAC | https://supabase.com/docs/guides/auth/row-level-security |

### Schema Conventions

| Convention | Detail |
|---|---|
| Primary keys | `BIGINT GENERATED BY DEFAULT AS IDENTITY` |
| Timestamps | `TIMESTAMPTZ` everywhere; always `NOT NULL DEFAULT NOW()` for `created_at` |
| Soft deletes | `deleted_at TIMESTAMPTZ` (users, messages); `archived_at` (plants) |
| Enum types | Defined as PostgreSQL `TYPE ... AS ENUM`; all business states modeled as enums |
| Business rules | Enforced via `CHECK` constraints at the column/table level, not only in application code |
| Indexes | Created on all FK columns, `status` columns, and `listing_type` |

### Key Enum Types Defined

| Enum | Values |
|---|---|
| `listing_type` | `SITTING_REQUEST`, `DONATION`, `SWAP`, `SALE` |
| `listing_status` | `DRAFT`, `OPEN`, `PAUSED`, `MATCHED`, `COMPLETED`, `CANCELLED`, `ARCHIVED` |
| `contract_status` | `DRAFT`, `PENDING_OWNER`, `PENDING_SITTER`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `DISPUTED` |
| `application_status` | `PENDING`, `ACCEPTED`, `DECLINED`, `WITHDRAWN`, `EXPIRED` |
| `payment_status` | `PENDING`, `AUTHORIZED`, `SETTLED`, `FAILED`, `REFUNDED`, `VOIDED` |
| `availability_status` | `AVAILABLE`, `UNAVAILABLE`, `BOOKED`, `TENTATIVE` |

---

## Dev Tooling

| Tool | Purpose |
|---|---|
| [Supabase Dashboard](https://app.supabase.com) | Manage DB, auth, storage, RLS policies |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | Local dev, migrations, type generation |
| Android Studio (latest stable) | Native Android reference build |
| Expo Go | Live preview on physical device (iOS + Android) |
| EAS Build (planned) | Cloud builds for App Store / Play Store |
