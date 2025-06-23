
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";

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
    setIsLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

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
          // Ako korisnik ne postoji u 'users' tablici, nije aktivan, ili je greška, odjavi ga
          setUser(null);
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
    await supabase.auth.signOut();
    // Navigacija će se dogoditi automatski kada onAuthStateChange postavi user na null
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
