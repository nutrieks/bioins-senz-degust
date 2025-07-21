
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { cleanupAuthStorage, checkStorageHealth, recoverFromAuthLoop } from "@/utils/authStorage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isUnmountedRef = useRef(false);
  const authOperationInProgress = useRef(false);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting initialization...');

    // STEP 1: Check storage health on startup
    const isStorageHealthy = checkStorageHealth();
    if (!isStorageHealthy) {
      console.log('🚨 Unhealthy storage detected, cleaning up...');
      recoverFromAuthLoop();
    }

    // STEP 2: Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmountedRef.current || authOperationInProgress.current) {
        console.log('🔐 Auth state change ignored (unmounted or in progress)');
        return;
      }

      console.log('🔐 Auth state change EVENT:', event);
      console.log('🔐 Auth state change SESSION:', session?.user?.id ? `User ID: ${session.user.id}` : 'No session');

      // Prevent multiple simultaneous operations
      authOperationInProgress.current = true;

      try {
        if (session?.user) {
          console.log('🔐 Session found, validating user in database...');
          
          // Validate user with database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          console.log('🔐 Database query result:', { userData, error });

          if (error) {
            console.error('🚨 Database error during user validation:', error);
            setUser(null);
            setLoading(false);
            cleanupAuthStorage();
            await supabase.auth.signOut();
            return;
          }

          if (!userData) {
            console.warn('🚨 User not found in database - signing out');
            setUser(null);
            setLoading(false);
            cleanupAuthStorage();
            await supabase.auth.signOut();
            return;
          }

          if (!userData.is_active) {
            console.warn('🚨 User is not active - signing out');
            setUser(null);
            setLoading(false);
            cleanupAuthStorage();
            await supabase.auth.signOut();
            return;
          }

          const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role as UserRole,
            evaluatorPosition: userData.evaluator_position || undefined,
            isActive: userData.is_active,
            password: userData.password
          };
          
          console.log('✅ User validated successfully:', {
            username: mappedUser.username,
            role: mappedUser.role,
            isActive: mappedUser.isActive
          });

          setUser(mappedUser);
          setLoading(false);

          // REDIRECT LOGIC - Handle redirect after successful authentication
          console.log('🔐 Attempting redirect for user role:', mappedUser.role);
          
          // Only redirect if we're on the login page
          if (window.location.pathname === '/login') {
            console.log('🔐 On login page, redirecting...');
            
            if (mappedUser.role === UserRole.ADMIN) {
              console.log('🔐 Redirecting admin to /admin');
              navigate("/admin", { replace: true });
            } else if (mappedUser.role === UserRole.EVALUATOR) {
              console.log('🔐 Redirecting evaluator to /evaluator');
              navigate("/evaluator", { replace: true });
            } else {
              console.warn('🚨 Unknown user role:', mappedUser.role);
            }
          } else {
            console.log('🔐 Not on login page, no redirect needed');
          }

        } else {
          console.log('🔐 No session - clearing user state');
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('🚨 Auth validation error:', error);
        setUser(null);
        setLoading(false);
        cleanupAuthStorage();
        await supabase.auth.signOut();
      } finally {
        if (!isUnmountedRef.current) {
          authOperationInProgress.current = false;
        }
      }
    });

    // STEP 3: Check for existing session
    console.log('🔐 Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('🚨 Error getting session:', error);
        setLoading(false);
        authOperationInProgress.current = false;
        return;
      }

      if (session) {
        console.log('🔐 Existing session found, will be handled by onAuthStateChange');
      } else {
        console.log('🔐 No existing session found');
        setLoading(false);
        authOperationInProgress.current = false;
      }
    });

    return () => {
      console.log('🔐 AuthProvider cleanup');
      isUnmountedRef.current = true;
      authOperationInProgress.current = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (identifier: string, password: string) => {
    if (authOperationInProgress.current) {
      console.log('🚨 Auth operation already in progress');
      return { error: new Error('Operation in progress') };
    }

    try {
      console.log('🔐 Starting login process for:', identifier);
      authOperationInProgress.current = true;
      
      // Clean up any existing corrupted state before login
      cleanupAuthStorage();
      
      let email;
      if (identifier.toUpperCase() === 'ADMIN') {
        email = 'admin@bioins.local';
      } else {
        email = `evaluator${identifier}@bioins.local`;
      }
      
      console.log('🔐 Attempting Supabase login with email:', email);
      
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('🔐 Login result:', { 
        error: result.error, 
        user: result.data.user ? `User ID: ${result.data.user.id}` : 'No user'
      });
      
      return result;
    } catch (error) {
      console.error('🚨 Login error:', error);
      return { error };
    } finally {
      authOperationInProgress.current = false;
    }
  };

  const logout = async () => {
    if (authOperationInProgress.current) {
      console.log('🚨 Logout operation already in progress');
      return;
    }

    try {
      console.log('🔐 Starting logout process');
      authOperationInProgress.current = true;
      setUser(null);
      setLoading(false);
      
      // Complete storage cleanup
      cleanupAuthStorage();
      
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Logout complete');
    } catch (error) {
      console.warn('⚠️ Logout error (continuing anyway):', error);
    } finally {
      authOperationInProgress.current = false;
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
