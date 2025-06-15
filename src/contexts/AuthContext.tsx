
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { loginWithSupabase, logout as logoutService } from '@/services/supabase/auth';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (sessionUser: any) => {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
      
      if (!userData) {
        return null;
      }
      
      // Map Supabase DB user (snake_case) to application User type (camelCase)
      const profile: User = {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        evaluatorPosition: userData.evaluator_position,
        isActive: userData.is_active,
        password: userData.password,
      };

      return profile;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      if (_event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUser(session.user);
        setUser(profile);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
      }
      setIsLoading(false);
    });

    const checkInitialSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUser(session.user);
        setUser(profile);
      }
      setIsLoading(false);
    };

    checkInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('=== LOGIN ATTEMPT with Supabase Auth ===');
      const authenticatedUser = await loginWithSupabase(identifier, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        console.log('Supabase Auth login successful for:', authenticatedUser.username);
        return true;
      } else {
        console.error('Supabase Auth login failed.');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Login function threw an exception:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== LOGOUT with Supabase Auth ===');
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
