
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        console.log('Checking for stored user session...');
        const storedUser = localStorage.getItem('bioins_current_user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Found stored user:', userData.username);
          setUser(userData);
        } else {
          console.log('No stored user found');
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
        localStorage.removeItem('bioins_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN ATTEMPT in AuthContext ===');
      console.log('Attempting to log in with:', { username, password });
      setIsLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      // Detailed logging of Supabase response
      if (userError) {
        console.error('Supabase error during login:', JSON.stringify(userError, null, 2));
      }
      if (!userData) {
        console.log('No user data returned from Supabase.');
      }
      
      if (userError || !userData) {
        console.error('Validation failed. Credentials might be invalid or user not found.');
        setIsLoading(false);
        return false;
      }

      console.log('Supabase returned user data:', userData);

      // Create user object
      const authenticatedUser: User = {
        id: userData.id,
        username: userData.username,
        role: userData.role as UserRole,
        isActive: userData.is_active,
        evaluatorPosition: userData.evaluator_position,
        password: userData.password
      };

      // Store user in localStorage and state
      localStorage.setItem('bioins_current_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      console.log('Login successful for:', authenticatedUser.username);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login function threw an exception:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    try {
      console.log('=== LOGOUT ===');
      localStorage.removeItem('bioins_current_user');
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
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
