import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import maisondufeu from "@/data/venues/maisondufeu";
import { SERVICE_IDS } from "@/components/BookingFlow/types";
import { fetchServicePackages, applyLivePackages } from "@/lib/venuePackages";

export default async function MaisonDuFeuPage({ params }: PageProps<"/[lang]/maisondufeu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const livePackages = await fetchServicePackages(SERVICE_IDS.maisondufeu).catch(() => []);
  const data = applyLivePackages(maisondufeu[lang] ?? maisondufeu.ro, livePackages);

  return (
    <VenuePage
      data={data}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
