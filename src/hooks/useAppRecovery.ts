
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// TEMPORARILY DISABLED - CAUSING AUTHENTICATION LOOPS
export function useAppRecovery() {
  const { user, loading } = useAuth();
  
  console.log('🚨 useAppRecovery DISABLED - preventing auth loops');
  
  // Disabled all recovery mechanisms to prevent loops
  useEffect(() => {
    console.log('🚨 useAppRecovery: All recovery mechanisms disabled');
  }, []);

  return {
    isRecovering: false, // Always false when disabled
    triggerRecovery: () => {
      console.log('🚨 Manual recovery disabled - use browser refresh instead');
    }
  };
}
