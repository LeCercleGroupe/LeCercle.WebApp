const AUTH_KEY = "lecercle_auth";
const PROFILE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days for form pre-fill

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;   // 1h — access token validity for API calls
  profileExpiresAt: number; // 30d — pre-fill profile data from past sessions
  user: {
    userId: string;
    customerId: string;
    email: string | null;
    phoneNumber: string | null;
    firstName: string;
    lastName: string;
    companyName: string | null;
    idno: string | null;
    isCompany: boolean;
  };
}

export interface AuthResult {
  auth: StoredAuth;
  tokensValid: boolean;
}

export function saveAuth(params: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  customerId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  companyName: string;
  idno: string;
  isCompany: boolean;
}): void {
  try {
    const auth: StoredAuth = {
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      tokenExpiresAt: Date.now() + params.expiresIn * 1000,
      profileExpiresAt: Date.now() + PROFILE_TTL_MS,
      user: {
        userId: params.userId,
        customerId: params.customerId,
        email: params.email || null,
        phoneNumber: params.phone && params.phone !== "+373" ? params.phone : null,
        firstName: params.firstName,
        lastName: params.lastName,
        companyName: params.isCompany ? params.companyName : null,
        idno: params.isCompany ? params.idno : null,
        isCompany: params.isCompany,
      },
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch { }
}

export function loadAuth(): AuthResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const auth: StoredAuth = JSON.parse(raw);

    // Profile data fully expired — clear and return nothing
    if (Date.now() >= auth.profileExpiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }

    return {
      auth,
      tokensValid: Date.now() < auth.tokenExpiresAt,
    };
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch { }
}

// Partial-update the stored user profile without touching tokens.
// Used by the booking flow to persist latest form values when the user
// continues past Step 5, and by the dashboard after fetching /api/auth/me.
export function updateAuthProfile(updates: Partial<StoredAuth["user"]>): void {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return;
    const stored: StoredAuth = JSON.parse(raw);
    stored.user = { ...stored.user, ...updates };
    // Refresh the 30-day profile TTL whenever the profile changes
    stored.profileExpiresAt = Date.now() + PROFILE_TTL_MS;
    localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
  } catch { }
}

async function refreshTokens(refreshToken: string): Promise<StoredAuth | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.accessToken) return null;

    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const stored: StoredAuth = JSON.parse(raw);
    stored.accessToken = data.accessToken;
    stored.refreshToken = data.refreshToken ?? stored.refreshToken;
    stored.tokenExpiresAt = Date.now() + (data.expiresIn ?? 3600) * 1000;
    localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
    return stored;
  } catch {
    return null;
  }
}

// Wrap fetch with automatic token refresh on 401.
// Pass the request without an Authorization header — this helper injects it.
export async function fetchWithRefresh(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const result = loadAuth();
  if (!result) throw new Error("No auth");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${result.auth.accessToken}`);

  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401) return res;

  const refreshed = await refreshTokens(result.auth.refreshToken);
  if (!refreshed) return res; // bubble up original 401

  headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
  res = await fetch(input, { ...init, headers });
  return res;
}
