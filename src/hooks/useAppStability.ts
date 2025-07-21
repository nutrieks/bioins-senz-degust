
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { cleanupAuthStorage, recoverFromAuthLoop } from '@/utils/authStorage';

export const useAppStability = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const hasSetupRef = useRef(false);

  useEffect(() => {
    if (hasSetupRef.current) return;
    hasSetupRef.current = true;

    // Browser navigation protection
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save critical app state to session storage for recovery
      try {
        const appState = {
          timestamp: Date.now(),
          userId: user?.id,
          currentPath: window.location.pathname,
        };
        sessionStorage.setItem('app-state-backup', JSON.stringify(appState));
      } catch (error) {
        console.warn('Failed to backup app state:', error);
      }
    };

    // Handle visibility change (tab switching, app backgrounding)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is backgrounded - backup state
        try {
          const appState = {
            timestamp: Date.now(),
            userId: user?.id,
            currentPath: window.location.pathname,
          };
          sessionStorage.setItem('app-state-backup', JSON.stringify(appState));
        } catch (error) {
          console.warn('Failed to backup app state on visibility change:', error);
        }
      } else {
        // App is foregrounded - check for stale state
        setTimeout(() => {
          checkAppHealth();
        }, 1000);
      }
    };

    // Check app health and recover if needed
    const checkAppHealth = () => {
      try {
        // Check if we have a backed up state
        const backupState = sessionStorage.getItem('app-state-backup');
        if (backupState) {
          const state = JSON.parse(backupState);
          const timeDiff = Date.now() - state.timestamp;
          
          // If backup is older than 10 minutes, clear queries and refetch
          if (timeDiff > 10 * 60 * 1000) {
            console.log('🔄 App health check: Clearing stale cache');
            queryClient.clear();
            queryClient.invalidateQueries();
            sessionStorage.removeItem('app-state-backup');
          }
        }
      } catch (error) {
        console.warn('App health check failed:', error);
      }
    };

    // Handle page focus (coming back to tab)
    const handleFocus = () => {
      setTimeout(() => {
        checkAppHealth();
      }, 500);
    };

    // Recovery from potential stuck states
    const handleRecovery = () => {
      try {
        // Check if app has been loading for too long
        const loadingElements = document.querySelectorAll('[data-loading="true"]');
        if (loadingElements.length > 0) {
          console.warn('🚨 Detected stuck loading state, attempting recovery');
          queryClient.clear();
          queryClient.invalidateQueries();
        }
      } catch (error) {
        console.warn('Recovery attempt failed:', error);
      }
    };

    // Periodic health check (every 5 minutes)
    const healthCheckInterval = setInterval(() => {
      checkAppHealth();
      handleRecovery();
    }, 5 * 60 * 1000);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(healthCheckInterval);
    };
  }, [user, queryClient, logout]);

  // Manual recovery function
  const recoverApp = () => {
    try {
      console.log('🔄 Manual app recovery initiated');
      recoverFromAuthLoop();
      queryClient.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Manual recovery failed:', error);
      window.location.reload();
    }
  };

  return { recoverApp };
};
