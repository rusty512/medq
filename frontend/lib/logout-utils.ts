/**
 * Logout Utilities
 * Centralized logout functionality following Supabase best practices
 */

import { createClient } from './supabase/client';

const supabase = createClient();

export interface LogoutOptions {
  redirectTo?: string;
  clearStorage?: boolean;
  showConfirmation?: boolean;
}

export interface LogoutResult {
  success: boolean;
  error?: string;
}

/**
 * Comprehensive logout function that follows Supabase best practices
 * @param options - Logout configuration options
 * @returns Promise<LogoutResult>
 */
export async function performLogout(options: LogoutOptions = {}): Promise<LogoutResult> {
  const {
    redirectTo = '/login',
    clearStorage = true,
    showConfirmation = false
  } = options;

  try {
    console.log("🚪 Starting comprehensive logout process...");

    // Step 1: Sign out from Supabase
    console.log("🔐 Signing out from Supabase...");
    const { error: supabaseError } = await supabase.auth.signOut();
    
    if (supabaseError) {
      console.error("❌ Supabase logout error:", supabaseError);
      throw new Error(`Supabase logout failed: ${supabaseError.message}`);
    }
    
    console.log("✅ Supabase logout successful");

    // Step 2: Clear browser storage (if requested)
    if (clearStorage) {
      console.log("🧹 Clearing browser storage...");
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any specific items we might have set
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('pendingOnboarding');
      
      console.log("✅ Browser storage cleared");
    }

    // Step 3: Clear any cached data (if using a cache)
    console.log("🗑️ Clearing cached data...");
    
    // Clear any service worker caches if applicable
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log("✅ Service worker caches cleared");
      } catch (cacheError) {
        console.warn("⚠️ Failed to clear service worker caches:", cacheError);
      }
    }

    // Step 4: Redirect (if not in a React component context)
    if (typeof window !== 'undefined' && redirectTo) {
      console.log(`🔄 Redirecting to ${redirectTo}...`);
      window.location.href = redirectTo;
    }

    console.log("✅ Logout process completed successfully");
    
    return {
      success: true
    };

  } catch (error) {
    console.error("❌ Logout process failed:", error);
    
    // Even if logout fails, try to clear local storage
    if (clearStorage) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.error("❌ Failed to clear storage:", storageError);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown logout error'
    };
  }
}

/**
 * Quick logout function for immediate logout without confirmation
 * @param redirectTo - Where to redirect after logout
 */
export async function quickLogout(redirectTo: string = '/login'): Promise<void> {
  await performLogout({ redirectTo, clearStorage: true, showConfirmation: false });
}

/**
 * Secure logout function that ensures all data is cleared
 * Use this for sensitive applications or when security is critical
 */
export async function secureLogout(): Promise<LogoutResult> {
  console.log("🔒 Performing secure logout...");
  
  const result = await performLogout({
    redirectTo: '/login',
    clearStorage: true,
    showConfirmation: false
  });
  
  // Additional security measures
  if (result.success) {
    // Clear any remaining cookies (if any)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    console.log("🔒 Secure logout completed");
  }
  
  return result;
}

/**
 * Check if user is currently logged in
 */
export async function isUserLoggedIn(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
