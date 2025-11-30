/**
 * Utility to clear all localStorage data
 * Run this once to migrate from localStorage to database-only storage
 */

export const clearAllLocalStorage = () => {
  console.log("🧹 Clearing all localStorage data...");
  
  const keysToRemove = [
    'orders',
    'cart',
    'users',
    'user',
    'auth',
    'authToken',
    'session',
  ];

  let clearedCount = 0;
  keysToRemove.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Removed: ${key}`);
    }
  });

  // Also clear any other keys that might be related
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (key.toLowerCase().includes('order') || 
        key.toLowerCase().includes('cart') ||
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('auth')) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`✅ Removed: ${key}`);
    }
  });

  console.log(`✅ Cleared ${clearedCount} localStorage items`);
  console.log("✅ All data will now be stored in Supabase database only");
  
  return clearedCount;
};

// Auto-clear on import (for one-time migration)
if (typeof window !== 'undefined') {
  // Only clear if there's old data
  const hasOldData = localStorage.getItem('orders') || localStorage.getItem('cart') || localStorage.getItem('users');
  if (hasOldData) {
    console.log("🔄 Detected old localStorage data - clearing it...");
    clearAllLocalStorage();
  }
}

