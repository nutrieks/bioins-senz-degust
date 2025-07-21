
// Datoteka: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener');

    // SIMPLIFIED AUTH STATE LISTENER - NO AGGRESSIVE TIMEOUTS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmountedRef.current) return;

      console.log('🔐 Auth state change:', event, session?.user?.id);

      try {
        if (session?.user) {
          // Validate user with reasonable timeout
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error || !userData || !userData.is_active) {
            console.warn('🚨 Invalid/inactive user - signing out');
            setUser(null);
            setLoading(false);
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
        await supabase.auth.signOut();
      } finally {
        if (!isUnmountedRef.current) {
          setLoading(false);
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('🔐 Existing session found');
        // The onAuthStateChange will handle this
      } else {
        console.log('🔐 No existing session');
        setLoading(false);
      }
    });

    return () => {
      isUnmountedRef.current = true;
      subscription.unsubscribe();
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
      setUser(null);
      setLoading(false);
      
      // Clear auth storage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.warn('Logout error (continuing anyway):', error);
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
