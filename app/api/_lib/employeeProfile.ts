// Syncs the signed-in Azure (Entra) staff member with the booking backend.
// Calls POST /api/auth/sync-profile (RequireStaff) using the employee's Entra
// access token so the backend can provision / update the staff record.
// Best-effort: returns null on any failure — a login must still succeed even
// when the backend is briefly unreachable.

export interface EmployeeProfile {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export async function syncEmployeeProfile(accessToken: string): Promise<EmployeeProfile | null> {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return null;

  try {
    const res = await fetch(`${BOOKING_API_BASE}/api/auth/sync-profile`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache:   "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as EmployeeProfile;
  } catch {
    return null;
  }
}
