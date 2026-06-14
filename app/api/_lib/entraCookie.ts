import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EntraTokens } from "./entra";

// Employee (Entra) session cookies — kept separate from the customer auth
// cookies (lc_access / lc_refresh) so the two login systems never collide.
export const COOKIE_EMP_ACCESS  = "lc_emp_access";
export const COOKIE_EMP_REFRESH = "lc_emp_refresh";
// Short-lived cookie holding the in-flight OAuth handshake (state + PKCE verifier).
export const COOKIE_EMP_OAUTH   = "lc_emp_oauth";

const BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
} as const;

const HANDSHAKE_TTL_SECONDS = 10 * 60;            // time allowed to complete login
const REFRESH_FALLBACK_SECONDS = 30 * 24 * 60 * 60; // 30 days

// ── JWT claims (read-only; not signature-verified) ───────────────────────────
// We trust tokens at issuance because they are fetched directly from Entra over
// TLS in the callback. Decoding here is only used to read claims and expiry.

export interface EntraClaims {
  oid?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string): EntraClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

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

export async function getEmployeeAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_EMP_ACCESS)?.value ?? null;
}

export async function getEmployeeRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_EMP_REFRESH)?.value ?? null;
}

// Returns the current employee's claims, or null if there is no valid,
// unexpired session cookie.
export async function getEmployeeSession(): Promise<EntraClaims | null> {
  const token = await getEmployeeAccessToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims?.exp || claims.exp <= Math.floor(Date.now() / 1000)) return null;
  return claims;
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
