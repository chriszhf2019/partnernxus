import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type UserRole = 'admin' | 'editor' | 'viewer';

const userRoles: Record<string, UserRole> = {};

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return toAuthUser(cred.user);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: (): AuthUser | null => {
    const user = auth.currentUser;
    return user ? toAuthUser(user) : null;
  },

  onAuthChange: (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? toAuthUser(user) : null);
    });
  },

  getUserRole: (uid: string): UserRole => {
    return userRoles[uid] || 'viewer';
  },

  setUserRole: (uid: string, role: UserRole): void => {
    userRoles[uid] = role;
  },
};
