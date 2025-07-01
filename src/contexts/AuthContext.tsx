
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
    
    let mounted = true; // Flag to prevent state updates if component unmounts

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // First, check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          throw sessionError;
        }

        if (session?.user && mounted) {
          console.log('Found existing session for user:', session.user.id);
          await processUserSession(session.user.id);
        } else {
          console.log('No existing session found');
          if (mounted) {
            setUser(null);
            setAuthError(null);
          }
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setAuthError(error.message || "Greška pri provjeri statusa prijave.");
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

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

        if (mounted) {
          console.log('Setting user data:', mappedUser.username, mappedUser.role);
          setUser(mappedUser);
          setAuthError(null);
        }
      } catch (error: any) {
        console.error("User data processing error:", error);
        if (mounted) {
          setAuthError(error.message || "Greška pri dohvaćanju korisničkih podataka.");
          setUser(null);
        }
        // Sign out on user data error
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
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processing SIGNED_IN event for user:', session.user.id);
          await processUserSession(session.user.id);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('Processing SIGNED_OUT event or no session');
          if (mounted) {
            setUser(null);
            setAuthError(null);
          }
        }
      } catch (error: any) {
        console.error("Auth state change error:", error);
        if (mounted) {
          setAuthError(error.message || "Greška pri provjeri statusa prijave.");
          setUser(null);
        }
      }
    });

    // Initialize auth state
    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      console.log('AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    console.log('=== Starting login process ===');
    setIsLoading(true);
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
        setIsLoading(false);
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
        setIsLoading(false);
        return false;
      }

      console.log('Supabase login successful, waiting for onAuthStateChange...');
      // onAuthStateChange listener will handle the rest automatically
      return true;

    } catch (error) {
      console.error('Login function threw exception:', error);
      setAuthError(error instanceof Error ? error.message : "Došlo je do greške pri prijavi");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('=== Starting logout process ===');
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError("Greška pri odjavi");
    } finally {
      setIsLoading(false);
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
