import { cookies } from "next/headers";

export const COOKIE_ACCESS  = "lc_access";
export const COOKIE_REFRESH = "lc_refresh";

const BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
} as const;

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_ACCESS)?.value ?? null;
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string | null | undefined,
  accessExpiresIn: number,
): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_ACCESS, accessToken, { ...BASE, maxAge: accessExpiresIn });
  if (refreshToken) {
    jar.set(COOKIE_REFRESH, refreshToken, { ...BASE, maxAge: 30 * 24 * 60 * 60 });
  }
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_ACCESS);
  jar.delete(COOKIE_REFRESH);
}

async function refreshAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const refreshToken = jar.get(COOKIE_REFRESH)?.value;
  if (!refreshToken) return null;

  const base = process.env.BOOKING_API_BASE;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
      cache:   "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.accessToken) return null;

    const newAccess:  string = data.accessToken;
    const expiresIn:  number = data.expiresIn ?? 3600;
    const newRefresh: string = data.refreshToken ?? refreshToken;

    jar.set(COOKIE_ACCESS,  newAccess,  { ...BASE, maxAge: expiresIn });
    jar.set(COOKIE_REFRESH, newRefresh, { ...BASE, maxAge: 30 * 24 * 60 * 60 });

    return newAccess;
  } catch {
    return null;
  }
}

// Forwards a request to the upstream API using the cookie access token.
// Auto-refreshes on 401 and retries once. Returns the upstream Response.
export async function upstreamFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  let token = await getAccessToken();
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const headers = new Headers(init.headers as HeadersInit | undefined);
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) return res;
    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }

  return res;
}
