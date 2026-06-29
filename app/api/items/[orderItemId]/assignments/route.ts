import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// GET  /api/items/{orderItemId}/assignments — list the employees assigned to one
//      order item.
// POST /api/items/{orderItemId}/assignments — assign an employee to the item from
//      { employeeId, notes? }; responds 201 with { id }.
// Both proxy to the booking API with the employee (Entra) bearer token; the
// upstream enforces RequireManager (Manager / Owner only).
export async function GET(_request: Request, { params }: { params: Promise<{ orderItemId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { orderItemId } = await params;
  if (!orderItemId) return Response.json({ error: "Missing order item id" }, { status: 400 });

  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/items/${orderItemId}/assignments`,
    { cache: "no-store" },
  );
  return relayUpstream(res);
}

export async function POST(request: Request, { params }: { params: Promise<{ orderItemId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { orderItemId } = await params;
  if (!orderItemId) return Response.json({ error: "Missing order item id" }, { status: 400 });

  const body = await request.text();
  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/items/${orderItemId}/assignments`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache:   "no-store",
    },
  );
  return relayUpstream(res);
}
