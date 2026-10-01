"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Session = {
  cartCount: number;
  signedIn: boolean;
  firstName: string | null;
  wishlist: number[];
};

const EMPTY: Session = { cartCount: 0, signedIn: false, firstName: null, wishlist: [] };

type SessionContextValue = Session & {
  /** True until the first fetch lands, so the UI can avoid flashing a "0". */
  loading: boolean;
  refresh: () => Promise<void>;
  setWishlist: (productId: number, inWishlist: boolean) => void;
};

const SessionContext = createContext<SessionContextValue>({
  ...EMPTY,
  loading: true,
  refresh: async () => {},
  setWishlist: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/session", { cache: "no-store", signal });
      if (!res.ok) return;
      const data = (await res.json()) as Session;
      if (signal?.aborted) return;
      setSession(data);
    } catch {
      // Offline, aborted, or a transient error — keep whatever we already had.
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(), [load]);

  // Reads the visitor's cart and wishlist once the page is interactive. The
  // fetch is what keeps every catalogue page free of per-visitor state, and the
  // abort guard stops a late response writing into an unmounted tree.
  useEffect(() => {
    const controller = new AbortController();
    // react-hooks/set-state-in-effect cannot see that `load` only sets state
    // after an await, so it reads this as a synchronous cascade. Fetching on
    // mount with an abort guard is the pattern React documents for exactly this
    // case — subscribing to state that lives outside React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,
      loading,
      refresh,
      setWishlist: (productId, inWishlist) =>
        setSession((s) => ({
          ...s,
          wishlist: inWishlist
            ? [...new Set([...s.wishlist, productId])]
            : s.wishlist.filter((id) => id !== productId),
        })),
    }),
    [session, loading, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
