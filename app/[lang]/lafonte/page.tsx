import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import lafonte from "@/data/venues/lafonte";
import { SERVICE_IDS } from "@/components/BookingFlow/types";
import { fetchServicePackages, applyLivePackages } from "@/lib/venuePackages";

export default async function LaFontePage({ params }: PageProps<"/[lang]/lafonte">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const livePackages = await fetchServicePackages(SERVICE_IDS.lafonte).catch(() => []);
  const data = applyLivePackages(lafonte[lang] ?? lafonte.ro, livePackages);

  return (
    <VenuePage
      data={data}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
