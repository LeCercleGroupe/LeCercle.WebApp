import { cookies } from "next/headers";
import { refreshTokens } from "./entra";
import { COOKIE_EMP_ACCESS, COOKIE_EMP_REFRESH, getEmployeeAccessToken } from "./entraSession";

// Forwards a request to the upstream booking API using the EMPLOYEE (Entra)
// access token — the counterpart to authCookie.upstreamFetch, which uses the
// customer token. Auto-refreshes on 401 and retries once. Route-handler only
// (writes cookies via the request jar).

const BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
} as const;

const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

async function refreshEmployeeToken(): Promise<string | null> {
  const jar = await cookies();
  const refreshToken = jar.get(COOKIE_EMP_REFRESH)?.value;
  if (!refreshToken) return null;

  try {
    const tokens = await refreshTokens(refreshToken);
    jar.set(COOKIE_EMP_ACCESS, tokens.accessToken, { ...BASE, maxAge: tokens.expiresIn });
    // Entra may not return a new refresh token; keep the existing one if so.
    jar.set(COOKIE_EMP_REFRESH, tokens.refreshToken ?? refreshToken, { ...BASE, maxAge: REFRESH_MAX_AGE });
    return tokens.accessToken;
  } catch {
    return null;
  }
}

export async function employeeUpstreamFetch(url: string, init: RequestInit = {}): Promise<Response> {
  let token = await getEmployeeAccessToken();
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const headers = new Headers(init.headers as HeadersInit | undefined);
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    token = await refreshEmployeeToken();
    if (!token) return res;
    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }

  return res;
}
