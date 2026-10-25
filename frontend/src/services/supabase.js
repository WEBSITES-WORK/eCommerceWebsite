import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    !supabaseKey.includes('your-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase]: Missing or default VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. Please set these in your .env or Vercel environment variables.'
  );
}

/**
 * Single, production-configured Supabase client instance.
 * Configured with session persistence, automatic token refreshing, and URL token detection.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'novashop_supabase_auth',
    },
  }
);

/**
 * Returns the environment-aware base URL for authentication callbacks.
 * Supports Local Development (localhost:5173), Vercel Preview Deployments, and Production.
 *
 * @returns {string} Clean base site URL without trailing slash
 */
export const getSiteURL = () => {
  // 1. Client-side browser runtime detection (dynamically adapts to localhost or production domain)
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    // If not localhost or if no env var, origin is always accurate
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      return origin;
    }
    return origin;
  }

  // 2. Explicitly configured site URL
  let url = import.meta.env.VITE_SITE_URL;

  // 3. Fallback for static builds
  if (!url) {
    url = 'https://ecommercewebsite-dusky.vercel.app';
  }

  return url.replace(/\/+$/, '');
};

/**
 * Generates an absolute redirect URL for Supabase Auth flows
 * e.g., getAuthRedirectURL('/auth/confirm') => 'https://novashop.vercel.app/auth/confirm'
 *
 * @param {string} path - Target redirect path
 * @returns {string} Full redirect URL
 */
export const getAuthRedirectURL = (path = '/auth/confirm') => {
  const base = getSiteURL();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export default supabase;
