import { createClient } from '@supabase/supabase-js';

/**
 * Custom storage adapter using sessionStorage instead of localStorage.
 *
 * WHY: localStorage is shared across ALL browser tabs on the same domain.
 * If you open tab A as a recruiter and tab B as a seeker, logging in on
 * tab B overwrites the shared token and breaks tab A.
 *
 * sessionStorage is tab-isolated — each tab has its own independent session.
 * Sessions persist through page refreshes within the same tab but are
 * cleared when the tab is closed.
 */
const tabStorage = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key),
};

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: tabStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
