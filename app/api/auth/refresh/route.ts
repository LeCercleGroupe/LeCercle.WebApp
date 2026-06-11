import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_ACCESS  = "lc_access";
const COOKIE_REFRESH = "lc_refresh";

function jwtMaxAge(token: string, fallbackSeconds: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (typeof payload.exp === "number") {
      const secs = payload.exp - Math.floor(Date.now() / 1000);
      if (secs > 0) return secs;
    }
  } catch {}
  return fallbackSeconds;
}

const COOKIE_BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};

function clearCookies(response: NextResponse) {
  response.cookies.set(COOKIE_ACCESS,  "", { ...COOKIE_BASE, maxAge: 0 });
  response.cookies.set(COOKIE_REFRESH, "", { ...COOKIE_BASE, maxAge: 0 });
}

export async function POST() {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return NextResponse.json({ error: "Missing config" }, { status: 500 });

  const jar = await cookies();
  const refreshToken = jar.get(COOKIE_REFRESH)?.value;
  if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const res = await fetch(`${BOOKING_API_BASE}/api/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
      cache:   "no-store",
    });

    if (!res.ok) {
      const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
      clearCookies(response);
      return response;
    }

    const data = await res.json();
    const accessToken  = data.accessToken  ?? data.access_token  ?? null;
    const newRefresh   = data.refreshToken ?? data.refresh_token ?? refreshToken;
    const expiresIn    = data.expiresIn    ?? data.expires_in    ?? 3600;

    if (!accessToken) {
      const response = NextResponse.json({ error: "No token in response" }, { status: 401 });
      clearCookies(response);
      return response;
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_ACCESS,  accessToken, { ...COOKIE_BASE, maxAge: jwtMaxAge(accessToken, expiresIn) });
    response.cookies.set(COOKIE_REFRESH, newRefresh,  { ...COOKIE_BASE, maxAge: jwtMaxAge(newRefresh, 30 * 24 * 60 * 60) });
    return response;
  } catch {
    return NextResponse.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
