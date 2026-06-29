import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// DELETE /api/items/{orderItemId}/assignments/{assignmentId} — remove one
// employee assignment from an order item; responds 204 No Content.
// Proxies to the booking API with the employee (Entra) bearer token; the
// upstream enforces RequireManager (Manager / Owner only).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orderItemId: string; assignmentId: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { orderItemId, assignmentId } = await params;
  if (!orderItemId || !assignmentId) {
    return Response.json({ error: "Missing identifier" }, { status: 400 });
  }

  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/items/${orderItemId}/assignments/${assignmentId}`,
    { method: "DELETE", cache: "no-store" },
  );
  return relayUpstream(res);
}
