
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
    console.log('=== AuthProvider: Setting up auth state listener ===');
    
    const processUserSession = async (userId: string) => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .eq('is_active', true)
          .single();

        if (error || !userData) {
          console.error("User not found in users table or inactive:", error);
          throw new Error("Korisnik nije pronađen u bazi podataka ili je neaktivan.");
        }

        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          role: userData.role as UserRole,
          evaluatorPosition: userData.evaluator_position || undefined,
          isActive: userData.is_active,
          password: userData.password,
        };

        console.log('Setting user data:', mappedUser.username, mappedUser.role);
        setUser(mappedUser);
        setAuthError(null);
      } catch (error: any) {
        console.error("User data processing error:", error);
        setAuthError(error.message || "Greška pri dohvaćanju korisničkih podataka.");
        setUser(null);
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error during signout cleanup:", signOutError);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change event: ${event}`, session?.user?.id || 'no user');
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processing SIGNED_IN event for user:', session.user.id);
          await processUserSession(session.user.id);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('Processing SIGNED_OUT event or no session');
          setUser(null);
          setAuthError(null);
        }
      } catch (error: any) {
        console.error("Auth state change error:", error);
        setAuthError(error.message || "Greška pri provjeri statusa prijave.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        processUserSession(session.user.id).finally(() => setIsLoading(false));
      } else {
        console.log('No existing session found');
        setUser(null);
        setAuthError(null);
        setIsLoading(false);
      }
    });

    // Cleanup function
    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    console.log('=== Starting login process ===');
    setAuthError(null);
    
    try {
      // Create email for Supabase authentication based on input
      let email;
      const upperIdentifier = identifier.toUpperCase();

      if (upperIdentifier === 'ADMIN') {
        email = 'admin@bioins.local';
      } else if (!isNaN(Number(identifier)) && Number(identifier) >= 1 && Number(identifier) <= 12) {
        email = `evaluator${Number(identifier)}@bioins.local`;
      } else {
        console.error(`Invalid identifier format: '${identifier}'`);
        setAuthError("Nevažeći format identifikatora. Koristite 'ADMIN' ili broj pozicije evaluatora (1-12).");
        return false;
      }
      
      console.log(`Attempting Supabase login with email: ${email}`);

      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Supabase signInWithPassword error:', error.message);
        setAuthError("Pogrešno korisničko ime ili lozinka");
        return false;
      }

      console.log('Supabase login successful, waiting for onAuthStateChange...');
      // onAuthStateChange listener will handle the rest automatically
      return true;

    } catch (error) {
      console.error('Login function threw exception:', error);
      setAuthError(error instanceof Error ? error.message : "Došlo je do greške pri prijavi");
      return false;
    }
  };

  const logout = async () => {
    console.log('=== Starting logout process ===');
    try {
      await supabase.auth.signOut();
      // Don't manually set user/error here - let onAuthStateChange handle it
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError("Greška pri odjavi");
    }
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
