import { supabase } from '../lib/supabase';

export const SessionManager = {
  async isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },

  async clear() {
    await supabase.auth.signOut();
  },

  async getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  },
};
