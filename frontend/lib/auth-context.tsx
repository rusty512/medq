"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './supabase/client';
import { User } from '@supabase/supabase-js';
import { UserService, UserData } from './user-service';
import { VisitsService, Visit } from './visits-service';
import { StatsService, BillingStats } from './stats-service';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  visits: Visit[];
  billingStats: BillingStats | null;
  loading: boolean;
  userDataLoading: boolean;
  dataLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const supabase = createClient();

  // Function to fetch detailed user data
  const fetchUserData = async (authUser: User) => {
    try {
      setUserDataLoading(true);
      const data = await UserService.getCurrentUser();
      setUserData(data);
      console.log('AuthContext - User data loaded:', data);
    } catch (error) {
      console.error('AuthContext - Failed to load user data:', error);
      setUserData(null);
    } finally {
      setUserDataLoading(false);
    }
  };

  // Function to fetch all application data
  const fetchAllData = async (authUser: User) => {
    try {
      setDataLoading(true);
      console.log('🚀 AuthContext - Starting to load all application data...');
      
      // Load data sequentially to better debug issues
      console.log('🔍 AuthContext - Loading user data...');
      const userData = await UserService.getCurrentUser();
      console.log('🔍 AuthContext - User data result:', userData);
      
      console.log('🔍 AuthContext - Loading visits...');
      const visitData = await VisitsService.getVisits();
      console.log('🔍 AuthContext - Visits result:', visitData);
      
      console.log('🔍 AuthContext - Loading stats...');
      const statsData = await StatsService.getBillingStats();
      console.log('🔍 AuthContext - Stats result:', statsData);
      
      setUserData(userData);
      setVisits(visitData);
      setBillingStats(statsData);
      
      console.log('✅ AuthContext - All data loaded successfully:', { 
        userData: userData ? 'loaded' : 'null', 
        visits: visitData.length, 
        stats: statsData ? 'loaded' : 'null' 
      });
    } catch (error) {
      console.error('❌ AuthContext - Failed to load application data:', error);
      console.error('❌ AuthContext - Error details:', error);
      setUserData(null);
      setVisits([]);
      setBillingStats(null);
    } finally {
      setDataLoading(false);
    }
  };

  // Function to refresh user data (for updates)
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    if (user) {
      await fetchAllData(user);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return;
      console.log('🔐 AuthContext - Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 AuthContext - Initial session:', session?.user ? 'authenticated' : 'not authenticated');
      
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch all application data if authenticated
      if (session?.user) {
        console.log('🔐 AuthContext - User authenticated, fetching all data...');
        await fetchAllData(session.user);
      } else {
        console.log('🔐 AuthContext - No user, skipping data fetch');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Only handle actual auth state changes, not INITIAL_SESSION
        if (event === 'INITIAL_SESSION') {
          console.log('🔐 AuthContext - Ignoring INITIAL_SESSION event');
          return;
        }
        
        console.log('🔐 AuthContext - Auth state changed:', event, session?.user ? 'authenticated' : 'not authenticated');
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch all application data if authenticated
        if (session?.user) {
          console.log('🔐 AuthContext - User authenticated, fetching all data...');
          await fetchAllData(session.user);
        } else {
          console.log('🔐 AuthContext - User logged out, clearing data');
          setUserData(null);
          setVisits([]);
          setBillingStats(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove supabase.auth from dependencies to prevent re-runs

  const signOut = async () => {
    try {
      console.log("🔐 AuthContext - Starting logout...");
      
      // Sign out from Supabase (this will trigger the onAuthStateChange listener)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ AuthContext - Supabase logout error:", error);
        throw error;
      }
      
      console.log("✅ AuthContext - Supabase logout successful");
      
      // Clear all local state immediately
      setUser(null);
      setUserData(null);
      setVisits([]);
      setBillingStats(null);
      setLoading(false);
      setUserDataLoading(false);
      setDataLoading(false);
      
      console.log("🧹 AuthContext - All local state cleared");
      
    } catch (error) {
      console.error("❌ AuthContext - Logout failed:", error);
      
      // Even if Supabase logout fails, clear local state
      setUser(null);
      setUserData(null);
      setVisits([]);
      setBillingStats(null);
      setLoading(false);
      setUserDataLoading(false);
      setDataLoading(false);
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      visits,
      billingStats,
      loading, 
      userDataLoading,
      dataLoading,
      signOut, 
      refreshUserData,
      refreshAllData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
