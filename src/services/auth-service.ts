import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// 公司内部角色
// admin: 系统管理员, channel_director/manager: 渠道团队, marketing_director/manager: 市场团队, sales_director/manager: 销售团队
// 公司外部角色（渠道商）
// partner_admin: 渠道商管理员, partner_sales: 渠道商销售, partner_engineer: 渠道商工程师
export type UserRole = 'admin' | 'channel_director' | 'channel_manager' | 'marketing_director' | 'marketing_manager' | 'sales_director' | 'sales_manager' | 'partner_admin' | 'partner_sales' | 'partner_engineer';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '系统管理员',
  channel_director: '渠道总监', channel_manager: '渠道经理',
  marketing_director: '市场总监', marketing_manager: '市场经理',
  sales_director: '销售总监', sales_manager: '销售经理',
  partner_admin: '渠道商管理员', partner_sales: '渠道商销售', partner_engineer: '渠道商工程师',
};

// Internal vs external categorization
export const isInternalRole = (role: UserRole): boolean => ['admin','channel_director','channel_manager','marketing_director','marketing_manager','sales_director','sales_manager'].includes(role);
export const isExternalRole = (role: UserRole): boolean => ['partner_admin','partner_sales','partner_engineer'].includes(role);

const toAuthUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  return { uid: user.id, email: user.email, displayName: user.user_metadata?.display_name || null, photoURL: user.user_metadata?.avatar_url || null };
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');
    return toAuthUser(data.user)!;
  },
  signup: async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName || email.split('@')[0], role: 'partner_admin' } } });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup failed');
    return toAuthUser(data.user)!;
  },
  logout: async () => { await supabase.auth.signOut(); },
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data } = await supabase.auth.getSession();
    return toAuthUser(data.session?.user || null);
  },
  onAuthChange: (callback: (user: AuthUser | null) => void): (() => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(toAuthUser(session?.user || null)));
    return () => data.subscription.unsubscribe();
  },
  getUserRole: (uid: string): UserRole => {
    const stored = localStorage.getItem(`role_${uid}`);
    if (stored && Object.keys(ROLE_LABELS).includes(stored)) return stored as UserRole;
    return 'partner_sales';
  },
  setUserRole: (uid: string, role: UserRole): void => { localStorage.setItem(`role_${uid}`, role); },
  ensureDemoUser: async (): Promise<void> => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      try { await supabase.auth.signInWithPassword({ email: 'admin@partnernxus.com', password: 'admin123' }); }
      catch { try { await supabase.auth.signUp({ email: 'admin@partnernxus.com', password: 'admin123', options: { data: { display_name: 'Admin', role: 'admin' } } }); } catch { /* ok */ } }
    }
  },
};
