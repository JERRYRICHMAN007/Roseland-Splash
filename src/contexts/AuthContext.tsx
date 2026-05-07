import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import * as authService from "@/services/authService";
import * as backendApi from "@/services/backendApi";

export type UserRole = "customer" | "owner" | "admin";

function normalizeRole(raw: unknown): UserRole {
  if (raw === "owner" || raw === "admin" || raw === "customer") return raw;
  return "customer";
}

const PROFILE_FETCH_TIMEOUT_MS = 8_000;

function userFromSessionMetadata(sessionUser: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const md = (sessionUser.user_metadata || {}) as {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
  };
  return {
    id: sessionUser.id,
    firstName: md.first_name || "",
    lastName: md.last_name || "",
    email: sessionUser.email || "",
    phone: md.phone || "",
    createdAt: sessionUser.created_at || new Date().toISOString(),
    role: normalizeRole(md.role),
  };
}

async function getUserProfileWithTimeout(userId: string): Promise<User | null> {
  try {
    return await Promise.race([
      authService.getUserProfile(userId),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), PROFILE_FETCH_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  /** Store access: owner and admin may use the manager dashboard */
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type SignupResult = { ok: true; authenticated: boolean };

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User | null>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<SignupResult>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from Supabase session on mount (with timeout so we never stick on "Loading...")
  useEffect(() => {
    const AUTH_LOAD_TIMEOUT_MS = 10_000;

    const loadUser = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), AUTH_LOAD_TIMEOUT_MS);
      });

      const loadPromise = (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const profile = await getUserProfileWithTimeout(session.user.id);
            const user = profile ?? userFromSessionMetadata(session.user);
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          setState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      })();

      try {
        await Promise.race([loadPromise, timeoutPromise]);
        // Ensure loading is cleared (e.g. if timeout won before loadUser finished)
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();

    // Listen for auth state changes
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const profile = await getUserProfileWithTimeout(session.user.id);
            const user = profile ?? userFromSessionMetadata(session.user);
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else if (event === "SIGNED_OUT") {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await backendApi.login(email, password);
      if (!response.success) {
        return null;
      }

      const userData =
        response.data?.user ?? (response as { user?: User }).user;
      const sessionData =
        response.data?.session ??
        (response as { session?: { access_token: string; refresh_token?: string } })
          .session;

      if (!userData) {
        return null;
      }

      const supabase = getSupabaseClient();
      // Set browser session first so user_profiles RLS (auth.uid() = id) sees a JWT on the anon client.
      if (supabase && sessionData?.access_token) {
        await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token ?? "",
        });
      }

      const baseUser: User = {
        id: userData.id,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        phone: userData.phone || "",
        createdAt: userData.createdAt,
        role: normalizeRole((userData as { role?: unknown }).role),
      };

      let profile: User | null = null;
      if (supabase) {
        profile = await getUserProfileWithTimeout(userData.id);
      }

      const displayUser = profile ?? baseUser;
      setState({
        user: displayUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return displayUser;
    } catch {
      return null;
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<SignupResult> => {
    const result = await authService.signUp(userData);
    const { user, error } = result;

    if (error) {
      throw new Error(error);
    }

    if (!user) {
      throw new Error("Failed to create account. Please try again.");
    }

    const supabase = getSupabaseClient();
    const { data: sessionData } = supabase
      ? await supabase.auth.getSession()
      : { data: { session: null } };

    if (sessionData?.session?.user) {
      // Profile row may not exist yet (e.g. user_profiles upsert lag); never block signup UX on this.
      const profile = await getUserProfileWithTimeout(sessionData.session.user.id);
      const displayUser = profile ?? user;
      setState({
        user: displayUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return { ok: true, authenticated: true };
    }

    return { ok: true, authenticated: false };
  };

  const logout = async (): Promise<void> => {
    try {
      // Add timeout to logout to prevent hanging
      const logoutPromise = authService.signOut();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), 6000);
      });

      let signOutResult: any = { error: null };
      try {
        signOutResult = await Promise.race([logoutPromise, timeoutPromise]) as any;
      } catch (err: any) {
        if (err.message === "TIMEOUT") {
          signOutResult = { error: null };
        } else {
          signOutResult = { error: null }; // Still clear state
        }
      }
      
      // Always clear local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      // Still clear local state on error
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!state.user) return;

    try {
      const updates: any = {};
      if (userData.firstName) updates.firstName = userData.firstName;
      if (userData.lastName) updates.lastName = userData.lastName;
      if (userData.phone) updates.phone = userData.phone;

      const { user, error } = await authService.updateUserProfile(state.user.id, updates);

      if (!error && user) {
        setState((prev) => ({
          ...prev,
          user,
        }));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    return await authService.sendPasswordResetEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Auth] useAuth() used outside AuthProvider — returning a no-op stub (dev only)."
      );
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: async () => null,
        signup: async () => ({ ok: true, authenticated: false }),
        logout: async () => {},
        updateUser: async () => {},
        resetPassword: async () => ({ error: "Not available" }),
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
