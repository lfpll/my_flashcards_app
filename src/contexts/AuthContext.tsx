import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { migrateLocalStorageToSupabase, MigrationResult } from '../utils/migration';
import { clearAdapterCache } from '../utils/storageAdapter';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  migrationStatus: 'idle' | 'migrating' | 'success' | 'error';
  migrationError: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // If user is already logged in (e.g., page refresh), sync localStorage data
      if (session?.user) {
        try {
          setMigrationStatus('migrating');
          clearAdapterCache();
          const migrationResult = await migrateLocalStorageToSupabase(session.user.id);
          clearAdapterCache(); // Clear again after migration
          
          if (migrationResult.success) {
            setMigrationStatus('success');
            setMigrationError(null);
          } else {
            setMigrationStatus('error');
            setMigrationError(migrationResult.message || 'Migration failed');
            console.error('Migration failed on initial session:', migrationResult.error);
            // Stay in localStorage mode if migration fails
          }
        } catch (migrationError) {
          console.error('Migration failed on initial session:', migrationError);
          setMigrationStatus('error');
          setMigrationError('Migration failed with an unexpected error');
          // Stay in localStorage mode if migration fails
        }
      } else {
        setMigrationStatus('idle');
        setMigrationError(null);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Clear adapter cache first when auth changes
        clearAdapterCache();
        
        // If user just signed in, migrate localStorage data BEFORE updating user state
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          try {
            setMigrationStatus('migrating');
            const migrationResult = await migrateLocalStorageToSupabase(session.user.id);
            clearAdapterCache(); // Clear again after migration to ensure fresh adapter
            
            if (migrationResult.success) {
              setMigrationStatus('success');
              setMigrationError(null);
            } else {
              setMigrationStatus('error');
              setMigrationError(migrationResult.message || 'Migration failed');
              console.error('Migration failed on auth state change:', migrationResult.error);
              // Still update user state - HybridAdapter will fall back to localStorage
            }
          } catch (migrationError) {
            console.error('Migration failed on auth state change:', migrationError);
            setMigrationStatus('error');
            setMigrationError('Migration failed with an unexpected error');
            // Still update user state - HybridAdapter will fall back to localStorage
          }
        } else if (!session?.user) {
          // User signed out
          setMigrationStatus('idle');
          setMigrationError(null);
        }
        
        // Update user state after migration completes (even if it failed)
        // HybridAdapter will handle fallback to localStorage if needed
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured. Please add your credentials to .env.local' } };
    }
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (!error && data.user) {
      // Trigger migration after successful signup
      try {
        setMigrationStatus('migrating');
        const migrationResult = await migrateLocalStorageToSupabase(data.user.id);
        clearAdapterCache();
        
        if (migrationResult.success) {
          setMigrationStatus('success');
          setMigrationError(null);
        } else {
          setMigrationStatus('error');
          setMigrationError(migrationResult.message || 'Migration failed');
          console.error('Migration failed:', migrationResult.error);
          // Don't fail signup if migration fails, but show error
        }
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
        setMigrationStatus('error');
        setMigrationError('Migration failed with an unexpected error');
        // Don't fail signup if migration fails
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured. Please add your credentials to .env.local' } };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error && data.user) {
      // Trigger migration after successful login (in case they signed up elsewhere)
      // Wait for migration to complete before returning
      try {
        setMigrationStatus('migrating');
        const migrationResult = await migrateLocalStorageToSupabase(data.user.id);
        clearAdapterCache();
        
        if (migrationResult.success) {
          setMigrationStatus('success');
          setMigrationError(null);
        } else {
          setMigrationStatus('error');
          setMigrationError(migrationResult.message || 'Migration failed');
          console.error('Migration failed:', migrationResult.error);
          // If migration fails, stay in localStorage mode
          // The auth state change handler will handle this, but we need to ensure
          // user state is updated so FlashcardContext can refresh
        }
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
        setMigrationStatus('error');
        setMigrationError('Migration failed with an unexpected error');
        // Don't fail login if migration fails, but stay in localStorage mode
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAdapterCache();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, migrationStatus, migrationError, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

