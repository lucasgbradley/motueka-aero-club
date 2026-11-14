import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
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
