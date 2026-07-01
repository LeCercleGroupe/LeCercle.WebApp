import { NextResponse, type NextRequest } from "next/server";
import { entraConfig } from "@/app/api/_lib/entra";
import { clearEmployeeCookies } from "@/app/api/_lib/entraCookie";

// GET /api/auth/entra/logout?returnTo=/en
// Full single sign-out: clears the local employee session cookies AND redirects
// through Microsoft Entra's logout endpoint so the SSO session itself is ended.
// Without this, Microsoft keeps the user signed in and the next login silently
// re-joins the same account (a wrong-account risk on shared machines).
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const postLogoutRedirectUri = `${origin}${returnTo}`;

  let destination = postLogoutRedirectUri;
  try {
    const url = new URL(entraConfig().logoutUrl);
    url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
    destination = url.toString();
  } catch {
    // Entra not configured — fall back to a local redirect after clearing cookies.
  }

  const response = NextResponse.redirect(destination);
  clearEmployeeCookies(response);
  return response;
}

// Only allow same-site relative paths, to prevent open-redirect via returnTo.
function sanitizeReturnTo(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}
