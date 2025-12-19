import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { migrateLocalStorageToSupabase } from '../utils/migration';
import { clearAdapterCache } from '../utils/storageAdapter';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear adapter cache when auth changes
        clearAdapterCache();
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
        await migrateLocalStorageToSupabase(data.user.id);
        clearAdapterCache();
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
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
      try {
        await migrateLocalStorageToSupabase(data.user.id);
        clearAdapterCache();
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
        // Don't fail login if migration fails
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
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

