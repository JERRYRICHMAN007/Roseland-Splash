import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Debug: Check if environment variables are being loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging (remove after confirming it works)
if (import.meta.env.MODE === 'development') {
  console.log('[DEBUG] Environment check:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseKey ? 'SET' : 'MISSING',
    allEnv: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
}

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
    console.log('✅ Supabase client initialized successfully');
    console.log('🔍 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn(
    '⚠️ Supabase environment variables not found. Database features will not work.\n' +
    'To enable database: \n' +
    '1. Ensure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    '2. Restart your dev server (npm run dev)'
  );
}

// Export a function that returns the client or null
export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};

// Export the client directly for backward compatibility (will be null if not configured)
export { supabase };

