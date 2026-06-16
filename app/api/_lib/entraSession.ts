import { cookies } from "next/headers";

// Read-only employee session helpers. Deliberately free of any `next/server`
// import so this module is safe to pull into Server Components / pages — the
// response-writing counterparts live in ./entraCookie (which imports
// NextResponse and must only be used from route handlers).

// Employee (Entra) session cookies — kept separate from the customer auth
// cookies (lc_access / lc_refresh) so the two login systems never collide.
export const COOKIE_EMP_ACCESS  = "lc_emp_access";
export const COOKIE_EMP_REFRESH = "lc_emp_refresh";
// Short-lived cookie holding the in-flight OAuth handshake (state + PKCE verifier).
export const COOKIE_EMP_OAUTH   = "lc_emp_oauth";

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
