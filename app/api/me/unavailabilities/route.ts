import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// GET  /api/me/unavailabilities — the signed-in staff member's own blocked dates
// POST /api/me/unavailabilities — add a blocked date range
// Both upstream: RequireStaff. The GET is the REST counterpart to the documented
// POST/DELETE on this collection; if the backend has not implemented it yet the
// client surfaces an empty list rather than failing.
export async function GET() {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/me/unavailabilities`, { cache: "no-store" });
  return relayUpstream(res);
}

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.text();
  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/me/unavailabilities`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache:   "no-store",
  });
  return relayUpstream(res);
}
