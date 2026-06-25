import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";
import { relayUpstream } from "@/app/api/_lib/relay";

// GET /api/employees/{employeeId}/unavailabilities — an employee's blocked dates
// (upstream: RequireStaff). Used by managers drilling into a roster member.
export async function GET(_request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { employeeId } = await params;
  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/employees/${employeeId}/unavailabilities`,
    { cache: "no-store" },
  );
  return relayUpstream(res);
}
