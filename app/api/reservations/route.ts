import { type NextRequest } from "next/server";
import { getM2MToken } from "@/app/api/_lib/m2m";

export async function POST(request: NextRequest) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  let token: string;
  try { token = await getM2MToken(); }
  catch { return Response.json({ error: "Failed to acquire M2M token" }, { status: 502 }); }

  const body = await request.json();

  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress =
    (forwarded ? forwarded.split(",")[0].trim() : null) ??
    request.headers.get("x-real-ip");

  const payload = { ...body, ipAddress };
  console.log("[reservations] payload →", JSON.stringify(payload));

  const res = await fetch(`${BOOKING_API_BASE}/api/reservations`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("[reservations] upstream →", res.status, text);
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
