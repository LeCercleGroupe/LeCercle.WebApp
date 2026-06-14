import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/app/api/_lib/entra";
import {
  clearOAuthHandshakeCookie,
  readOAuthHandshakeCookie,
  setEmployeeCookies,
} from "@/app/api/_lib/entraCookie";

// GET /api/auth/entra/callback?code=...&state=...
// Microsoft redirects here after login. Validates state, exchanges the code for
// tokens, sets the employee session cookies, and redirects to `returnTo`.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const oauthError = params.get("error");
  const origin = request.nextUrl.origin;

  const fail = (reason: string) => {
    const response = NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(reason)}`);
    clearOAuthHandshakeCookie(response);
    return response;
  };

  // Entra reported an error (consent denied, user cancelled, etc.).
  if (oauthError) return fail(oauthError);

  const handshake = await readOAuthHandshakeCookie();
  if (!code || !state || !handshake || state !== handshake.state) {
    return fail("invalid_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code, handshake.codeVerifier);
    const response = NextResponse.redirect(`${origin}${handshake.returnTo}`);
    setEmployeeCookies(response, tokens);
    clearOAuthHandshakeCookie(response);
    return response;
  } catch {
    return fail("token_exchange_failed");
  }
}
