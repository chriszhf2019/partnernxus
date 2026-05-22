import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth-service';
import type { AuthUser, UserRole } from '../services/auth-service';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  role: UserRole;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_HIERARCHY: Record<UserRole, number> = { admin: 3, editor: 2, viewer: 1 };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((authUser) => {
      if (authUser) {
        // Auto-assign admin role for demo user
        if (authUser.email === 'admin@partnernxus.com') {
          authService.setUserRole(authUser.uid, 'admin');
        }
      }
      setUser(authUser);
      setLoading(false);
    });
    // Restore session
    authService.ensureDemoUser().catch(() => { /* demo user creation is optional */ });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await authService.login(email, password);
    if (authUser.email === 'admin@partnernxus.com') {
      authService.setUserRole(authUser.uid, 'admin');
    }
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const role: UserRole = user ? authService.getUserRole(user.uid) : 'viewer';

  const hasPermission = useCallback(
    (requiredRole: UserRole) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole],
    [role],
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, role, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};