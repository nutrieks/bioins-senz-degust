
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
    const fetchUser = async (sessionUser: any): Promise<User | null> => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (error || !userData) {
          console.warn("Korisnički profil nije pronađen u 'users' tablici za prijavljenog korisnika. Odjava.", error?.message);
          await supabase.auth.signOut();
          return null;
        }
        
        if (!userData.is_active) {
            console.warn(`Korisnik ${userData.username} nije aktivan. Odjava.`);
            await supabase.auth.signOut();
            return null;
        }
        
        const profile: User = {
          id: userData.id,
          username: userData.username,
          role: userData.role as UserRole,
          evaluatorPosition: userData.evaluator_position,
          isActive: userData.is_active,
          password: userData.password,
        };

        return profile;
      } catch (error) {
        console.error("Greška prilikom dohvaćanja profila korisnika:", error);
        return null;
      }
    };

    // Postavi listener za promjene u stanju autentifikacije.
    // Ovo se aktivira pri početnom učitavanju (ako postoji sesija) i pri svakoj prijavi/odjavi.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change event: ${event}`);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session) {
          const profile = await fetchUser(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
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
      console.log('=== NEW SIMPLIFIED LOGIN ATTEMPT ===');
      
      // 1. Kreiranje emaila za Supabase autentifikaciju na temelju unosa.
      let email;
      const upperIdentifier = identifier.toUpperCase();

      if (upperIdentifier === 'ADMIN') {
        email = `admin@bioins.local`;
      } else if (!isNaN(Number(identifier)) && Number(identifier) >= 1 && Number(identifier) <= 12) {
        email = `evaluator${Number(identifier)}@bioins.local`;
      } else {
        console.error(`Neispravan format identifikatora: '${identifier}'. Prijavite se s 'ADMIN' ili brojem ocjenjivačkog mjesta (1-12).`);
        setIsLoading(false);
        return false;
      }
      
      console.log(`Pokušaj Supabase prijave s emailom: ${email}`);

      // 2. Prijava isključivo putem Supabase Auth servisa.
      // Ovo je brzo jer ne radi dodatne provjere ili registracije.
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Supabase signInWithPassword greška:', error.message);
        setIsLoading(false);
        return false;
      }

      // Ako je prijava uspješna, onAuthStateChange listener će automatski
      // dohvatiti korisnički profil i postaviti stanje (uključujući isLoading).
      return true;

    } catch (error) {
      console.error('Login funkcija je bacila iznimku:', error);
      setIsLoading(false);
      return false;
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
