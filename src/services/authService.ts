/**
 * Authentication Service using Backend API
 * Handles signup, login, logout, password reset
 * 
 * This service now uses the backend API instead of direct Supabase calls
 * to avoid timeout issues and provide better error handling.
 */

import { getSupabaseClient } from "@/lib/supabase";
import { User } from "@/contexts/AuthContext";
import { getResetPasswordUrl } from "@/utils/getBaseUrl";
import * as backendApi from "./backendApi";

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 * Uses backend API for reliable authentication
 */
export const signUp = async (data: SignupData): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log("📝 Calling backend API for signup...", {
      email: data.email.toLowerCase().trim(),
    });

    const response = await backendApi.signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    if (!response.success) {
      // Preserve the exact error message from backend
      const errorMessage = response.error || "Failed to create account";
      
      // Check if it's an "already exists" error
      const isAlreadyExists = errorMessage.toLowerCase().includes('already exists') ||
                              errorMessage.toLowerCase().includes('already registered') ||
                              errorMessage.toLowerCase().includes('email already');
      
      return {
        user: null,
        error: errorMessage,
        // Add a flag to help frontend identify this specific error
        ...(isAlreadyExists && { isAlreadyExists: true }),
      };
    }

    // Handle both response formats: { data: { user: {...} } } or { user: {...} }
    const userData = response.data?.user || response.user;
    
    if (!userData) {
      return {
        user: null,
        error: response.error || "Failed to create account - no user data returned",
      };
    }

    const user: User = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone || '',
      createdAt: userData.createdAt,
    };

    console.log("✅ Signup complete - returning user:", user.email);
    return { user, error: null };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { user: null, error: error.message || "Failed to create account" };
  }
};

/**
 * Sign in a user
 * Uses backend API for reliable authentication
 */
export const signIn = async (data: LoginData): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log("🔐 Calling backend API for login...", {
      email: data.email.toLowerCase().trim(),
    });

    const response = await backendApi.login(data.email, data.password);

    if (!response.success) {
      return {
        user: null,
        error: response.error || "Failed to sign in",
      };
    }

    // Handle both response formats: { data: { user: {...}, session: {...} } } or { user: {...}, session: {...} }
    const userData = response.data?.user || response.user;
    const sessionData = response.data?.session || response.session;
    
    if (!userData) {
      return {
        user: null,
        error: response.error || "Failed to sign in - no user data returned",
      };
    }

    // Set session in Supabase client for compatibility with other parts of the app
    // Do this in the background to avoid blocking login
    const supabase = getSupabaseClient();
    if (supabase && sessionData) {
      // Set session in background - don't wait for it
      supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      }).then(() => {
        console.log("✅ Session set in Supabase client");
      }).catch((sessionError) => {
        console.warn("⚠️ Failed to set session in Supabase client (non-blocking):", sessionError);
        // This is non-blocking - login is still successful
      });
    }

    const user: User = {
      id: userData.id,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email,
      phone: userData.phone || '',
      createdAt: userData.createdAt,
    };

    console.log("✅ Login complete - user loaded:", user.email);
    return { user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { user: null, error: error.message || "Failed to sign in" };
  }
};

/**
 * Sign out current user
 * Uses backend API for reliable logout
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    // Get current session token
    const supabase = getSupabaseClient();
    let accessToken: string | null = null;

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || null;
      } catch (err) {
        console.warn("⚠️ Could not get session token:", err);
      }
    }

    // Call backend logout if we have a token
    if (accessToken) {
      try {
        await backendApi.logout(accessToken);
        console.log("✅ Backend logout successful");
      } catch (err) {
        console.warn("⚠️ Backend logout failed, continuing with local logout:", err);
      }
    }

    // Also sign out from Supabase client
    if (supabase) {
      try {
        await supabase.auth.signOut();
        console.log("✅ Supabase client logout successful");
      } catch (err) {
        console.warn("⚠️ Supabase client logout failed:", err);
      }
    }

    return { error: null };
  } catch (error: any) {
    console.error("❌ Logout exception:", error);
    // Return success anyway so local state can be cleared
    return { error: null };
  }
};

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("⚠️ Supabase client not available");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // 404 (not found) is expected if profile doesn't exist yet
      if (error.code === 'PGRST116') {
        console.log("ℹ️ User profile not found in database (may not exist yet)");
      } else {
        console.error("❌ Error fetching user profile:", error);
      }
      return null;
    }

    if (!data) {
      console.log("ℹ️ No user profile data returned");
      return null;
    }

    console.log("✅ User profile found:", data.email);
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("❌ Exception fetching user profile:", error);
    return null;
  }
};

/**
 * Get current session user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return null;
    }

    return await getUserProfile(authUser.id);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Send password reset email
 * Uses backend API for reliable password reset
 */
export const sendPasswordResetEmail = async (email: string): Promise<{ error: string | null }> => {
  try {
    console.log("📧 Requesting password reset via backend API...", {
      email: email.toLowerCase().trim(),
    });

    const response = await backendApi.requestPasswordReset(email);

    if (!response.success) {
      return { error: response.error || "Failed to send password reset email" };
    }

    return { error: null };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { error: error.message || "Failed to send password reset email" };
  }
};

/**
 * Update user password
 * Uses backend API for reliable password update
 */
export const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
  try {
    // Get current session token
    const supabase = getSupabaseClient();
    let accessToken: string | null = null;

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || null;
      } catch (err) {
        console.warn("⚠️ Could not get session token:", err);
      }
    }

    if (!accessToken) {
      return { error: "No active session. Please click the reset link from your email again or request a new password reset." };
    }

    console.log("🔑 Updating password via backend API...");
    const response = await backendApi.updatePassword(newPassword, accessToken);

    if (!response.success) {
      return { error: response.error || "Failed to update password. Please try again." };
    }

    return { error: null };
  } catch (error: any) {
    console.error("Update password error:", error);
    return { error: error.message || "Failed to update password. Please try again." };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<{ user: User | null; error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { user: null, error: "Database not configured" };
  }

  try {
    const updateData: any = {};
    if (updates.firstName) updateData.first_name = updates.firstName.trim();
    if (updates.lastName) updateData.last_name = updates.lastName.trim();
    if (updates.phone) updateData.phone = updates.phone.trim();

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      return { user: null, error: error.message };
    }

    const user = await getUserProfile(userId);
    return { user, error: null };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { user: null, error: error.message || "Failed to update profile" };
  }
};

