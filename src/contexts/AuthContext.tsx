
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setAuthError(null);
    setIsLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change event: ${event}`);
      
      try {
        if (session?.user) {
          // If session exists, fetch user data from our 'users' table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            throw new Error("Korisnik nije pronađen u bazi podataka");
          }

          if (userData && userData.is_active) {
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role as UserRole,
              evaluatorPosition: userData.evaluator_position || undefined,
              isActive: userData.is_active,
              password: userData.password,
            });
          } else {
            // If user doesn't exist in our DB or is inactive, sign them out
            console.error("User not found or inactive in DB, signing out.");
            setUser(null);
            await supabase.auth.signOut();
          }
        } else {
          // If no session, user is not logged in
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setAuthError(error instanceof Error ? error.message : "Nepoznata greška pri provjeri sesije");
        setUser(null);
      } finally {
        // CRITICAL: Always set loading to false after check is complete
        setIsLoading(false);
      }
    });

    // Clean up listener when component is destroyed
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: String, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log('=== NEW SIMPLIFIED LOGIN ATTEMPT ===');
      
      // 1. Create email for Supabase authentication based on input.
      let email;
      const upperIdentifier = identifier.toUpperCase();

      if (upperIdentifier === 'ADMIN') {
        email = `admin@bioins.local`;
      } else if (!isNaN(Number(identifier)) && Number(identifier) >= 1 && Number(identifier) <= 12) {
        email = `evaluator${Number(identifier)}@bioins.local`;
      } else {
        console.error(`Invalid identifier format: '${identifier}'. Please login with 'ADMIN' or evaluator position number (1-12).`);
        setAuthError("Nevažeći format identifikatora. Koristite 'ADMIN' ili broj pozicije evaluatora (1-12).");
        setIsLoading(false);
        return false;
      }
      
      console.log(`Attempting Supabase login with email: ${email}`);

      // 2. Login exclusively through Supabase Auth service.
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Supabase signInWithPassword error:', error.message);
        setAuthError("Pogrešno korisničko ime ili lozinka");
        setIsLoading(false);
        return false;
      }

      // If login is successful, onAuthStateChange listener will automatically
      // fetch user profile and set state (including isLoading).
      return true;

    } catch (error) {
      console.error('Login function threw exception:', error);
      setAuthError(error instanceof Error ? error.message : "Došlo je do greške pri prijavi");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
    // Navigation will happen automatically when onAuthStateChange sets user to null
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, authError }}>
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
