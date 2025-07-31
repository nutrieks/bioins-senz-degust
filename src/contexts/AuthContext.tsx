
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { cleanupAuthStorage } from "@/utils/authStorage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ user: User | null; error: any | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;
    console.log('🔐 AuthProvider: Starting session check...');

    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('🚨 AuthProvider: Error getting session:', sessionError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (dbError || !userData || !userData.is_active) {
          console.warn('🚨 AuthProvider: User validation failed or user inactive. Signing out.', { dbError, userData });
          await supabase.auth.signOut();
          setUser(null);
        } else {
          const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role as UserRole,
            evaluatorPosition: userData.evaluator_position || undefined,
            isActive: userData.is_active,
            password: userData.password // Note: Be cautious with password handling on client-side
          };
          setUser(mappedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isUnmountedRef.current) return;
      console.log('🔐 AuthProvider: Auth state changed. Session:', session ? 'Exists' : 'Null');
      checkSession();
    });

    return () => {
      isUnmountedRef.current = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    let email;
    if (identifier.toUpperCase() === 'ADMIN') {
      email = 'admin@bioins.local';
    } else {
      email = `evaluator${identifier}@bioins.local`;
    }
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !authData.user) {
      return { user: null, error };
    }

    // After successful auth, fetch user from our public table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (dbError || !userData) {
      await supabase.auth.signOut();
      return { user: null, error: dbError || new Error('User not found in database.') };
    }
    
    const mappedUser: User = {
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      evaluatorPosition: userData.evaluator_position || undefined,
      isActive: userData.is_active,
      password: userData.password
    };

    return { user: mappedUser, error: null };
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
    cleanupAuthStorage();
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
