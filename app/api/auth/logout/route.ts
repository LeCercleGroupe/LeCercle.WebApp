import { NextResponse } from "next/server";

const COOKIE_BASE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("lc_access",  "", { ...COOKIE_BASE, maxAge: 0 });
  response.cookies.set("lc_refresh", "", { ...COOKIE_BASE, maxAge: 0 });
  return response;
}
