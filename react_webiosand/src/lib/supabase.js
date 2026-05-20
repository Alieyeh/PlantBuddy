import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseConfig, getSupabaseConfigError } from '../config/environment';

function createUnavailableSupabaseClient(error) {
  const throwConfigError = () => {
    throw error;
  };

  return {
    auth: {
      getUser: throwConfigError,
      signInWithPassword: throwConfigError,
      signUp: throwConfigError,
      signOut: throwConfigError,
      onAuthStateChange: throwConfigError,
    },
    from: throwConfigError,
    rpc: throwConfigError,
  };
}

export const supabaseConfigError = getSupabaseConfigError(process.env);
const supabaseConfig = supabaseConfigError ? null : createSupabaseConfig(process.env);

/**
 * Shared Supabase client for Auth and PostgREST calls. Expo exposes only
 * EXPO_PUBLIC_* environment variables to the bundled client application.
 */
export const supabase = supabaseConfigError
  ? createUnavailableSupabaseClient(supabaseConfigError)
  : createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
