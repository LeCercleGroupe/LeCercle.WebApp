import { notFound, redirect } from "next/navigation";
import { syncEmployeeProfile } from "@/app/api/_lib/employeeProfile";
import { getEmployeeAccessToken, getEmployeeSession } from "@/app/api/_lib/entraSession";
import DynamicAdminPanel from "@/components/Admin/DynamicAdminPanel";
import type { AdminDict } from "@/components/Admin/shared/types";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Auth-gated and session-dependent: never prerender or cache. The [lang] layout
// has generateStaticParams, which would otherwise make this route a static
// candidate and bake an unauthenticated redirect into the cache.
export const dynamic = "force-dynamic";

// Roles allowed into the admin panel. Employees get a restricted view (money,
// phone and email are hidden); Managers and Owners see everything.
const ADMIN_ROLES = ["LeCercle.Employee", "LeCercle.Manager", "LeCercle.Owner"];

export default async function AdminPage({ params }: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await getEmployeeSession();
  if (!session) {
    redirect(`/api/auth/entra/login?returnTo=${encodeURIComponent(`/${lang}/admin`)}`);
  }

  const dict = await getDictionary(lang);
  const t = dict.admin as unknown as AdminDict;

  const roles = session.roles ?? [];
  const allowed = roles.some((role) => ADMIN_ROLES.includes(role));

  if (!allowed) {
    return (
      <main className="min-h-svh bg-[#080808] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold text-[#f0f0f0] font-figtree tracking-tight">
          {t.access_denied_title}
        </h1>
        <p className="text-sm text-[#888] font-figtree tracking-tight max-w-md">
          {t.access_denied_subtitle}
        </p>
      </main>
    );
  }

  // Provision / update this staff member's record in the booking backend on
  // every admin load. Best-effort: never blocks rendering the panel. We keep the
  // returned profile id so the panel can load the signed-in member's own
  // unavailabilities (RequireStaff) and detect their own roster entry.
  const accessToken = await getEmployeeAccessToken();
  const profile = accessToken ? await syncEmployeeProfile(accessToken) : null;

  return (
    <DynamicAdminPanel
      locale={lang}
      user={{
        name: session.name ?? "—",
        email: session.email ?? session.preferred_username ?? "",
        roles,
        employeeId: profile?.id,
      }}
      dict={t}
    />
  );
}
