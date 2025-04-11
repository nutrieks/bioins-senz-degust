
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { login as apiLogin } from "../services/dataService";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
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

  const login = async (username: string, password: string) => {
    try {
      const user = await apiLogin(username, password);
      if (user) {
        setUser(user);
        localStorage.setItem("sensorUser", JSON.stringify(user));
        toast({
          title: "Uspješna prijava",
          description: `Dobrodošli, ${username}!`,
        });
        return true;
      } else {
        toast({
          title: "Greška pri prijavi",
          description: "Pogrešno korisničko ime ili lozinka",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
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
