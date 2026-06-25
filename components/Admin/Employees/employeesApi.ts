// Client helpers for the employee-management views. These call the local Next.js
// proxy routes under /api/employees and /api/me/unavailabilities, which attach
// the employee (Entra) bearer token server-side. Roles are enforced upstream.

export interface Employee {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  specialization: string;
  isAvailable: boolean;
  hiredAt: string;
}

export interface Unavailability {
  id: string;
  employeeId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  createdAt?: string;
}

// Upstream collection endpoints sometimes wrap the array in { items } / { events }.
// Read defensively so a single object or a wrapped list both normalise to an array.
function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.unavailabilities)) return obj.unavailabilities as T[];
    if (obj.id) return [obj as T]; // a lone record
  }
  return [];
}

async function ok(res: Response): Promise<void> {
  if (!res.ok) throw new Error(String(res.status));
}

// ── Employees (Manager) ──────────────────────────────────────────────────────

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch("/api/employees", { cache: "no-store" });
  await ok(res);
  return asArray<Employee>(await res.json());
}

export async function createEmployee(input: { userId: string; specialization: string }): Promise<void> {
  const res = await fetch("/api/employees", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(input),
  });
  await ok(res);
}

export async function updateEmployee(employee: Employee): Promise<void> {
  const res = await fetch(`/api/employees/${employee.id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      id:             employee.id,
      specialization: employee.specialization,
      isAvailable:    employee.isAvailable,
    }),
  });
  await ok(res);
}

// ── Unavailabilities ─────────────────────────────────────────────────────────

// A manager viewing one roster member's blocked dates.
export async function fetchEmployeeUnavailabilities(employeeId: string): Promise<Unavailability[]> {
  const res = await fetch(`/api/employees/${employeeId}/unavailabilities`, { cache: "no-store" });
  await ok(res);
  return asArray<Unavailability>(await res.json());
}

// The signed-in staff member's own blocked dates. Tolerates a not-yet-implemented
// GET upstream by returning an empty list instead of throwing.
export async function fetchMyUnavailabilities(): Promise<Unavailability[]> {
  const res = await fetch("/api/me/unavailabilities", { cache: "no-store" });
  if (!res.ok) return [];
  return asArray<Unavailability>(await res.json());
}

export async function addMyUnavailability(input: {
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<Unavailability> {
  const res = await fetch("/api/me/unavailabilities", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(input),
  });
  await ok(res);
  const data = await res.json();
  return { id: data.id, ...input };
}

export async function deleteMyUnavailability(unavailabilityId: string): Promise<void> {
  const res = await fetch(`/api/me/unavailabilities/${unavailabilityId}`, { method: "DELETE" });
  await ok(res);
}
