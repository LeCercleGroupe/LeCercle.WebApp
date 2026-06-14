// Microsoft Entra (Azure AD) OAuth2 — Authorization Code + PKCE.
// Pure helpers: configuration, PKCE/state generation, authorize-URL building,
// and the server-side token exchange/refresh. Cookie handling lives in
// ./entraCookie — this file never touches cookies.

export const ENTRA_DEFAULT_SCOPE = "openid profile email offline_access";

export interface EntraConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authorizeUrl: string;
  tokenUrl: string;
  logoutUrl: string;
}

// Reads + validates the Entra environment. Throws if anything is missing so
// route handlers can surface a clean 500 instead of producing a broken request.
export function entraConfig(): EntraConfig {
  const {
    ENTRA_TENANT_ID,
    ENTRA_CLIENT_ID,
    ENTRA_CLIENT_SECRET,
    ENTRA_REDIRECT_URI,
    ENTRA_SCOPE,
  } = process.env;

  if (!ENTRA_TENANT_ID || !ENTRA_CLIENT_ID || !ENTRA_CLIENT_SECRET || !ENTRA_REDIRECT_URI) {
    throw new Error("Missing Entra environment configuration");
  }

  const authority = `https://login.microsoftonline.com/${ENTRA_TENANT_ID}`;
  return {
    clientId:     ENTRA_CLIENT_ID,
    clientSecret: ENTRA_CLIENT_SECRET,
    redirectUri:  ENTRA_REDIRECT_URI,
    scope:        ENTRA_SCOPE || ENTRA_DEFAULT_SCOPE,
    authorizeUrl: `${authority}/oauth2/v2.0/authorize`,
    tokenUrl:     `${authority}/oauth2/v2.0/token`,
    logoutUrl:    `${authority}/oauth2/v2.0/logout`,
  };
}

// ── PKCE + state ─────────────────────────────────────────────────────────────

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Buffer.from(buf).toString("base64url");
}

// URL-safe random string for `state` (CSRF) and the PKCE `code_verifier`.
export function randomString(byteLength = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

// PKCE S256 challenge derived from a verifier.
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(digest);
}

// ── Authorize URL ────────────────────────────────────────────────────────────

export function buildAuthorizeUrl(params: { state: string; codeChallenge: string }): string {
  const cfg = entraConfig();
  const url = new URL(cfg.authorizeUrl);
  url.search = new URLSearchParams({
    client_id:             cfg.clientId,
    response_type:         "code",
    redirect_uri:          cfg.redirectUri,
    response_mode:         "query",
    scope:                 cfg.scope,
    state:                 params.state,
    code_challenge:        params.codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

// ── Token exchange / refresh ─────────────────────────────────────────────────

export interface EntraTokens {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresIn: number;
}

interface EntraTokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

function parseTokenResponse(data: EntraTokenResponse): EntraTokens {
  if (!data.access_token) throw new Error("Entra token response missing access_token");
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token ?? null,
    idToken:      data.id_token ?? null,
    expiresIn:    data.expires_in ?? 3600,
  };
}

async function postToken(body: URLSearchParams): Promise<EntraTokens> {
  const cfg = entraConfig();
  const res = await fetch(cfg.tokenUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`Entra token request failed: ${res.status}`);
  return parseTokenResponse(await res.json());
}

// Exchanges an authorization code (+ PKCE verifier) for tokens.
export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<EntraTokens> {
  const cfg = entraConfig();
  return postToken(new URLSearchParams({
    grant_type:    "authorization_code",
    client_id:     cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri:  cfg.redirectUri,
    code,
    code_verifier: codeVerifier,
    scope:         cfg.scope,
  }));
}

// Renews tokens using a refresh token.
export async function refreshTokens(refreshToken: string): Promise<EntraTokens> {
  const cfg = entraConfig();
  return postToken(new URLSearchParams({
    grant_type:    "refresh_token",
    client_id:     cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: refreshToken,
    scope:         cfg.scope,
  }));
}
