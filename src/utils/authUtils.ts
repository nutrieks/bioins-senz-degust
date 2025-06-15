
export const cleanupAuthState = () => {
  console.log('Performing thorough auth state cleanup...');
  
  // Temeljito čisti sve Supabase ključeve iz localStorage i sessionStorage
  // kako bi se spriječila "auth limbo" stanja.
  const clearStorage = (storage: Storage) => {
    if (!storage) return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.startsWith('sb-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  };

  clearStorage(localStorage);
  if (typeof sessionStorage !== 'undefined') {
    clearStorage(sessionStorage);
  }
  
  console.log('Thorough auth cleanup completed');
};
