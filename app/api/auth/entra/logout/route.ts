import { NextResponse } from "next/server";
import { clearEmployeeCookies } from "@/app/api/_lib/entraCookie";

// POST /api/auth/entra/logout
// Clears the employee session cookies. (Entra single-sign-out can be added
// later by redirecting to the authority's logout URL.)
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearEmployeeCookies(response);
  return response;
}
