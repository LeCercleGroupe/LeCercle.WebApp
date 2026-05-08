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
  } catch {}
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
  } catch {}
}
