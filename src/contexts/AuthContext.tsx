
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
    const checkUser = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          await loadUserData(session.user.id);
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
          console.log('User signed in, loading user data...');
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (authUserId: string) => {
    try {
      console.log('Loading user data for auth user ID:', authUserId);
      
      // Get user details from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('User not found or inactive:', userError);
        setUser(null);
        return;
      }

      console.log('User data loaded:', userData);
      setUser({
        id: userData.id,
        username: userData.username,
        role: userData.role as UserRole,
        isActive: userData.is_active,
        evaluatorPosition: userData.evaluator_position,
        password: userData.password
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', username);
      setIsLoading(true);
      
      // First, validate credentials against our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('Invalid credentials or user not found:', userError);
        setIsLoading(false);
        return false;
      }

      console.log('Credentials validated for user:', userData.username);

      // Create email format for Supabase auth
      const email = `${username.toLowerCase()}@bioins.local`;
      
      console.log('Attempting auth with email:', email);
      
      // Try to sign in with Supabase auth
      let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: userData.id // Use user ID as password for consistency
      });

      // If user doesn't exist in auth system, create them
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Creating new auth user...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: userData.id,
          options: {
            data: {
              username: userData.username,
              role: userData.role
            }
          }
        });

        if (signUpError) {
          console.error('Error creating auth user:', signUpError);
          setIsLoading(false);
          return false;
        }

        authData = signUpData;
      } else if (signInError) {
        console.error('Auth sign in error:', signInError);
        setIsLoading(false);
        return false;
      }

      if (authData.user) {
        console.log('Auth successful for user ID:', authData.user.id);
        
        // Update our users table with the correct auth user ID if needed
        if (authData.user.id !== userData.id) {
          console.log('Updating user ID mapping...');
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: authData.user.id })
            .eq('username', username);

          if (updateError) {
            console.warn('Could not update user ID mapping:', updateError);
          }
        }

        // Set user data immediately
        setUser({
          id: authData.user.id,
          username: userData.username,
          role: userData.role as UserRole,
          isActive: userData.is_active,
          evaluatorPosition: userData.evaluator_position,
          password: userData.password
        });

        console.log('Login successful');
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
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
