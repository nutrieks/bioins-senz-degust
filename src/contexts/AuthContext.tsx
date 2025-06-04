import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { useToast } from "@/hooks/use-toast";
import { loginWithSupabase } from "@/services/supabase/auth";

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
    // Check for stored user on component mount
    const storedUser = localStorage.getItem("sensorUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("sensorUser");
      }
    }
    setLoading(false);
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

      console.log('Attempting Supabase login with username:', username);
      const authenticatedUser = await loginWithSupabase(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem("sensorUser", JSON.stringify(authenticatedUser));
        
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sensorUser");
    toast({
      title: "Odjava",
      description: "Uspješno ste se odjavili.",
    });
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
