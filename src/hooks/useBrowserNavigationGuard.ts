import { useEffect, useRef } from 'react';

interface NavigationGuardOptions {
  isActive: boolean;
  message?: string;
  onBeforeLeave?: () => void;
}

/**
 * Hook that protects against accidental browser navigation during evaluations
 * Provides beforeunload warning and visibility change handling
 */
export function useBrowserNavigationGuard({
  isActive,
  message = 'Sigurni ste da želite izaći? Izgubiti ćete trenutni napredak u ocjenjivanju.',
  onBeforeLeave
}: NavigationGuardOptions) {
  const isActiveRef = useRef(isActive);
  
  // Keep ref in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActiveRef.current) {
        onBeforeLeave?.();
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isActiveRef.current) {
        // User is navigating away or minimizing - store current state
        onBeforeLeave?.();
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isActiveRef.current) {
        // User pressed browser back/forward
        const shouldLeave = window.confirm(message);
        if (!shouldLeave) {
          // Push current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        } else {
          onBeforeLeave?.();
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    // Push initial state to handle back button
    if (isActive) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Empty dependency array - we use ref to avoid re-registration

  return {
    clearGuard: () => {
      isActiveRef.current = false;
    }
  };
}
