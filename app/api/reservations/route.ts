import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const auth = request.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : (request.headers.get("x-real-ip") ?? "");

  let res: Response;
  try {
    res = await fetch(`${BOOKING_API_BASE}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ ...body, ipAddress }),
    });
  } catch (error) {
    console.error("[api/reservations] fetch failed:", error);
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }

  const text = await res.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return Response.json(data, { status: res.status });
}
