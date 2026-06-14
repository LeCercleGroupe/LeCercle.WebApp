const AUTH_KEY = "lecercle_auth";
const PROFILE_TTL_MS = 60 * 60 * 1000;

// Non-HttpOnly profile cookie: holds non-sensitive user data the client reads
// synchronously. Auth tokens live in the HttpOnly lc_access / lc_refresh cookies.
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeMs: number): void {
  if (typeof document === "undefined") return;
  const maxAgeSeconds = Math.max(0, Math.floor(maxAgeMs / 1000));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}` +
    `; Path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

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
  sessionExpiresAt?: number;
}): void {
  try {
    const auth: StoredAuth = {
      profileExpiresAt: params.sessionExpiresAt ?? Date.now() + PROFILE_TTL_MS,
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
    const maxAgeMs = auth.profileExpiresAt - Date.now();
    writeCookie(AUTH_KEY, JSON.stringify(auth), maxAgeMs);
    // Drop any value left over from the old localStorage-based storage.
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  } catch {}
}

export function loadAuth(): AuthResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = readCookie(AUTH_KEY);
    if (!raw) {
      // Migrate away from the previous localStorage-based storage.
      try { localStorage.removeItem(AUTH_KEY); } catch {}
      return null;
    }
    const stored = JSON.parse(raw);

    // Clear old format that stored tokens alongside the profile.
    if ("accessToken" in stored || "tokenExpiresAt" in stored) {
      deleteCookie(AUTH_KEY);
      return null;
    }

    const auth: StoredAuth = stored;
    if (Date.now() >= auth.profileExpiresAt) {
      deleteCookie(AUTH_KEY);
      return null;
    }
    return { auth, tokensValid: true };
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  deleteCookie(AUTH_KEY);
  try { localStorage.removeItem(AUTH_KEY); } catch {}
  // Clear HttpOnly cookies server-side
  fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}

export function updateAuthProfile(updates: Partial<StoredAuth["user"]>): void {
  try {
    const raw = readCookie(AUTH_KEY);
    if (!raw) return;
    const stored: StoredAuth = JSON.parse(raw);
    stored.user = { ...stored.user, ...updates };
    const maxAgeMs = stored.profileExpiresAt - Date.now();
    writeCookie(AUTH_KEY, JSON.stringify(stored), maxAgeMs);
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
