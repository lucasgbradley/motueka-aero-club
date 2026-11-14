import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAILS = [
  "it@motuekaaeroclub.com",
  "l.bradley@laserelectrical.co.nz"
];

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized) || normalized.endsWith("@motuekaaeroclub.com");
}

export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    try {
      await updateProfile(result.user, { displayName });
    } catch {
      // Ignored
    }
  }
  return result.user;
}

export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Smart login: tries sign-in first; if user account does not exist,
 * automatically registers the account with the provided password.
 */
export async function smartSignInOrRegister(email: string, pass: string, displayName?: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, isNewUser: false };
  } catch (err: any) {
    // If account doesn't exist or credentials invalid, attempt creation
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if (displayName && newCredential.user) {
          try {
            await updateProfile(newCredential.user, { displayName });
          } catch {
            // Ignored
          }
        }
        return { user: newCredential.user, isNewUser: true };
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          throw new Error('Incorrect password for this registered email. Please check your password.');
        } else if (createErr.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters long.');
        }
        throw createErr;
      }
    }
    throw err;
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
