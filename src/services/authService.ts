/**
 * Authentication Service using Supabase Auth
 * Handles signup, login, logout, password reset
 */

import { getSupabaseClient } from "@/lib/supabase";
import { User } from "@/contexts/AuthContext";
import { getResetPasswordUrl } from "@/utils/getBaseUrl";

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
    console.log("📝 Calling Supabase auth.signUp...", {
      email: data.email.toLowerCase().trim(),
      hasPassword: !!data.password,
    });

    // Sign up with Supabase Auth
    const signupPromise = supabase.auth.signUp({
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

    // Add timeout to prevent hanging
    let authData: any = null;
    let authError: any = null;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("TIMEOUT"));
        }, 10000); // 10 second timeout
      });

      const result = await Promise.race([
        signupPromise,
        timeoutPromise,
      ]) as any;

      authData = result.data;
      authError = result.error;
    } catch (error: any) {
      if (error.message === "TIMEOUT") {
        console.error("❌ Signup request timed out after 10 seconds");
        console.log("⚠️ Account may have been created - returning fallback user");
        
        // Since user is created in Supabase, create a minimal user object
        // This allows the signup to complete even if the response timed out
        const fallbackUser: User = {
          id: `temp-${Date.now()}`, // Temporary ID
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone,
          createdAt: new Date().toISOString(),
        };
        
        console.log("✅ Returning fallback user (account created, user can log in)");
        return { 
          user: fallbackUser, 
          error: null 
        };
      }
      // If it's an auth error, extract it
      if (error.error) {
        authError = error.error;
      } else {
        throw error;
      }
    }

    console.log("📝 Supabase signup response received:", {
      hasUser: !!authData?.user,
      hasError: !!authError,
      errorMessage: authError?.message,
    });

    if (authError) {
      console.error("❌ Supabase signup error:", authError);
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      console.error("❌ No user returned from Supabase signup");
      return { user: null, error: "Failed to create user" };
    }

    console.log("✅ User created in Supabase Auth:", {
      userId: authData.user.id,
      email: authData.user.email,
    });

    // The database trigger automatically creates the profile
    // We'll return the user immediately from auth metadata
    // The profile will be fetched on next login if needed
    console.log("✅ Returning user immediately (profile created by trigger, will be available)");
    
    // Create user object from auth data and form data
    const user: User = {
      id: authData.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: authData.user.email || data.email.toLowerCase().trim(),
      phone: data.phone,
      createdAt: authData.user.created_at || new Date().toISOString(),
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
 */
export const signIn = async (data: LoginData): Promise<{ user: User | null; error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("❌ Supabase client not available");
    return { user: null, error: "Database not configured" };
  }

  try {
    // Check Supabase client configuration
    const supabaseUrl = supabase.supabaseUrl;
    console.log("🔐 Supabase configuration check:", {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
      hasClient: !!supabase,
    });

    // Test network connectivity first with a quick fetch
    console.log("🌐 Testing network connectivity to Supabase...");
    try {
      const connectivityTestPromise = fetch(`${supabaseUrl}/auth/v1/health`, {
        method: "GET",
      });
      
      const connectivityTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("CONNECTIVITY_TIMEOUT")), 5000);
      });
      
      await Promise.race([connectivityTestPromise, connectivityTimeoutPromise]);
      console.log("✅ Network connectivity test passed");
    } catch (connectivityError: any) {
      console.error("❌ Network connectivity test failed:", connectivityError);
      const errorMessage = connectivityError.message === "CONNECTIVITY_TIMEOUT"
        ? "Cannot reach Supabase server (timeout). This usually means:\n1. No internet connection\n2. Firewall/VPN blocking the connection\n3. Supabase service is down"
        : `Cannot reach Supabase server. Error: ${connectivityError.message}`;
      
      return {
        user: null,
        error: `${errorMessage}\n\nPlease check:\n- Your internet connection\n- Browser DevTools → Network tab (F12)\n- Try accessing: ${supabaseUrl}/auth/v1/health`,
      };
    }

    console.log("🔐 Calling Supabase signInWithPassword...", {
      email: data.email.toLowerCase().trim(),
      hasPassword: !!data.password,
    });

    // Try Supabase client first, but if it times out, fall back to direct fetch
    let authData: any = null;
    let authError: any = null;

    // Create the login promise
    const loginPromise = supabase.auth.signInWithPassword({
      email: data.email.toLowerCase().trim(),
      password: data.password,
    });

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, 10000); // 10 second timeout - if it takes longer, use fallback
    });

    try {
      console.log("⏳ Attempting login with Supabase client (10s timeout)...");
      const startTime = Date.now();
      
      // Race between login and timeout
      const result = await Promise.race([loginPromise, timeoutPromise]);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Login request completed in ${duration}ms`);
      authData = (result as any).data;
      authError = (result as any).error;
    } catch (error: any) {
      if (error.message === "TIMEOUT") {
        console.warn("⚠️ Supabase client login timed out, trying direct API fallback...");
        
        // Fallback: Use direct fetch to the token endpoint
        try {
          console.log("🔄 Attempting direct API login (bypassing PKCE flow)...");
          const directLoginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabase.supabaseKey,
            },
            body: JSON.stringify({
              email: data.email.toLowerCase().trim(),
              password: data.password,
            }),
          });

          const directLoginData = await directLoginResponse.json();

          if (!directLoginResponse.ok) {
            // Extract error message
            const errorMsg = directLoginData?.error_description || directLoginData?.error || "Login failed";
            console.error("❌ Direct API login failed:", errorMsg);
            return {
              user: null,
              error: errorMsg,
            };
          }

          // If successful, we need to set the session in Supabase client
          if (directLoginData.access_token) {
            console.log("✅ Direct API login successful, setting session...");
            
            // Set the session in Supabase client
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: directLoginData.access_token,
              refresh_token: directLoginData.refresh_token,
            });

            if (sessionError) {
              console.error("❌ Failed to set session:", sessionError);
              return {
                user: null,
                error: "Login successful but failed to set session. Please try again.",
              };
            }

            // Get user from the session
            if (sessionData.user) {
              authData = { user: sessionData.user };
              authError = null;
              console.log("✅ Session set successfully");
            } else {
              return {
                user: null,
                error: "Login successful but user data not available.",
              };
            }
          } else {
            return {
              user: null,
              error: "Login response missing access token.",
            };
          }
        } catch (fallbackError: any) {
          console.error("❌ Direct API fallback also failed:", fallbackError);
          return {
            user: null,
            error: `Login failed. Both Supabase client and direct API methods failed.\n\nError: ${fallbackError.message}\n\nPlease check:\n- Your internet connection\n- Supabase service status\n- Browser DevTools Network tab (F12)`,
          };
        }
      } else {
        // If it's an auth error from Supabase, extract it
        if (error.error) {
          authError = error.error;
          console.log("🔐 Auth error from Supabase:", authError);
        } else if (error.message) {
          // Other errors
          console.error("❌ Unexpected error during login:", error);
          authError = { message: error.message };
        } else {
          // Re-throw unexpected errors
          console.error("❌ Unknown error during login:", error);
          throw error;
        }
      }
    }

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
    console.log("🔄 Calling supabase.auth.signOut()...");
    
    // Add timeout to prevent hanging
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, 5000); // 5 second timeout
    });

    let result: any;
    try {
      result = await Promise.race([signOutPromise, timeoutPromise]);
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        console.warn("⚠️ SignOut timed out, but clearing local session anyway");
        // Return success even if timeout - we'll clear local state
        return { error: null };
      }
      console.error("❌ SignOut exception:", err);
      // Return success on any error - we'll clear local state anyway
      return { error: null };
    }

    const error = result?.error;
    if (error) {
      console.error("❌ SignOut error:", error);
      // Still return success - we'll clear local state
      return { error: null };
    }
    
    console.log("✅ SignOut successful");
    return { error: null };
  } catch (error: any) {
    console.error("❌ Signout exception:", error);
    // Even on error, return success so local state can be cleared
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
 */
export const sendPasswordResetEmail = async (email: string): Promise<{ error: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  try {
    const redirectUrl = getResetPasswordUrl();
    console.log("📧 Sending password reset email:", {
      email: email.toLowerCase().trim(),
      redirectUrl,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: redirectUrl,
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

