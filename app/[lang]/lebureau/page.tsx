import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import lebureau from "@/data/venues/lebureau";
import { SERVICE_IDS } from "@/components/BookingFlow/types";
import { fetchServicePackages, applyLivePackages } from "@/lib/venuePackages";

export default async function LeBureauPage({ params }: PageProps<"/[lang]/lebureau">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const livePackages = await fetchServicePackages(SERVICE_IDS.lebureau).catch(() => []);
  const data = applyLivePackages(lebureau[lang] ?? lebureau.ro, livePackages);

  return (
    <VenuePage
      data={data}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
