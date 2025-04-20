"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, callbackURL: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        console.log("session", session);

        // Handle the session data based on the better-auth structure
        if (session.data?.user) {
          setUser(session.data?.user as User);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Authentication error"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, callbackURL: string) => {
    try {
      setIsLoading(true);
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL, //redirect after successful login (optional)
      });
      // Handle the result data based on the better-auth structure
      if (result && "user" in result) {
        setUser(result.user as User);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Authentication error"));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
