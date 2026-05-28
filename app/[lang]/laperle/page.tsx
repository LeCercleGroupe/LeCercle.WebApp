import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import laperle from "@/data/venues/laperle";
import { SERVICE_IDS } from "@/components/BookingFlow/types";
import { fetchServicePackages, applyLivePackages } from "@/lib/venuePackages";

export default async function LaPerleePage({ params }: PageProps<"/[lang]/laperle">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const livePackages = await fetchServicePackages(SERVICE_IDS.laperle).catch(() => []);
  const data = applyLivePackages(laperle[lang] ?? laperle.ro, livePackages);

  return (
    <VenuePage
      data={data}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
