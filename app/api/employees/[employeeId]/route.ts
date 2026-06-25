import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// GET /api/employees/{employeeId} — one employee  (upstream: RequireManager)
// PUT /api/employees/{employeeId} — update specialization / availability
export async function GET(_request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { employeeId } = await params;
  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/employees/${employeeId}`, { cache: "no-store" });
  return relayUpstream(res);
}

export async function PUT(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { employeeId } = await params;
  const body = await request.text();
  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/employees/${employeeId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body,
    cache:   "no-store",
  });
  return relayUpstream(res);
}
