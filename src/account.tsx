import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Mode } from './game';
import type { Profile } from './accountService';

type Service = typeof import('./accountService');

export type AccountStatus = 'loading' | 'signedOut' | 'signedIn';

// Firebase error codes worth explaining to the player; anything else shows a general message.
export type AccountError = 'unauthorized-domain' | 'popup-blocked' | 'network' | 'other';

interface Account {
  status: AccountStatus;
  profile: Profile | null;
  error: AccountError | null;
  busy: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  rename: (nickname: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  recordGame: (mode: Mode, won: boolean) => void;
}

const AccountContext = createContext<Account | null>(null);

function toAccountError(e: unknown): AccountError | null {
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/unauthorized-domain') return 'unauthorized-domain';
  if (code === 'auth/popup-blocked') return 'popup-blocked';
  if (code === 'auth/network-request-failed' || code === 'unavailable') return 'network';
  return 'other';
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const service = useRef<Promise<Service> | null>(null);
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<AccountError | null>(null);
  const [busy, setBusy] = useState(false);

  // Load Firebase in the background once the game is on screen, then follow the sign-in state.
  useEffect(() => {
    service.current = import('./accountService');
    let unsubscribe = () => {};
    let cancelled = false;
    service.current.then((s) => {
      if (cancelled) return;
      unsubscribe = s.watchUser(async (nextUid) => {
        setUid(nextUid);
        if (!nextUid) {
          setProfile(null);
          setStatus('signedOut');
          return;
        }
        try {
          setProfile(await s.loadProfile(nextUid));
          setStatus('signedIn');
        } catch (e) {
          setError(toAccountError(e));
          setStatus('signedIn');
        }
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Runs an account action, showing it as busy and keeping any error for the Account popup.
  const run = useCallback(async (action: (s: Service) => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action(await service.current!);
    } catch (e) {
      setError(toAccountError(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const account: Account = {
    status,
    profile,
    error,
    busy,
    signIn: () => run((s) => s.signInWithGoogle()),
    signOut: () => run((s) => s.signOutUser()),
    rename: (nickname) =>
      run(async (s) => {
        await s.saveNickname(uid!, nickname);
        setProfile((p) => (p ? { ...p, nickname } : p));
      }),
    deleteAccount: () => run((s) => s.deleteAccount()),
    recordGame: (mode, won) => {
      if (!uid || !profile) return;
      setProfile({
        ...profile,
        stats: {
          ...profile.stats,
          [mode]: { played: profile.stats[mode].played + 1, won: profile.stats[mode].won + (won ? 1 : 0) },
        },
      });
      service.current?.then((s) => s.recordGame(uid, mode, won)).catch(() => {});
    },
  };

  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext)!;
}
