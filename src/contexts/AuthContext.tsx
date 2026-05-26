import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Check if Supabase is configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url');

// Conditionally import Supabase only if configured
let supabase: any = null;
let supabaseTypes: any = null;
if (isSupabaseConfigured) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch {
    console.warn('Supabase client failed to load. Using local auth fallback.');
  }
}

// Simple local user type for self-hosted mode
interface LocalUser {
  id: string;
  email: string;
  user_metadata: { username: string };
  created_at: string;
}

type UserType = LocalUser | any;

// Local auth storage keys
const LOCAL_AUTH_KEY = 'redwhale_local_auth';
const LOCAL_PROFILE_KEY = 'redwhale_local_profile';

// Local auth helpers
function getLocalUser(): LocalUser | null {
  try {
    const stored = localStorage.getItem(LOCAL_AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function setLocalUser(user: LocalUser | null) {
  if (user) localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(LOCAL_AUTH_KEY);
}

function getLocalProfile(): any {
  try {
    const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function setLocalProfile(profile: any) {
  if (profile) localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(LOCAL_PROFILE_KEY);
}

export async function getProfile(userId: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalProfile();
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: UserType | null;
  profile: any | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLocalMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Use Supabase auth
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        }
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        } else {
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // Use local auth fallback (self-hosted mode)
      const localUser = getLocalUser();
      if (localUser) {
        setUser(localUser);
        setProfile(getLocalProfile());
      }
      setLoading(false);
    }
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const email = `${username}@miaoda.com`;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { error: null };
      } else {
        // Local auth - check stored user
        const stored = getLocalUser();
        if (stored && stored.user_metadata?.username === username) {
          setUser(stored);
          setProfile(getLocalProfile());
          return { error: null };
        }
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const email = `${username}@miaoda.com`;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { error: null };
      } else {
        // Local auth - create user in localStorage
        const newUser: LocalUser = {
          id: `local_${Date.now()}`,
          email: `${username}@local.host`,
          user_metadata: { username },
          created_at: new Date().toISOString(),
        };
        const newProfile = {
          id: newUser.id,
          username,
          full_name: username,
          created_at: newUser.created_at,
        };
        setLocalUser(newUser);
        setLocalProfile(newProfile);
        setUser(newUser);
        setProfile(newProfile);
        return { error: null };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setLocalUser(null);
    setLocalProfile(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, signInWithUsername, signUpWithUsername, signOut, refreshProfile,
      isLocalMode: !isSupabaseConfigured,
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
