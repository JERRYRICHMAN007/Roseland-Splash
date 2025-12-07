import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Debug: Check if environment variables are being loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging removed in production

// Create Supabase client only if environment variables are available
// This prevents the app from crashing if .env is missing or not loaded
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== '' && supabaseKey !== '') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE flow for better security
      },
      global: {
        headers: {
          'x-client-info': 'rollsland-splash'
        }
      }
    });
  } catch (error) {
    // Silent error in production
    supabase = null;
  }
}

// Export a function that returns the client or null
export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};

// Export the client directly for backward compatibility (will be null if not configured)
export { supabase };

