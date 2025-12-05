/**
 * Backend API Service
 * Handles all API calls to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

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
  try {
    const url = `${API_BASE_URL}${endpoint}`;
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
      errorMessage = 'Cannot connect to backend server. Make sure it\'s running on http://localhost:3002';
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


