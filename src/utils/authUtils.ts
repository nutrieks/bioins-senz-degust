export const cleanupAuthState = () => {
  console.log('Performing minimal auth cleanup...');
  
  // Only remove problematic keys, keep session persistence
  const keysToRemove = [
    'supabase.auth.debug',
    'supabase.auth.error'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('Minimal auth cleanup completed');
};
