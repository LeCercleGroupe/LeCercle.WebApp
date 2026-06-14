import { NextResponse } from "next/server";
import { refreshTokens } from "@/app/api/_lib/entra";
import {
  clearEmployeeCookies,
  getEmployeeRefreshToken,
  setEmployeeCookies,
} from "@/app/api/_lib/entraCookie";

// POST /api/auth/entra/refresh
// Renews the employee access token from the stored refresh token. Clears the
// session if the refresh token is missing or rejected.
export async function POST() {
  const refreshToken = await getEmployeeRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    const response = NextResponse.json({ ok: true });
    // Entra may not return a new refresh token; keep the existing one if so.
    setEmployeeCookies(response, { ...tokens, refreshToken: tokens.refreshToken ?? refreshToken });
    return response;
  } catch {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    clearEmployeeCookies(response);
    return response;
  }
}
