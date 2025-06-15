import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { logout as logoutService } from '@/services/supabase/auth';

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
        role: userData.role as UserRole,
        evaluatorPosition: userData.evaluator_position,
        isActive: userData.is_active,
        password: userData.password,
      };

      return profile;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      if (session?.user) {
        const profile = await fetchUser(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('=== NEW LOGIN ATTEMPT ===');
      
      // 1. Pronalazimo korisnika u našoj `users` tablici
      let userQuery = supabase.from('users').select('*');
      const upperIdentifier = identifier.toUpperCase();

      if (upperIdentifier === 'ADMIN') {
        userQuery = userQuery.eq('username', 'ADMIN');
      } else if (!isNaN(Number(identifier)) && Number(identifier) >= 1 && Number(identifier) <= 12) {
        userQuery = userQuery.eq('evaluator_position', Number(identifier));
      } else {
        userQuery = userQuery.eq('username', identifier);
      }

      const { data: userData, error: userError } = await userQuery.single();

      if (userError || !userData) {
        console.error('Korisnik nije pronađen u public.users tablici:', userError?.message);
        return false;
      }
      
      // 2. Provjera lozinke
      if (userData.password !== password) {
        console.error('Pogrešna lozinka za korisnika:', userData.username);
        return false;
      }
      
      // 3. Kreiranje emaila za Supabase autentifikaciju
      let email;
      if (userData.role === 'ADMIN') {
        email = `admin@bioins.local`;
      } else if (userData.role === 'EVALUATOR' && userData.evaluator_position) {
        email = `evaluator${userData.evaluator_position}@bioins.local`;
      } else {
        console.error(`Nije moguće kreirati email za korisnika s ulogom ${userData.role} i pozicijom ${userData.evaluator_position}`);
        return false;
      }
      
      console.log(`Pokušaj Supabase prijave za korisnika ${userData.username} s emailom ${email}`);

      // 4. Prijava putem Supabase Auth servisa
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Supabase signInWithPassword greška:', authError.message);
        return false;
      }

      // onAuthStateChange listener će se pobrinuti za postavljanje stanja korisnika.
      return true;

    } catch (error) {
      console.error('Login funkcija je bacila iznimku:', error);
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
