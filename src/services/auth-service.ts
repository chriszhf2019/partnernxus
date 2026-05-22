import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type UserRole = 'admin' | 'editor' | 'viewer';

const toAuthUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || null,
    photoURL: user.user_metadata?.avatar_url || null,
  };
};

// Roles stored in user metadata (synced from partners table in production)
const getUserRoleFromMetadata = (user: User): UserRole => {
  return (user.user_metadata?.role as UserRole) || 'viewer';
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');
    return toAuthUser(data.user)!;
  },

  signup: async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0], role: 'viewer' },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup failed');
    return toAuthUser(data.user)!;
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  getCurrentUser: (): AuthUser | null => {
    return toAuthUser(supabase.auth.getSession() ? null : null);
  },

  onAuthChange: (callback: (user: AuthUser | null) => void): (() => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user || null));
    });
    return () => data.subscription.unsubscribe();
  },

  getUserRole: (uid: string): UserRole => {
    // In production, fetch from partners table
    // For now, check localStorage for demo role override
    const stored = localStorage.getItem(`role_${uid}`);
    if (stored === 'admin' || stored === 'editor' || stored === 'viewer') return stored;
    return 'viewer';
  },

  setUserRole: (uid: string, role: UserRole): void => {
    localStorage.setItem(`role_${uid}`, role);
  },

  // Demo: create initial admin user
  ensureDemoUser: async (): Promise<void> => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      // Try to sign in as demo admin
      try {
        await supabase.auth.signInWithPassword({
          email: 'admin@partnernxus.com',
          password: 'admin123',
        });
      } catch {
        // Demo user doesn't exist, try to create
        try {
          await supabase.auth.signUp({
            email: 'admin@partnernxus.com',
            password: 'admin123',
            options: { data: { display_name: 'Admin', role: 'admin' } },
          });
        } catch {
          // Silently fail - user can create via UI
        }
      }
    }
  },
};
