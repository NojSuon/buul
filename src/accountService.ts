import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import type { Mode } from './game';

// Everything that talks to Firebase. It's loaded on demand (see account.tsx), so the game itself
// starts without waiting for it.

export interface ModeStats {
  played: number;
  won: number;
}

export interface Profile {
  nickname: string;
  stats: Record<Mode, ModeStats>;
}

const provider = new GoogleAuthProvider();
const userDoc = (uid: string) => doc(db, 'users', uid);

export const watchUser = (callback: (uid: string | null) => void) =>
  onAuthStateChanged(auth, (user) => callback(user?.uid ?? null));

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}

export const signOutUser = () => signOut(auth);

// Loads the player's profile. On the first sign-in it creates one with a random nickname, so we
// never copy the player's real name from their Google account.
export async function loadProfile(uid: string): Promise<Profile> {
  const snap = await getDoc(userDoc(uid));
  if (snap.exists()) {
    const data = snap.data();
    return { nickname: data.nickname, stats: data.stats };
  }
  const profile: Profile = {
    nickname: `Player${Math.floor(1000 + Math.random() * 9000)}`,
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
// the player's data is erased, and finally the account itself.
export async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;
  await reauthenticateWithPopup(user, provider);
  await deleteDoc(userDoc(user.uid));
  await deleteUser(user);
}
