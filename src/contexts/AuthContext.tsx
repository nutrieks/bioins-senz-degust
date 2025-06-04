
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user data from our users table
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
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
            setUser(appUser);
            localStorage.setItem("sensorUser", JSON.stringify(appUser));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("sensorUser");
      }
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Check for stored user as fallback during transition
        const storedUser = localStorage.getItem("sensorUser");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem("sensorUser");
          }
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
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
          return false;
        }
      } else {
        username = "admin";
      }

      console.log('Attempting Supabase login with identifier:', identifier);
      const authenticatedUser = await loginWithSupabase(identifier, password);
      
      if (authenticatedUser) {
        // The auth state change listener will handle setting the user
        const welcomeMessage = authenticatedUser.role === UserRole.ADMIN 
          ? "Dobrodošli, Administrator!" 
          : `Dobrodošli, Ocjenjivač ${authenticatedUser.evaluatorPosition}!`;
          
        toast({
          title: "Uspješna prijava",
          description: welcomeMessage,
        });
        return true;
      } else {
        toast({
          title: "Greška pri prijavi",
          description: "Pogrešno korisničko ime ili lozinka.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Greška pri prijavi",
        description: "Došlo je do pogreške prilikom prijave.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
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
