const REQUIRED_SUPABASE_ENV = Object.freeze([
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
]);

function envValue(env, key) {
  return String(env?.[key] ?? '').trim();
}

/**
 * Lists required public Supabase environment variables that are not present.
 *
 * @param {object} env Environment-like key/value object.
 * @returns {Array<string>}
 */
function getMissingSupabaseEnv(env = process.env) {
  return REQUIRED_SUPABASE_ENV.filter((key) => !envValue(env, key));
}

/**
 * Builds the user-safe configuration error shown when Supabase is not wired.
 *
 * @param {object} env Environment-like key/value object.
 * @returns {Error | null}
 */
function getSupabaseConfigError(env = process.env) {
  const missing = getMissingSupabaseEnv(env);
  if (missing.length === 0) return null;

  return new Error(
    `Missing Supabase configuration: ${missing.join(', ')}. ` +
    'Create react_webiosand/.env with the public Expo Supabase keys, then restart Expo.'
  );
}

/**
 * Reads and validates the public Supabase settings used by the Expo client.
 *
 * @param {object} env Environment-like key/value object.
 * @returns {{url: string, anonKey: string}}
 */
function createSupabaseConfig(env = process.env) {
  const error = getSupabaseConfigError(env);
  if (error) throw error;

  return {
    url: envValue(env, 'EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: envValue(env, 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

module.exports = {
  REQUIRED_SUPABASE_ENV,
  createSupabaseConfig,
  getMissingSupabaseEnv,
  getSupabaseConfigError,
};
