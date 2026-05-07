"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { RefObject, ReactNode } from "react";

interface TokenCtx {
  tokenRef: RefObject<string | null>;
  error: boolean;
}

const Ctx = createContext<TokenCtx | null>(null);

export function useBookingToken(): TokenCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBookingToken must be used within BookingTokenProvider");
  return ctx;
}

export default function BookingTokenProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleRefresh(expiresIn: number) {
    if (timer.current) clearTimeout(timer.current);
    const delay = Math.max((expiresIn - 60) * 1000, 5_000);
    timer.current = setTimeout(fetchToken, delay);
  }

  async function fetchToken() {
    try {
      const r = await fetch("/api/booking/token");
      if (!r.ok) throw new Error(`${r.status}`);
      const { access_token, expires_in } = await r.json();
      tokenRef.current = access_token;
      if (error) setError(false);
      if (expires_in) scheduleRefresh(expires_in);
    } catch {
      setError(true);
      // Retry after 30s on failure
      timer.current = setTimeout(fetchToken, 30_000);
    }
  }

  useEffect(() => {
    fetchToken();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return <Ctx.Provider value={{ tokenRef, error }}>{children}</Ctx.Provider>;
}
