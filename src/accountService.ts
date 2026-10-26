import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Mode } from './game';

// Everything about accounts that talks to Firebase. It's loaded on demand (see account.tsx), so
// the game itself starts without waiting for it.

export interface ModeStats {
  played: number;
  won: number;
}

export interface Profile {
  nickname: string;
  stats: Record<Mode, ModeStats>;
}

export interface SignedInUser {
  uid: string;
  // Guests are signed in anonymously: a random id, no email or name.
  guest: boolean;
}

const provider = new GoogleAuthProvider();
const userDoc = (uid: string) => doc(db, 'users', uid);

export const watchUser = (callback: (user: SignedInUser | null) => void) =>
  onAuthStateChanged(auth, (user) => callback(user ? { uid: user.uid, guest: user.isAnonymous } : null));

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}

// Signs a guest in anonymously so they can play online; returns their id.
export async function signInAsGuest(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  return (await signInAnonymously(auth)).user.uid;
}

export const signOutUser = () => signOut(auth);

// Loads the player's profile, or null on their first sign-in, before they've chosen a nickname.
export async function loadProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { nickname: data.nickname, stats: data.stats };
}

// Creates the profile with the nickname the player chose, so we never copy their real name from
// their Google account.
export async function createProfile(uid: string, nickname: string): Promise<Profile> {
  const profile: Profile = {
    nickname,
    stats: { race: { played: 0, won: 0 }, capture: { played: 0, won: 0 } },
  };
  await setDoc(userDoc(uid), { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export const saveNickname = (uid: string, nickname: string) => updateDoc(userDoc(uid), { nickname });

export const recordGame = (uid: string, mode: Mode, won: boolean) =>
  updateDoc(userDoc(uid), {
    [`stats.${mode}.played`]: increment(1),
    [`stats.${mode}.won`]: increment(won ? 1 : 0),
  });

// Firebase only deletes an account right after a sign-in, so we ask Google to confirm first. Then
// the player's online games and record are erased, and finally the account itself.
export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;
  await reauthenticateWithPopup(user, provider);
  const games = await getDocs(query(collection(db, 'games'), where('uids', 'array-contains', user.uid)));
  await Promise.all(games.docs.map((g) => deleteDoc(g.ref)));
  await deleteDoc(userDoc(user.uid));
  await deleteUser(user);
}
