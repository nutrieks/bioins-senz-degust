
// Datoteka: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set maximum loading timeout of 10 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        console.warn('🚨 Auth loading timeout - forcing fallback to login');
        setLoading(false);
        setUser(null);
        // Clear potentially corrupted auth state
        try {
          supabase.auth.signOut({ scope: 'global' });
        } catch (e) {
          console.warn('Failed to sign out during timeout:', e);
        }
      }
    }, 10000);

    // Jedini izvor istine: listener koji se aktivira odmah i na svaku promjenu
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmountedRef.current) return;

      console.log('🔐 Auth state change:', event, session?.user?.id);

      try {
        if (session?.user) {
          // Validate session is still valid
          const { data: userData, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          
          if (error || !userData || !userData.is_active) {
            console.warn('🚨 Invalid or inactive user session, signing out');
            setUser(null);
            setLoading(false);
            await supabase.auth.signOut({ scope: 'global' });
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
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('🚨 Auth state change error:', error);
        setUser(null);
      } finally {
        if (!isUnmountedRef.current) {
          setLoading(false);
          // Clear timeout since auth is resolved
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        }
      }
    });

    return () => {
      isUnmountedRef.current = true;
      subscription.unsubscribe();
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
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
    }
  };

  const logout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setLoading(false);
      
      // Clear potentially corrupted storage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.warn('Logout error (continuing anyway):', error);
    } finally {
      // Force redirect to login
      window.location.href = '/login';
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
