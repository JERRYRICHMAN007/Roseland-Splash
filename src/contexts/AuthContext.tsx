import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import * as authService from "@/services/authService";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
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

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile
          const user = await authService.getUserProfile(session.user.id);
          if (user) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading user session:", error);
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
            const user = await authService.getUserProfile(session.user.id);
            if (user) {
              setState({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            }
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, error } = await authService.signIn({ email, password });

      if (error || !user) {
        return false;
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<boolean> => {
    try {
      console.log("🔐 Starting signup process...");
      const { user, error } = await authService.signUp(userData);

      if (error) {
        console.error("❌ Signup error:", error);
        return false;
      }

      if (!user) {
        console.error("❌ Signup failed - no user returned");
        return false;
      }

      console.log("✅ Signup successful - setting user state");
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      console.error("❌ Signup exception:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.signOut();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
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
      console.error("Update user error:", error);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
