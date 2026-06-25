import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// GET  /api/employees           — list employees (upstream: RequireManager)
// POST /api/employees           — create an employee from a user id + specialization
// Both proxy to the booking API with the employee (Entra) bearer token; the
// upstream enforces the Manager role.
export async function GET() {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/employees`, { cache: "no-store" });
  return relayUpstream(res);
}

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.text();
  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/employees`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache:   "no-store",
  });
  return relayUpstream(res);
}
