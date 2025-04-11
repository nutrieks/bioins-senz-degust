
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string) => Promise<boolean>;
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

  const login = async (identifier: string): Promise<boolean> => {
    try {
      // Check if the identifier is a valid evaluator position (1-12) or ADMIN
      if (identifier === "ADMIN") {
        // Admin login
        const adminUser: User = {
          id: "admin1",
          username: "admin",
          role: UserRole.ADMIN,
          isActive: true
        };
        
        setUser(adminUser);
        localStorage.setItem("sensorUser", JSON.stringify(adminUser));
        toast({
          title: "Uspješna prijava",
          description: "Dobrodošli, Administrator!",
        });
        return true;
      } else if (/^([1-9]|1[0-2])$/.test(identifier)) {
        // Evaluator login - position between 1 and 12
        const position = parseInt(identifier, 10);
        const evaluatorUser: User = {
          id: `evaluator${position}`,
          username: `evaluator${position}`,
          role: UserRole.EVALUATOR,
          evaluatorPosition: position,
          isActive: true
        };
        
        setUser(evaluatorUser);
        localStorage.setItem("sensorUser", JSON.stringify(evaluatorUser));
        toast({
          title: "Uspješna prijava",
          description: `Dobrodošli, Ocjenjivač ${position}!`,
        });
        return true;
      } else {
        // Invalid identifier
        toast({
          title: "Greška pri prijavi",
          description: "Nevažeće ocjenjivačko mjesto. Unesite broj od 1 do 12 ili ADMIN.",
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
