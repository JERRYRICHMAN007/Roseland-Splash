/**
 * Backend API Service
 * Handles all API calls to the backend server
 */

// Detect if we're in production
// Check Vite's PROD flag, hostname, and Vercel-specific domains
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   window.location.hostname !== 'localhost' && 
   window.location.hostname !== '127.0.0.1' &&
   !window.location.hostname.includes('192.168') &&
   (window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('vercel.com') ||
    window.location.hostname.includes('roseland-splash')));

// Debug logging (only in production to help diagnose)
if (typeof window !== 'undefined') {
  console.log('🌍 Environment Detection:', {
    hostname: window.location.hostname,
    isProduction,
    viteProd: import.meta.env.PROD,
    viteMode: import.meta.env.MODE
  });
}

// Get API URL from environment or use defaults
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If explicitly set, use it (but warn if it's localhost in production)
  if (envUrl) {
    if (isProduction && envUrl.includes('localhost')) {
      console.warn('⚠️ WARNING: VITE_API_URL is set to localhost in production! This will not work.');
    }
    console.log('🔧 Using VITE_API_URL from environment:', envUrl);
    return envUrl;
  }
  
  // In production on Vercel, ALWAYS use relative paths (same domain)
  // Backend and frontend are served from the same domain
  if (isProduction) {
    console.log('✅ Production detected - using relative paths for API');
    // Return empty string to use relative paths
    // This means API calls will go to /api/... on the same domain
    return '';
  }
  
  // Development default
  console.log('🛠️ Development mode - using localhost:3002');
  return 'http://localhost:3002';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: string;
  };
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Check if API_BASE_URL is configured (only error in development)
  // In production, empty string means use relative paths (same domain)
  if (!API_BASE_URL && !isProduction) {
    const errorMsg = 'Backend API URL is not configured. Please set VITE_API_URL in your .env file';
    console.error(`❌ ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
    };
  }

  try {
    // Runtime check: if we're on a Vercel domain but API_BASE_URL is localhost, use relative path
    let finalBaseUrl = API_BASE_URL;
    if (typeof window !== 'undefined' && 
        (window.location.hostname.includes('vercel.app') || 
         window.location.hostname.includes('vercel.com') ||
         window.location.hostname.includes('roseland-splash')) &&
        API_BASE_URL && API_BASE_URL.includes('localhost')) {
      console.warn('⚠️ Overriding localhost API URL - using relative path for Vercel production');
      finalBaseUrl = '';
    }
    
    // If API_BASE_URL is empty, use relative path (same domain)
    // Otherwise, use the full URL
    const url = finalBaseUrl ? `${finalBaseUrl}${endpoint}` : endpoint;
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Clone the response so we can read it multiple times if needed
    const responseClone = response.clone();
    let data;
    
    try {
      data = await response.json();
      console.log(`📥 API Response (${response.status}):`, JSON.stringify(data).substring(0, 200));
    } catch (jsonError) {
      // If response is not JSON, get text instead
      try {
        const text = await responseClone.text();
        console.error(`❌ API Error (${response.status}): Non-JSON response:`, text);
        return {
          success: false,
          error: text || `Request failed with status ${response.status}`,
        };
      } catch (textError) {
        console.error(`❌ API Error (${response.status}): Could not read response:`, textError);
        return {
          success: false,
          error: `Request failed with status ${response.status}`,
        };
      }
    }

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      console.error(`❌ Error message:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log(`✅ API Success: ${endpoint}`, data);
    
    // Backend returns { success: true, user: {...}, session: {...} } for signup/login
    // Return it in the expected format: { success: true, data: { user: {...}, session: {...} } }
    if (data.user) {
      return {
        success: data.success !== false,
        data: {
          user: data.user,
          session: data.session,
        } as T,
        ...data,
      };
    }
    
    // For other endpoints that don't return user
    return {
      success: data.success !== false,
      data: data as T,
      ...data,
    };
  } catch (error: any) {
    console.error(`❌ API Exception: ${endpoint}`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = 'Network error. Please check if the backend server is running.';
    if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch failed')) {
      if (isProduction) {
        errorMessage = 'Cannot connect to backend server. Please ensure:\n' +
          '1. Your backend is deployed and running\n' +
          '2. VITE_API_URL is set in Vercel environment variables to your production backend URL\n' +
          '3. Your backend CORS is configured to allow requests from https://roseland-splash.vercel.app';
      } else {
        errorMessage = 'Cannot connect to backend server. Make sure it\'s running on http://localhost:3002';
      }
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'CORS error: Your backend server needs to allow requests from this origin. ' +
        (isProduction 
          ? 'Update FRONTEND_URL in your backend environment to https://roseland-splash.vercel.app'
          : 'Update FRONTEND_URL in your backend .env to http://localhost:8080');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Signup user
 */
export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<ApiResponse<SignupResponse>> {
  return apiRequest<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Logout user
 */
export async function logout(accessToken: string): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Update password
 */
export async function updatePassword(
  newPassword: string,
  accessToken: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>('/api/auth/update-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ newPassword }),
  });
}

/**
 * Get current user
 */
export async function getCurrentUser(accessToken: string): Promise<ApiResponse<SignupResponse>> {
  return apiRequest<SignupResponse>('/api/auth/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Health check
 */
export async function healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
  return apiRequest<{ status: string; message: string }>('/health');
}


