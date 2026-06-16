import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EntraTokens } from "./entra";
import {
  COOKIE_EMP_ACCESS,
  COOKIE_EMP_OAUTH,
  COOKIE_EMP_REFRESH,
  decodeJwt,
} from "./entraSession";

// Response-writing employee session helpers. These import NextResponse and so
// must only be used from route handlers — never from a page / Server Component.
// Read-only counterparts (decodeJwt, getEmployeeSession, cookie names, etc.)
// live in ./entraSession and are re-exported here for backwards compatibility.
export {
  COOKIE_EMP_ACCESS,
  COOKIE_EMP_REFRESH,
  COOKIE_EMP_OAUTH,
  decodeJwt,
  getEmployeeAccessToken,
  getEmployeeRefreshToken,
  getEmployeeSession,
} from "./entraSession";
export type { EntraClaims } from "./entraSession";

const BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
} as const;

const HANDSHAKE_TTL_SECONDS = 10 * 60;            // time allowed to complete login
const REFRESH_FALLBACK_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Seconds until the token's `exp`, or a fallback if it can't be read.
function tokenMaxAge(token: string, fallbackSeconds: number): number {
  const claims = decodeJwt(token);
  if (claims?.exp) {
    const secs = claims.exp - Math.floor(Date.now() / 1000);
    if (secs > 0) return secs;
  }
  return fallbackSeconds;
}

// ── Session cookies ──────────────────────────────────────────────────────────

// Writes access + refresh cookies onto a response, each scoped to its JWT expiry.
export function setEmployeeCookies(response: NextResponse, tokens: EntraTokens): void {
  response.cookies.set(COOKIE_EMP_ACCESS, tokens.accessToken, {
    ...BASE,
    maxAge: tokenMaxAge(tokens.accessToken, tokens.expiresIn),
  });
  if (tokens.refreshToken) {
    response.cookies.set(COOKIE_EMP_REFRESH, tokens.refreshToken, {
      ...BASE,
      maxAge: tokenMaxAge(tokens.refreshToken, REFRESH_FALLBACK_SECONDS),
    });
  }
}

export function clearEmployeeCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_EMP_ACCESS,  "", { ...BASE, maxAge: 0 });
  response.cookies.set(COOKIE_EMP_REFRESH, "", { ...BASE, maxAge: 0 });
}

// ── OAuth handshake cookie ───────────────────────────────────────────────────

export interface OAuthHandshake {
  state: string;
  codeVerifier: string;
  returnTo: string;
}

export function setOAuthHandshakeCookie(response: NextResponse, value: OAuthHandshake): void {
  response.cookies.set(COOKIE_EMP_OAUTH, JSON.stringify(value), {
    ...BASE,
    maxAge: HANDSHAKE_TTL_SECONDS,
  });
}

export async function readOAuthHandshakeCookie(): Promise<OAuthHandshake | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_EMP_OAUTH)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthHandshake;
  } catch {
    return null;
  }
}

export function clearOAuthHandshakeCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_EMP_OAUTH, "", { ...BASE, maxAge: 0 });
}
