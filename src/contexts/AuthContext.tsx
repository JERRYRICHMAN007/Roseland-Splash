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

      if (error) {
        return false;
      }

      if (!user) {
        return false;
      }
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
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
      const result = await authService.signUp(userData);
      const { user, error } = result;

      if (error) {
        // Throw error so it can be caught and handled by the UI
        throw new Error(error);
      }

      if (!user) {
        return false;
      }
      
      // Set user state - even if profile isn't fully loaded, we have the user
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      return false;
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default context instead of throwing to handle hot reload gracefully
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => false,
      signup: async () => false,
      logout: async () => {},
      updateUser: async () => {},
      resetPassword: async () => ({ error: "Not available" }),
    };
  }
  return context;
};
