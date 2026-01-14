import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
      joinedAt: session.user.created_at
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    return {
      id: data.user.id,
      email: data.user.email || '',
      username: data.user.user_metadata?.username || email.split('@')[0],
      joinedAt: data.user.created_at
    };
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    // Note: If you have email confirmation enabled in Supabase, the user won't be able to login immediately
    // unless you disable it in Authentication -> Providers -> Email -> Confirm email
    
    return {
      id: data.user.id,
      email: data.user.email || '',
      username: username,
      joinedAt: data.user.created_at
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};