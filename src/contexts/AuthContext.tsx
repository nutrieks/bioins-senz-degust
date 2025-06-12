
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { useToast } from "@/hooks/use-toast";
import { loginWithSupabase, logout as logoutSupabase } from "@/services/supabase/auth";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== POKRETANJE AUTH PROVIDER ===');
    
    // Povećaj timeout na 20 sekundi za sporije veze
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout - prisilno postavljam loading na false');
      setLoading(false);
    }, 20000);

    // Set up auth state listener FIRST (bez async!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      // Samo sinkronizovane operacije ovdje
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, deferring user data fetch');
        
        // Deferiraj Supabase pozive sa setTimeout(0)
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        localStorage.removeItem("sensorUser");
        setLoading(false);
      }
      
      // Očisti timeout kad dobijemo auth event
      clearTimeout(loadingTimeout);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', session?.user?.id, error);
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      if (!session) {
        console.log('No session found');
        setLoading(false);
      }
      // Ako postoji session, auth state change listener će ga handled
    });

    // Funkcija za dohvaćanje korisničkih podataka s retry logikom
    const fetchUserData = async (userId: string, retries = 3) => {
      try {
        console.log('Fetching user data for:', userId, 'retries left:', retries);
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .eq('is_active', true)
          .single();

        if (!error && userData) {
          const appUser: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role as UserRole,
            evaluatorPosition: userData.evaluator_position || undefined,
            isActive: userData.is_active,
            password: userData.password
          };
          
          console.log('User data fetched successfully:', appUser.username, 'position:', appUser.evaluatorPosition);
          setUser(appUser);
          localStorage.setItem("sensorUser", JSON.stringify(appUser));
        } else {
          console.error('User not found or inactive:', error);
          // Retry ako ima još pokušaja
          if (retries > 0) {
            console.log('Retrying user data fetch in 2 seconds...');
            setTimeout(() => fetchUserData(userId, retries - 1), 2000);
            return;
          }
          // Ako korisnik nije pronađen nakon svih pokušaja, odjavi ga
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Retry ako ima još pokušaja
        if (retries > 0) {
          console.log('Retrying user data fetch in 2 seconds...');
          setTimeout(() => fetchUserData(userId, retries - 1), 2000);
          return;
        }
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    return () => {
      console.log('Cleaning up auth subscription');
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    console.log('Login attempt with identifier:', identifier);
    setLoading(true);
    
    try {
      // Determine username based on identifier
      let username = identifier;
      if (identifier !== "ADMIN") {
        // Check if it's a valid evaluator position (1-12)
        if (/^([1-9]|1[0-2])$/.test(identifier)) {
          username = `evaluator${identifier}`;
        } else {
          toast({
            title: "Greška pri prijavi",
            description: "Nevažeće korisničko ime. Unesite ADMIN ili broj od 1 do 12.",
            variant: "destructive",
          });
          setLoading(false);
          return false;
        }
      } else {
        username = "admin";
      }

      console.log('Attempting Supabase login with identifier:', identifier);
      
      // Pokušaj login s retry logikom
      let authenticatedUser = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Login attempt ${attempt}/3`);
        try {
          authenticatedUser = await loginWithSupabase(identifier, password);
          if (authenticatedUser) break;
        } catch (error) {
          console.error(`Login attempt ${attempt} failed:`, error);
          if (attempt === 3) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
      if (authenticatedUser) {
        // The auth state change listener will handle setting the user
        const welcomeMessage = authenticatedUser.role === UserRole.ADMIN 
          ? "Dobrodošli, Administrator!" 
          : `Dobrodošli, Ocjenjivač ${authenticatedUser.evaluatorPosition}!`;
          
        toast({
          title: "Uspješna prijava",
          description: welcomeMessage,
        });
        
        // Loading će biti postavljen na false u auth state listener
        return true;
      } else {
        toast({
          title: "Greška pri prijavi",
          description: "Pogrešno korisničko ime ili lozinka.",
          variant: "destructive",
        });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Greška pri prijavi",
        description: "Došlo je do pogreške prilikom prijave. Pokušajte ponovno.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logout initiated');
    setLoading(true);
    
    try {
      await logoutSupabase();
      toast({
        title: "Odjava",
        description: "Uspješno ste se odjavili.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom odjave.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
