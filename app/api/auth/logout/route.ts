import { clearAuthCookies } from "@/app/api/_lib/authCookie";

export async function POST() {
  await clearAuthCookies();
  return Response.json({ ok: true });
}
