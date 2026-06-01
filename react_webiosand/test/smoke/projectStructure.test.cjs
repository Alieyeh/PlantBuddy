const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const appRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(appRoot, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

test('active Expo app has the expected screen and service files', () => {
  [
    'react_webiosand/App.js',
    'react_webiosand/src/navigation/AppNavigator.js',
    'react_webiosand/src/config/environment.js',
    'react_webiosand/src/domain/listings.js',
    'react_webiosand/src/lib/supabase.js',
    'react_webiosand/src/lib/theme.js',
    'react_webiosand/src/storage/SessionManager.js',
    'react_webiosand/src/api/apiService.js',
    'react_webiosand/src/api/commonPlantCareService.js',
    'react_webiosand/src/api/listingsService.js',
    'react_webiosand/src/utils/browseListings.js',
    'react_webiosand/src/utils/plantCareProfiles.js',
    'react_webiosand/src/utils/exchangeInbox.js',
    'react_webiosand/src/utils/textInputProps.js',
    'react_webiosand/src/screens/LoginScreen.js',
    'react_webiosand/src/screens/RegisterScreen.js',
    'react_webiosand/src/screens/ProfileSetupScreen.js',
    'react_webiosand/src/screens/PlantsScreen.js',
    'react_webiosand/src/screens/AddEditPlantScreen.js',
    'react_webiosand/src/screens/ListingsScreen.js',
    'react_webiosand/src/screens/ListingDetailScreen.js',
    'react_webiosand/src/screens/PostListingScreen.js',
    'react_webiosand/src/screens/ExchangesScreen.js',
    'react_webiosand/src/screens/ApplyScreen.js',
    'react_webiosand/src/screens/ApplicationsScreen.js',
    'react_webiosand/src/screens/SwapProposalScreen.js',
    'react_webiosand/src/screens/SwapProposalsScreen.js',
    'react_webiosand/src/screens/HandoffReviewScreen.js',
  ].forEach((file) => assert.equal(exists(file), true, `${file} should exist`));
});

test('package.json exposes runnable app and test scripts', () => {
  const pkg = JSON.parse(read('react_webiosand/package.json'));

  assert.equal(pkg.scripts.start, 'expo start');
  assert.equal(pkg.scripts.web, 'expo start --web');
  assert.equal(pkg.scripts.test, 'npm run test:unit && npm run test:integration && npm run test:smoke');
  assert.match(pkg.scripts['test:integration'], /test\/integration\/exchangeInboxComposition\.test\.cjs/);
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.ok(pkg.dependencies.expo);
  assert.ok(pkg.dependencies['@expo-google-fonts/fraunces']);
  assert.ok(pkg.dependencies['@expo-google-fonts/bricolage-grotesque']);
});

test('Supabase client reads only public Expo environment variables', () => {
  const supabaseClient = read('react_webiosand/src/lib/supabase.js');
  const environment = read('react_webiosand/src/config/environment.js');

  assert.match(environment, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(environment, /EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(supabaseClient, /createSupabaseConfig/);
  assert.match(supabaseClient, /supabaseConfigError/);
  assert.doesNotMatch(supabaseClient, /SERVICE_ROLE|service_role|DATABASE_PASSWORD/);
  assert.match(environment, /getSupabaseConfigError/);
  assert.match(environment, /Missing Supabase configuration/);
  assert.doesNotMatch(environment, /SERVICE_ROLE|service_role|DATABASE_PASSWORD/);
});

test('database schema and RLS files include the current MVP tables', () => {
  const schema = read('android_only/db/sql_build_tables.sql');
  const rls = read('android_only/db/rls_policies.sql');
  const securityMigration = read('android_only/db/2026_05_20_security_rls_hardening.sql');
  const wateringMigration = read('android_only/db/2026_05_23_watering_frequency_unit.sql');
  const ageMigration = read('android_only/db/2026_06_01_plant_age_description.sql');
  const careProfilesMigration = read('android_only/db/2026_06_01_common_plant_care_profiles.sql');

  assert.ok(schema.includes("CREATE TYPE listing_type AS ENUM ('SITTING_REQUEST', 'GIFT', 'SWAP', 'SALE')"));

  [
    'CREATE TABLE IF NOT EXISTS users',
    'CREATE TABLE IF NOT EXISTS owner_profiles',
    'CREATE TABLE IF NOT EXISTS sitter_profiles',
    'CREATE TABLE IF NOT EXISTS plants',
    'CREATE TABLE IF NOT EXISTS common_plant_care_profiles',
    'CREATE TABLE IF NOT EXISTS plant_listings',
    'CREATE TABLE IF NOT EXISTS listing_applications',
    'CREATE TABLE IF NOT EXISTS contracts',
    'CREATE TABLE IF NOT EXISTS listing_handoffs',
    'CREATE TABLE IF NOT EXISTS listing_handoff_reviews',
  ].forEach((statement) => assert.match(schema, new RegExp(statement)));

  [
    'ALTER TABLE users',
    'ALTER TABLE plants',
    'ALTER TABLE common_plant_care_profiles',
    'ALTER TABLE plant_listings',
    'CREATE POLICY "plants_insert_own"',
    'CREATE POLICY "common_plant_care_profiles_select_authenticated"',
    'CREATE POLICY "plant_listings_select_open"',
    'CREATE POLICY "listing_handoffs_select"',
  ].forEach((statement) => assert.match(rls, new RegExp(statement)));

  assert.match(securityMigration, /2026_05_20_security_rls_hardening|plant_listings_insert_own|listing_applications_insert|swap_proposals_insert/);
  assert.match(schema, /watering_frequency_unit\s+TEXT NOT NULL DEFAULT 'days'/);
  assert.match(schema, /plants_watering_unit_chk/);
  assert.match(wateringMigration, /ADD COLUMN IF NOT EXISTS watering_frequency_unit/);
  assert.match(wateringMigration, /'days', 'weeks', 'months'/);
  assert.match(schema, /age_description\s+VARCHAR\(100\)/);
  assert.match(schema, /plants_age_description_chk/);
  assert.match(ageMigration, /ADD COLUMN IF NOT EXISTS age_description/);
  assert.match(ageMigration, /'Cutting \/ propagation'/);
  assert.match(schema, /common_plant_care_profiles/);
  assert.match(schema, /profile_key\s+VARCHAR\(120\) NOT NULL UNIQUE/);
  assert.match(careProfilesMigration, /CREATE TABLE IF NOT EXISTS public\.common_plant_care_profiles/);
  assert.match(careProfilesMigration, /monstera-deliciosa-seedling/);
  assert.match(careProfilesMigration, /ON CONFLICT \(profile_key\) DO UPDATE/);
});

test('RLS hardening guards listing ownership, sitter applications, and swap offers', () => {
  const schema = read('android_only/db/sql_build_tables.sql');
  const rls = read('android_only/db/rls_policies.sql');
  const securityMigration = read('android_only/db/2026_05_20_security_rls_hardening.sql');
  const combined = `${schema}\n${rls}\n${securityMigration}`;

  assert.match(combined, /p\.current_owner_user_id = auth\.uid\(\)/);
  assert.match(combined, /p\.is_active = TRUE/);
  assert.match(combined, /p\.archived_at IS NULL/);
  assert.match(combined, /sop\.is_approved = TRUE/);
  assert.match(combined, /sitter_profiles sp/);
  assert.match(combined, /Applicants must have a sitter profile/);
  assert.match(combined, /Listing owners cannot apply to their own listings/);
  assert.match(combined, /status = 'PENDING'/);
  assert.match(combined, /status = 'WITHDRAWN'/);
  assert.match(combined, /offered_plant_id/);
  assert.match(combined, /pl\.owner_user_id <> auth\.uid\(\)/);
});

test('current application and marketplace flows are wired into navigation and services', () => {
  const navigator = read('react_webiosand/src/navigation/AppNavigator.js');
  const applyScreen = read('react_webiosand/src/screens/ApplyScreen.js');
  const detailScreen = read('react_webiosand/src/screens/ListingDetailScreen.js');
  const service = read('react_webiosand/src/api/listingsService.js');
  const listingsDomain = read('react_webiosand/src/domain/listings.js');

  assert.match(navigator, /ProfileSetup/);
  assert.match(navigator, /Apply/);
  assert.match(navigator, /Applications/);
  assert.match(navigator, /Exchanges/);
  assert.match(navigator, /SwapProposal/);
  assert.match(navigator, /SwapProposals/);
  assert.match(navigator, /HandoffReview/);
  assert.match(navigator, /PlantTabIcon/);
  assert.match(navigator, /BrowseTabIcon/);
  assert.match(navigator, /ExchangesTabIcon/);
  assert.match(navigator, /tabBarHideOnKeyboard/);
  assert.match(navigator, /tabIconWrapActive/);
  assert.match(detailScreen, /Apply to Sit/);
  assert.match(detailScreen, /navigation\.navigate\('Apply'/);
  assert.match(applyScreen, /isIsoDate/);
  assert.match(service, /applyToListing/);
  assert.match(service, /getApplicationsForListing/);
  assert.match(service, /updateApplicationStatus/);
  assert.match(detailScreen, /Propose swap/);
  assert.match(detailScreen, /Start purchase handoff/);
  assert.match(service, /createSwapProposal/);
  assert.match(service, /acceptSwapProposal/);
  assert.match(service, /createListingHandoffReview/);
  assert.match(service, /buildListingInsertPayload/);
  assert.match(listingsDomain, /LISTING_TYPES/);
});

test('exchanges inbox has refresh, summary, and shared utility wiring', () => {
  const exchangesScreen = read('react_webiosand/src/screens/ExchangesScreen.js');
  const service = read('react_webiosand/src/api/listingsService.js');

  assert.match(exchangesScreen, /RefreshControl/);
  assert.match(exchangesScreen, /Needs action/);
  assert.match(exchangesScreen, /refreshControl/);
  assert.match(exchangesScreen, /getExchangeInboxCounts/);
  assert.match(service, /buildExchangeInbox/);
});

test('browse listings screen has search, filters, sorting, and shared utility wiring', () => {
  const listingsScreen = read('react_webiosand/src/screens/ListingsScreen.js');
  const browseUtils = read('react_webiosand/src/utils/browseListings.js');

  assert.match(listingsScreen, /TextInput/);
  assert.match(listingsScreen, /TYPE_FILTER_OPTIONS/);
  assert.match(listingsScreen, /SORT_OPTIONS/);
  assert.match(listingsScreen, /filterAndSortListings/);
  assert.match(listingsScreen, /open listings/);
  assert.match(browseUtils, /BROWSE_TYPE_FILTERS/);
  assert.match(browseUtils, /BROWSE_SORT_OPTIONS/);
});

test('user-facing text boxes share spellcheck and suggestion defaults', () => {
  const inputProps = read('react_webiosand/src/utils/textInputProps.js');
  const plantScreen = read('react_webiosand/src/screens/AddEditPlantScreen.js');
  const careProfileUtils = read('react_webiosand/src/utils/plantCareProfiles.js');
  const careProfileService = read('react_webiosand/src/api/commonPlantCareService.js');
  const listingScreen = read('react_webiosand/src/screens/PostListingScreen.js');
  const detailScreen = read('react_webiosand/src/screens/ListingDetailScreen.js');

  assert.match(inputProps, /spellCheck: true/);
  assert.match(inputProps, /autoCorrect: true/);
  assert.match(inputProps, /autoComplete: 'on'/);
  assert.match(inputProps, /inputMode: 'text'/);
  assert.match(inputProps, /inputMode: 'search'/);
  assert.match(plantScreen, /TEXTBOX_SPELLCHECK_PROPS/);
  assert.match(plantScreen, /FormHero/);
  assert.match(plantScreen, /PlantSketch/);
  assert.match(plantScreen, /CarePreview/);
  assert.match(plantScreen, /PLANT_AGE_OPTIONS/);
  assert.match(plantScreen, /ageDescription/);
  assert.match(plantScreen, /WATERING_FREQUENCY_UNITS/);
  assert.match(plantScreen, /wateringFrequencyUnit/);
  assert.match(plantScreen, /handleAutofillCare/);
  assert.match(plantScreen, /commonPlantCareService/);
  assert.match(plantScreen, /Autofill/);
  assert.match(careProfileUtils, /findBestPlantCareProfile/);
  assert.match(careProfileUtils, /buildCareProfilePatch/);
  assert.match(careProfileService, /common_plant_care_profiles/);
  assert.match(listingScreen, /TEXTBOX_SPELLCHECK_PROPS/);
  assert.match(listingScreen, /navigateToBrowseAfterPost/);
  assert.match(listingScreen, /getParent\(\)\?\.navigate\('Browse'/);
  assert.match(detailScreen, /PlantIllustration/);
  assert.match(detailScreen, /HeroVines/);
  assert.match(detailScreen, /CareTile/);
  assert.match(detailScreen, /PlantNotesCard/);
  assert.match(detailScreen, /Care snapshot/);
  assert.match(detailScreen, /label="Age"/);
});

test('auth screens handle confirmed-email Supabase sessions explicitly', () => {
  const loginScreen = read('react_webiosand/src/screens/LoginScreen.js');
  const registerScreen = read('react_webiosand/src/screens/RegisterScreen.js');

  assert.match(loginScreen, /data\?\.session/);
  assert.match(loginScreen, /navigation\.reset/);
  assert.match(loginScreen, /Check your email/);
  assert.match(registerScreen, /data\?\.session/);
  assert.match(registerScreen, /Confirm your email/);
  assert.match(registerScreen, /navigation\.replace\('Login'\)/);
});
