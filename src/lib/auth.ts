import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, isConfigured } from './firebase';

const provider = new GoogleAuthProvider();

export type AuthUser = User;

export function signInWithGoogle(): Promise<User> {
  if (!auth) return Promise.reject(new Error('Firebase is not configured.'));
  return signInWithPopup(auth, provider).then(result => result.user);
}

export function signOutUser(): Promise<void> {
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

export function watchAuth(next: (user: AuthUser | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, next);
}

export function authErrorMessage(e: unknown) {
  if (!isConfigured) return 'Firebase is not configured. Add VITE_FIREBASE_* to .env.local.';
  const code = readCode(e);
  if (code === 'auth/popup-closed-by-user') return 'Sign-in window closed. Try again.';
  if (code === 'auth/popup-blocked') return 'Popup blocked. Allow popups for this site and retry.';
  if (code === 'auth/invalid-api-key') return 'Firebase API key is invalid. Check .env.local.';
  return e instanceof Error ? e.message : 'Could not sign in. Try again.';
}

function readCode(e: unknown) {
  if (typeof e !== 'object' || e === null || !('code' in e)) return '';
  const value = (e as { code: unknown }).code;
  return typeof value === 'string' ? value : '';
}
