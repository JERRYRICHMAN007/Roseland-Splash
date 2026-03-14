/**
 * Get the base URL for the current environment
 * Automatically detects localhost vs production
 */
export const getBaseUrl = (): string => {
  // In browser environment
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return origin;
  }
  
  // Fallback for server-side or build time
  // Check environment variables
  const vercelUrl = import.meta.env.VITE_VERCEL_URL;
  const customDomain = import.meta.env.VITE_PRODUCTION_URL;
  
  if (customDomain) {
    return customDomain;
  }
  
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // In production, require an explicit URL; never fall back to localhost
  if (import.meta.env.PROD) {
    console.error('Production URL not configured: set VITE_VERCEL_URL or VITE_PRODUCTION_URL in your environment.');
    throw new Error('Production URL not configured. Set VITE_VERCEL_URL or VITE_PRODUCTION_URL.');
  }

  // Development fallback
  return 'http://localhost:8080';
};

/**
 * Get the reset password URL for the current environment
 */
export const getResetPasswordUrl = (): string => {
  return `${getBaseUrl()}/reset-password`;
};

