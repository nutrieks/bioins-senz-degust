
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

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
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found existing session:', session.user.id);
          
          // Get user details from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            setUser(null);
          } else if (userData) {
            console.log('User data from database:', userData);
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role,
              isActive: userData.is_active,
              evaluatorPosition: userData.evaluator_position
            });
          }
        } else {
          console.log('No existing session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in checkUser:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user details from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data after sign in:', userError);
            setUser(null);
          } else if (userData) {
            console.log('User signed in:', userData);
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role,
              isActive: userData.is_active,
              evaluatorPosition: userData.evaluator_position
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', username);
      
      // First, get user data from our users table to validate
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('User validation failed:', userError);
        return false;
      }

      console.log('User validated:', userData);

      // Create a Supabase auth session using the user's email
      // We'll use username@bioins.local as email format
      const email = `${username}@bioins.local`;
      
      // Try to sign in - if user doesn't exist in auth.users, we'll create them
      let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: userData.id // Use user ID as password for auth
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('User not found in auth, creating...');
        
        // User doesn't exist in auth.users, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: userData.id, // Use user ID as password
          options: {
            data: {
              username: userData.username,
              role: userData.role
            }
          }
        });

        if (signUpError) {
          console.error('Error creating auth user:', signUpError);
          return false;
        }

        authData = signUpData;
      } else if (signInError) {
        console.error('Error signing in:', signInError);
        return false;
      }

      if (authData.user) {
        console.log('Auth successful, updating user ID mapping...');
        
        // Update our users table with the auth user ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: authData.user.id })
          .eq('username', username);

        if (updateError) {
          console.error('Error updating user ID:', updateError);
          // Continue anyway, the session is valid
        }

        setUser({
          id: authData.user.id,
          username: userData.username,
          role: userData.role,
          isActive: userData.is_active,
          evaluatorPosition: userData.evaluator_position
        });

        console.log('Login successful for user:', userData.username);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('=== LOGOUT ===');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
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
