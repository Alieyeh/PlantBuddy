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
    'react_webiosand/src/lib/supabase.js',
    'react_webiosand/src/storage/SessionManager.js',
    'react_webiosand/src/api/apiService.js',
    'react_webiosand/src/api/listingsService.js',
    'react_webiosand/src/screens/LoginScreen.js',
    'react_webiosand/src/screens/RegisterScreen.js',
    'react_webiosand/src/screens/PlantsScreen.js',
    'react_webiosand/src/screens/AddEditPlantScreen.js',
    'react_webiosand/src/screens/ListingsScreen.js',
    'react_webiosand/src/screens/ListingDetailScreen.js',
    'react_webiosand/src/screens/PostListingScreen.js',
  ].forEach((file) => assert.equal(exists(file), true, `${file} should exist`));
});

test('package.json exposes runnable app and test scripts', () => {
  const pkg = JSON.parse(read('react_webiosand/package.json'));

  assert.equal(pkg.scripts.start, 'expo start');
  assert.equal(pkg.scripts.web, 'expo start --web');
  assert.equal(pkg.scripts.test, 'npm run test:unit && npm run test:smoke');
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.ok(pkg.dependencies.expo);
});

test('Supabase client reads only public Expo environment variables', () => {
  const supabaseClient = read('react_webiosand/src/lib/supabase.js');

  assert.match(supabaseClient, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(supabaseClient, /EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(supabaseClient, /SERVICE_ROLE|service_role|DATABASE_PASSWORD/);
});

test('database schema and RLS files include the current MVP tables', () => {
  const schema = read('android_only/db/sql_build_tables.sql');
  const rls = read('android_only/db/rls_policies.sql');

  [
    'CREATE TABLE IF NOT EXISTS users',
    'CREATE TABLE IF NOT EXISTS owner_profiles',
    'CREATE TABLE IF NOT EXISTS sitter_profiles',
    'CREATE TABLE IF NOT EXISTS plants',
    'CREATE TABLE IF NOT EXISTS plant_listings',
    'CREATE TABLE IF NOT EXISTS listing_applications',
    'CREATE TABLE IF NOT EXISTS contracts',
  ].forEach((statement) => assert.match(schema, new RegExp(statement)));

  [
    'ALTER TABLE users',
    'ALTER TABLE plants',
    'ALTER TABLE plant_listings',
    'CREATE POLICY "plants_insert_own"',
    'CREATE POLICY "plant_listings_select_open"',
  ].forEach((statement) => assert.match(rls, new RegExp(statement)));
});

test('current listing detail still marks application flow as not implemented', () => {
  const detailScreen = read('react_webiosand/src/screens/ListingDetailScreen.js');

  assert.match(detailScreen, /Apply to Sit/);
  assert.match(detailScreen, /Application flow is in Stage 2/);
});
