const assert = require('node:assert/strict');
const test = require('node:test');

const {
  REQUIRED_SUPABASE_ENV,
  createSupabaseConfig,
  getMissingSupabaseEnv,
  getSupabaseConfigError,
} = require('../../src/config/environment');

test('Supabase environment contract lists only public Expo variables', () => {
  assert.deepEqual(REQUIRED_SUPABASE_ENV, [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ]);
});

test('getMissingSupabaseEnv reports absent and blank values', () => {
  assert.deepEqual(
    getMissingSupabaseEnv({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: '   ',
    }),
    ['EXPO_PUBLIC_SUPABASE_ANON_KEY']
  );
});

test('createSupabaseConfig trims valid values and never exposes secret-only keys', () => {
  const config = createSupabaseConfig({
    EXPO_PUBLIC_SUPABASE_URL: ' https://example.supabase.co ',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: ' public-anon-key ',
    DATABASE_PASSWORD: 'do-not-use-client-side',
  });

  assert.deepEqual(config, {
    url: 'https://example.supabase.co',
    anonKey: 'public-anon-key',
  });
});

test('missing Supabase configuration returns a user-safe error', () => {
  const error = getSupabaseConfigError({});

  assert.match(error.message, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.match(error.message, /EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(error.message, /DATABASE_PASSWORD|SERVICE_ROLE|service_role/);
  assert.throws(() => createSupabaseConfig({}), /Missing Supabase configuration/);
});
