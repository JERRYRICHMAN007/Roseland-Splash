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
  
  // Default to localhost for development
  return 'http://localhost:8080';
};

/**
 * Get the reset password URL for the current environment
 */
export const getResetPasswordUrl = (): string => {
  return `${getBaseUrl()}/reset-password`;
};

