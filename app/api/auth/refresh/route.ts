import { clearAuthCookies, setAuthCookies } from "@/app/api/_lib/authCookie";
import { cookies } from "next/headers";

export async function POST() {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const jar = await cookies();
  const refreshToken = jar.get("lc_refresh")?.value;
  if (!refreshToken) return Response.json({ error: "No refresh token" }, { status: 401 });

  try {
    const res = await fetch(`${BOOKING_API_BASE}/api/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
      cache:   "no-store",
    });

    if (!res.ok) {
      await clearAuthCookies();
      return Response.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await res.json();
    if (!data.accessToken) {
      await clearAuthCookies();
      return Response.json({ error: "No token in response" }, { status: 401 });
    }

    await setAuthCookies(data.accessToken, data.refreshToken ?? refreshToken, data.expiresIn ?? 3600);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
