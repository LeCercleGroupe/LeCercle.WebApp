import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// DELETE /api/me/unavailabilities/{unavailabilityId} — remove one of the signed-in
// staff member's blocked date ranges (upstream: RequireStaff).
export async function DELETE(_request: Request, { params }: { params: Promise<{ unavailabilityId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { unavailabilityId } = await params;
  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/me/unavailabilities/${unavailabilityId}`,
    { method: "DELETE", cache: "no-store" },
  );
  return relayUpstream(res);
}
