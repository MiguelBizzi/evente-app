import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/events';
import { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error: any; session: Session | null }>;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  profileLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, session: null }),
  signOut: async () => {},
  fetchUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch user profile when session changes
      if (session?.user) {
        await fetchUserProfile();
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (user?.id && !loading) {
      fetchUserProfile();
    }
  }, [user?.id, loading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      // Profile will be fetched in useEffect when user changes
    }
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
        emailRedirectTo: undefined, // Não redireciona para email
      },
    });

    if (error) {
      return { error, session: null };
    }

    // Se houver sessão, significa que a confirmação está desabilitada e o usuário já está logado
    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);

      // Create user profile after successful signup
      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (existingProfile) {
          // Profile already exists, use it
          setUserProfile(existingProfile);
        } else {
          // Create new profile
          const { error: profileError, data: profileData } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              type: 'participant', // Default type
            })
            .select()
            .single();

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            // Don't fail the signup if profile creation fails, but log it
          } else if (profileData) {
            // Set the profile directly since we just created it
            setUserProfile(profileData);
          }
        }
      } catch (profileErr) {
        console.error('Error creating user profile:', profileErr);
      }
    }

    return { error: null, session: data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
