/**
 * Authentication Service using Supabase Auth
 * Handles signup, login, logout, password reset
 */

import { getSupabaseClient } from "@/lib/supabase";
import { User } from "@/contexts/AuthContext";

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
 */
export const signUp = async (data: SignupData): Promise<{ user: User | null; error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { user: null, error: "Database not configured" };
  }

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: "Failed to create user" };
    }

    // The database trigger will automatically create the profile
    // We just need to wait a moment and then fetch it
    console.log("⏳ Waiting for database trigger to create user profile...", {
      userId: authData.user.id,
      email: data.email,
    });

    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to fetch the profile (created by trigger)
    let user = await getUserProfile(authData.user.id);
    
    // If profile doesn't exist yet, try a few more times (trigger might need a moment)
    if (!user) {
      console.log("⏳ Profile not found yet, retrying...");
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        user = await getUserProfile(authData.user.id);
        if (user) break;
      }
    }

    if (!user) {
      console.warn("⚠️ Profile not found after trigger - it may be created on first login");
      // Return user from auth metadata as fallback
      if (authData.user.email) {
        const fallbackUser: User = {
          id: authData.user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: authData.user.email,
          phone: data.phone,
          createdAt: authData.user.created_at || new Date().toISOString(),
        };
        console.log("⚠️ Returning user from auth metadata (profile will be available after login)");
        return { 
          user: fallbackUser, 
          error: null 
        };
      }
      return { 
        user: null, 
        error: "User created but profile not found. Please try logging in - your profile will be created automatically." 
      };
    }

    console.log("✅ User profile found (created by trigger):", user.email);
    return { user, error: null };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { user: null, error: error.message || "Failed to create account" };
  }
};

/**
 * Sign in a user
 */
export const signIn = async (data: LoginData): Promise<{ user: User | null; error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("❌ Supabase client not available");
    return { user: null, error: "Database not configured" };
  }

  try {
    console.log("🔐 Calling Supabase signInWithPassword...", {
      email: data.email.toLowerCase().trim(),
      hasPassword: !!data.password,
    });

    // Wrap in Promise to catch any hanging issues
    const authPromise = supabase.auth.signInWithPassword({
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });

    // Add a timeout to detect if the request hangs
    const timeoutId = setTimeout(() => {
      console.error("❌ Login request is taking too long (>10 seconds)");
    }, 10000);

    const { data: authData, error: authError } = await authPromise;
    clearTimeout(timeoutId);

    console.log("🔐 signInWithPassword response:", {
      hasUser: !!authData?.user,
      hasError: !!authError,
      errorMessage: authError?.message,
    });

    if (authError) {
      console.error("❌ Auth error:", authError);
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      console.error("❌ No user returned from signInWithPassword");
      return { user: null, error: "Failed to sign in" };
    }

    console.log("🔐 Login successful, fetching user profile...", {
      userId: authData.user.id,
      email: authData.user.email,
    });

    // Get user profile (trigger should have created it, but wait a moment if needed)
    let user = await getUserProfile(authData.user.id);

    // If profile doesn't exist, wait a moment and retry (trigger might still be processing)
    if (!user) {
      console.log("⏳ Profile not found, waiting for trigger...");
      await new Promise(resolve => setTimeout(resolve, 500));
      user = await getUserProfile(authData.user.id);
    }

    // If profile still doesn't exist, try to create it from auth metadata
    if (!user && authData.user.user_metadata) {
      const { first_name, last_name, phone } = authData.user.user_metadata;
      if (first_name && last_name && phone) {
        console.log("📝 Attempting to create profile from metadata...");
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            first_name,
            last_name,
            phone,
            email: authData.user.email || "",
          });

        if (!profileError) {
          console.log("✅ Profile created successfully");
          user = await getUserProfile(authData.user.id);
        } else {
          console.warn("⚠️ Could not create user profile:", profileError);
          // Return user with metadata as fallback
          if (authData.user.email) {
            console.log("⚠️ Using fallback user from auth metadata");
            user = {
              id: authData.user.id,
              firstName: first_name || "",
              lastName: last_name || "",
              email: authData.user.email,
              phone: phone || "",
              createdAt: authData.user.created_at || new Date().toISOString(),
            };
          }
        }
      }
    }

    // If still no user, create minimal profile from email
    if (!user && authData.user.email) {
      console.log("⚠️ Creating minimal user from email only");
      user = {
        id: authData.user.id,
        firstName: authData.user.user_metadata?.first_name || "",
        lastName: authData.user.user_metadata?.last_name || "",
        email: authData.user.email,
        phone: authData.user.user_metadata?.phone || "",
        createdAt: authData.user.created_at || new Date().toISOString(),
      };
    }

    if (!user) {
      console.error("❌ Failed to get or create user profile");
      return { user: null, error: "Failed to load user profile" };
    }

    console.log("✅ Login complete - user loaded:", user.email);
    return { user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { user: null, error: error.message || "Failed to sign in" };
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (error: any) {
    console.error("Signout error:", error);
    return { error: error.message || "Failed to sign out" };
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
 */
export const sendPasswordResetEmail = async (email: string): Promise<{ error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { error: error.message || "Failed to send password reset email" };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  try {
    // First, verify we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return { error: "Session error. Please click the reset link again or request a new one." };
    }
    
    if (!session) {
      return { error: "No active session. Please click the reset link from your email again or request a new password reset." };
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return { error: error.message || "Failed to update password. Please try again." };
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

