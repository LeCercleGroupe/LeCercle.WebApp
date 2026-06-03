import { type NextRequest } from "next/server";
import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function PUT(request: NextRequest) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.json();
  const { userId, firstName, lastName, displayName, phoneNumber, companyName, idno } = body;

  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const payload: Record<string, unknown> = {
    id: userId,
    displayName: displayName ?? `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    ...(firstName   !== undefined && { firstName }),
    ...(lastName    !== undefined && { lastName }),
    ...(phoneNumber !== undefined && { phoneNumber }),
    ...(companyName !== undefined && { companyName }),
    ...(idno        !== undefined && { idno }),
  };

  const res = await upstreamFetch(`${BOOKING_API_BASE}/api/users/${userId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (res.status === 204) return new Response(null, { status: 204 });

  const text = await res.text();
  return Response.json({ error: text || "Update failed" }, { status: res.status });
}
