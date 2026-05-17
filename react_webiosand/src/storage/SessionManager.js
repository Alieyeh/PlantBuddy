import { supabase } from '../lib/supabase';

/**
 * Thin compatibility wrapper around Supabase Auth session calls. Older screens
 * still speak in "session manager" terms, while Supabase owns persistence.
 */
export const SessionManager = {
  /**
   * Reports whether Supabase currently has a persisted auth session.
   *
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },

  /**
   * Signs the current user out and clears Supabase's persisted session.
   *
   * @returns {Promise<void>}
   */
  async clear() {
    await supabase.auth.signOut();
  },

  /**
   * Returns the current user's Supabase UUID when logged in.
   *
   * @returns {Promise<string | null>}
   */
  async getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  },
};
