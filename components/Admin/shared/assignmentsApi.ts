// Client helpers for assigning employees to order items. These call the local
// Next.js proxy routes under /api/items/{orderItemId}/assignments, which attach
// the employee (Entra) bearer token server-side. The Manager / Owner role is
// enforced upstream (RequireManager).

export interface Assignment {
  id: string;
  orderItemId: string;
  employeeId: string;
  employeeName: string;
  assignedByUserId: string;
  assignedByName: string;
  assignedAt: string;
  notes: string | null;
}

// Upstream collection endpoints sometimes wrap the array in { items }. Read
// defensively so a list, a wrapped list or a lone record all normalise to an array.
function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (obj.id) return [obj as T];
  }
  return [];
}

async function ok(res: Response): Promise<void> {
  if (!res.ok) throw new Error(String(res.status));
}

export async function fetchAssignments(orderItemId: string): Promise<Assignment[]> {
  const res = await fetch(`/api/items/${orderItemId}/assignments`, { cache: "no-store" });
  await ok(res);
  return asArray<Assignment>(await res.json());
}

export async function createAssignment(
  orderItemId: string,
  input: { employeeId: string; notes?: string },
): Promise<{ id: string }> {
  const res = await fetch(`/api/items/${orderItemId}/assignments`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(input),
  });
  await ok(res);
  return (await res.json()) as { id: string };
}

export async function deleteAssignment(orderItemId: string, assignmentId: string): Promise<void> {
  const res = await fetch(`/api/items/${orderItemId}/assignments/${assignmentId}`, {
    method: "DELETE",
  });
  await ok(res);
}
