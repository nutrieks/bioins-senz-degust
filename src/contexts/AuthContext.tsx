
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
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (!userData) {
          console.warn("Korisnički profil nije pronađen u bazi za prijavljenog korisnika.");
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

    const loadingTimeout = setTimeout(() => {
      console.warn("Auth context je premašio vrijeme čekanja. Forsirano zaustavljanje učitavanja.");
      setIsLoading(false);
    }, 8000);

    // 1. Provjeri postojanje sesije prilikom inicijalnog učitavanja aplikacije
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log("Inicijalna provjera sesije završena.");
        if (session) {
          console.log("Pronađena postojeća sesija, dohvaćam profil.");
          const profile = await fetchUser(session.user);
          setUser(profile);
        }
      })
      .catch(error => {
        console.error("Greška pri dohvaćanju sesije:", error);
      })
      .finally(() => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      });

    // 2. Postavi listener za buduće promjene u stanju autentifikacije
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Stanje autentifikacije promijenjeno: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchUser(session.user);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // 5. Ako prijava ne uspije jer korisnik ne postoji, registriraj ga
      if (signInError && signInError.message === 'Invalid login credentials') {
        console.log('Korisnik ne postoji u Supabase Auth. Pokušaj registracije...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (signUpError) {
          console.error('Supabase signUp greška nakon neuspješne prijave:', signUpError.message);
          return false;
        }

        if (signUpData.user) {
          console.log(`Korisnik ${email} uspješno registriran u Supabase Auth. Ažuriranje public.users...`);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: signUpData.user.id })
            .eq('username', userData.username);

          if (updateError) {
            console.error('Greška pri ažuriranju ID-a korisnika u public.users:', updateError.message);
            return false;
          }
          console.log('ID korisnika u public.users je uspješno sinkroniziran.');
          // onAuthStateChange listener će se pobrinuti za postavljanje stanja korisnika.
          return true;
        } else {
            console.error('SignUp nije vratio korisnika, prijava neuspješna.');
            return false;
        }

      } else if (signInError) {
        console.error('Supabase signInWithPassword greška:', signInError.message);
        return false;
      }

      // Ako je signIn bio uspješan
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
