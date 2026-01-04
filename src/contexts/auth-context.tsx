"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/data";

interface AuthContextType {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("edgemakers_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("edgemakers_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (user: User) => {
    setUser(user);
    // Remove password before storing in localStorage for security
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(
      "edgemakers_user",
      JSON.stringify(userWithoutPassword)
    );
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("edgemakers_user");
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
