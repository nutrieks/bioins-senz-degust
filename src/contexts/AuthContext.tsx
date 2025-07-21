
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { cleanupAuthStorage, checkStorageHealth, recoverFromAuthLoop } from "@/utils/authStorage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isUnmountedRef = useRef(false);
  const authOperationInProgress = useRef(false);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing with storage health check');

    // STEP 1: Check storage health on startup
    const isStorageHealthy = checkStorageHealth();
    if (!isStorageHealthy) {
      console.log('🚨 Unhealthy storage detected, cleaning up...');
      recoverFromAuthLoop();
    }

    // STEP 2: Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmountedRef.current || authOperationInProgress.current) return;

      console.log('🔐 Auth state change:', event, session?.user?.id);

      // Prevent multiple simultaneous operations
      authOperationInProgress.current = true;

      try {
        if (session?.user) {
          // Validate user with database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error || !userData || !userData.is_active) {
            console.warn('🚨 Invalid/inactive user - signing out');
            setUser(null);
            setLoading(false);
            cleanupAuthStorage();
            await supabase.auth.signOut();
            return;
          }

          const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role as any,
            evaluatorPosition: userData.evaluator_position || undefined,
            isActive: userData.is_active,
            password: userData.password
          };
          
          setUser(mappedUser);
          console.log('✅ User validated and set:', mappedUser.username);
        } else {
          setUser(null);
          console.log('🔐 No session - user cleared');
        }
      } catch (error) {
        console.error('🚨 Auth validation error:', error);
        setUser(null);
        cleanupAuthStorage();
        await supabase.auth.signOut();
      } finally {
        if (!isUnmountedRef.current) {
          setLoading(false);
          authOperationInProgress.current = false;
        }
      }
    });

    // STEP 3: Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('🔐 Existing session found');
        // The onAuthStateChange will handle this
      } else {
        console.log('🔐 No existing session');
        setLoading(false);
        authOperationInProgress.current = false;
      }
    });

    return () => {
      isUnmountedRef.current = true;
      authOperationInProgress.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    if (authOperationInProgress.current) {
      console.log('🚨 Auth operation already in progress');
      return { error: new Error('Operation in progress') };
    }

    try {
      authOperationInProgress.current = true;
      
      // Clean up any existing corrupted state before login
      cleanupAuthStorage();
      
      let email;
      if (identifier.toUpperCase() === 'ADMIN') {
        email = 'admin@bioins.local';
      } else {
        email = `evaluator${identifier}@bioins.local`;
      }
      
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    } finally {
      authOperationInProgress.current = false;
    }
  };

  const logout = async () => {
    if (authOperationInProgress.current) {
      console.log('🚨 Logout operation already in progress');
      return;
    }

    try {
      authOperationInProgress.current = true;
      setUser(null);
      setLoading(false);
      
      // Complete storage cleanup
      cleanupAuthStorage();
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.warn('Logout error (continuing anyway):', error);
    } finally {
      authOperationInProgress.current = false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
