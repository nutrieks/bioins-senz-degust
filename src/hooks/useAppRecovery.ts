import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// BULLETPROOF APP RECOVERY HOOK
export function useAppRecovery() {
  const { user, loading } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If loading for too long, force recovery
    if (loading && !user) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.warn('🚨 App recovery triggered - clearing everything');
          
          // Nuclear option: clear everything
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.warn('Failed to clear storage:', e);
          }
          
          // Force redirect to login
          window.location.href = '/login';
        }
      }, 8000); // 8 seconds max loading
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, user]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if app is in invalid state
        if (loading && !user && performance.now() > 10000) {
          console.warn('🚨 App recovery on tab focus - clearing state');
          window.location.href = '/login';
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, user]);

  return {
    isRecovering: loading && !user,
    triggerRecovery: () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Manual recovery storage clear failed:', e);
      }
      window.location.href = '/login';
    }
  };
}