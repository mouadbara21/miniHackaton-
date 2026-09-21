import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAjzsgM3byqAr3s0u34_6kv0DAE62lxsoo",
  authDomain: "vault-hackathon-92ce6.firebaseapp.com",
  projectId: "vault-hackathon-92ce6",
  storageBucket: "vault-hackathon-92ce6.firebasestorage.app",
  messagingSenderId: "787231289364",
  appId: "1:787231289364:web:f9dcef3a3f986b1e017701",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Auth Functions ---

/** Register a new user with email and password */
export async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
}

/** Sign in an existing user with email and password */
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
}

/** Sign out the current user */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    const firebaseError = error as { message?: string };
    return { error: firebaseError.message || 'Sign out failed' };
  }
}

/** Listen for auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Convert Firebase error codes to user-friendly messages */
function getErrorMessage(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export { auth };
export type { User };
