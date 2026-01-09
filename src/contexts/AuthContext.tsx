import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { startReplication, stopReplication } from '../utils/storageAdapter';

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

  // Start replication when user is authenticated
  const setupReplication = async (userId: string) => {
    try {
      setMigrationStatus('migrating');
      await startReplication(userId);
      setMigrationStatus('success');
      setMigrationError(null);
    } catch (error) {
      console.error('Replication setup failed:', error);
      setMigrationStatus('error');
      setMigrationError('Failed to sync with server');
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await setupReplication(session.user.id);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await setupReplication(session.user.id);
        } else if (!session?.user) {
          await stopReplication();
          setMigrationStatus('idle');
          setMigrationError(null);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } };
    }
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (!error && data.user) {
      await setupReplication(data.user.id);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error && data.user) {
      await setupReplication(data.user.id);
    }
    
    return { error };
  };

  const signOut = async () => {
    await stopReplication();
    if (supabase) {
      await supabase.auth.signOut();
    }
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
