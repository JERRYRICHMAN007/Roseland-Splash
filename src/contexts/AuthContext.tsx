import React, { createContext, useContext, useState, useEffect } from "react";

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
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersStr = localStorage.getItem("users");
      const users: Array<User & { password: string }> = usersStr
        ? JSON.parse(usersStr)
        : [];

      // Find user by email
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return false; // User not found
      }

      // Simple password check (in production, use proper password hashing)
      if (user.password !== password) {
        return false; // Wrong password
      }

      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = user;

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setState({
        user: userWithoutPassword,
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
      // Get existing users
      const usersStr = localStorage.getItem("users");
      const users: Array<User & { password: string }> = usersStr
        ? JSON.parse(usersStr)
        : [];

      // Check if email already exists
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (emailExists) {
        return false; // Email already registered
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // In production, hash this!
        createdAt: new Date().toISOString(),
      };

      // Add to users array
      users.push(newUser);

      // Save users to localStorage
      localStorage.setItem("users", JSON.stringify(users));

      // Remove password before storing user
      const { password: _, ...userWithoutPassword } = newUser;

      // Save user to localStorage (auto-login)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setState((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateUser,
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

