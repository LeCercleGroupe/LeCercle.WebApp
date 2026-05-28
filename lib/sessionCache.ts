const PREFIX = "lc:cache:";

interface Entry<T> {
  d: T;
  t: number;
}

export const TTL = {
  SHORT: 3 * 60 * 1000,   // 3 min — order/event detail
  MEDIUM: 5 * 60 * 1000,  // 5 min — lists
} as const;

export function sessionGet<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: Entry<T> = JSON.parse(raw);
    if (Date.now() - entry.t > ttlMs) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.d;
  } catch {
    return null;
  }
}

export function sessionSet<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ d: data, t: Date.now() }));
  } catch {}
}

export function sessionInvalidate(...keys: string[]): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of keys) sessionStorage.removeItem(PREFIX + key);
  } catch {}
}

/** Remove all cache entries whose key starts with the given prefix. */
export function sessionInvalidatePrefix(prefix: string): void {
  if (typeof window === "undefined") return;
  try {
    const full = PREFIX + prefix;
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(full)) toRemove.push(k);
    }
    for (const k of toRemove) sessionStorage.removeItem(k);
  } catch {}
}
