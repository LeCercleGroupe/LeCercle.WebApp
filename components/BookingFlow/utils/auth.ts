const AUTH_KEY = "lecercle_auth";
const PROFILE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface StoredAuth {
  profileExpiresAt: number;
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
      profileExpiresAt: Date.now() + PROFILE_TTL_MS,
      user: {
        userId:      params.userId,
        customerId:  params.customerId,
        email:       params.email || null,
        phoneNumber: params.phone && params.phone !== "+373" ? params.phone : null,
        firstName:   params.firstName,
        lastName:    params.lastName,
        companyName: params.isCompany ? params.companyName : null,
        idno:        params.isCompany ? params.idno        : null,
        isCompany:   params.isCompany,
      },
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {}
}

export function loadAuth(): AuthResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);

    // Clear old format that stored tokens in localStorage
    if ("accessToken" in stored || "tokenExpiresAt" in stored) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }

    const auth: StoredAuth = stored;
    if (Date.now() >= auth.profileExpiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return { auth, tokensValid: true };
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
  // Clear HttpOnly cookies server-side
  fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}

export function updateAuthProfile(updates: Partial<StoredAuth["user"]>): void {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return;
    const stored: StoredAuth = JSON.parse(raw);
    stored.user = { ...stored.user, ...updates };
    stored.profileExpiresAt = Date.now() + PROFILE_TTL_MS;
    localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
  } catch {}
}

// Cookies are sent automatically by the browser — no Authorization header needed.
// This is kept for call-site compatibility; it's now just a fetch wrapper.
export async function fetchWithRefresh(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(input, init);
}
