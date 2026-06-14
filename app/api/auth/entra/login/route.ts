import { NextResponse, type NextRequest } from "next/server";
import { buildAuthorizeUrl, pkceChallenge, randomString } from "@/app/api/_lib/entra";
import { setOAuthHandshakeCookie } from "@/app/api/_lib/entraCookie";

// GET /api/auth/entra/login?returnTo=/some/path
// Starts the Authorization Code + PKCE flow and redirects the browser to
// Microsoft Entra. The state + PKCE verifier are stashed in a short-lived
// HttpOnly cookie and validated in the callback.
export async function GET(request: NextRequest) {
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  const state = randomString();
  const codeVerifier = randomString(48);
  const codeChallenge = await pkceChallenge(codeVerifier);

  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl({ state, codeChallenge });
  } catch {
    return NextResponse.json({ error: "Entra not configured" }, { status: 500 });
  }

  const response = NextResponse.redirect(authorizeUrl);
  setOAuthHandshakeCookie(response, { state, codeVerifier, returnTo });
  return response;
}

// Only allow same-site relative paths, to prevent open-redirect via returnTo.
function sanitizeReturnTo(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}
