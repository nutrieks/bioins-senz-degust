
// Auth storage management utilities
export const SUPABASE_AUTH_KEYS = [
  'supabase.auth.token',
  'supabase.auth.user',
  'supabase.auth.session',
  'supabase.auth.refresh_token',
  'supabase.auth.access_token',
  'supabase.auth.expires_at',
  'supabase.auth.expires_in',
  'supabase.auth.provider_token',
  'supabase.auth.provider_refresh_token',
  'supabase.auth.user_metadata',
];

export const cleanupAuthStorage = () => {
  console.log('🧹 Cleaning up auth storage...');
  
  try {
    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('auth-token')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage key: ${key}`);
      }
    });

    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage || {});
    sessionStorageKeys.forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('auth-token')) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removed sessionStorage key: ${key}`);
      }
    });

    // Clear app-specific storage
    localStorage.removeItem('app-state-backup');
    sessionStorage.removeItem('app-state-backup');
    
    console.log('✅ Auth storage cleanup complete');
  } catch (error) {
    console.warn('⚠️ Auth storage cleanup error:', error);
  }
};

export const checkStorageHealth = (): boolean => {
  try {
    // Check for corrupted tokens
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('supabase.auth.') || key.includes('sb-')
    );
    
    // If we have auth keys but no valid session structure, it's corrupted
    if (authKeys.length > 0) {
      const hasValidSession = authKeys.some(key => {
        try {
          const value = localStorage.getItem(key);
          return value && JSON.parse(value);
        } catch {
          return false;
        }
      });
      
      if (!hasValidSession) {
        console.warn('🚨 Detected corrupted auth storage');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️ Storage health check error:', error);
    return false;
  }
};

export const recoverFromAuthLoop = () => {
  console.log('🔄 Recovering from auth loop...');
  cleanupAuthStorage();
  
  // Clear all potentially problematic state
  try {
    // Clear IndexedDB if it exists
    if (window.indexedDB) {
      const deleteReq = window.indexedDB.deleteDatabase('supabase-auth');
      deleteReq.onsuccess = () => console.log('🗑️ Cleared IndexedDB');
    }
  } catch (error) {
    console.warn('⚠️ IndexedDB cleanup error:', error);
  }
};
