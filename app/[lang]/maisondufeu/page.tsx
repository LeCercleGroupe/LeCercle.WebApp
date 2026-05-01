import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import maisondufeu from "@/data/venues/maisondufeu";

export default async function MaisonDuFeuPage({ params }: PageProps<"/[lang]/maisondufeu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <VenuePage
      data={maisondufeu[lang] ?? maisondufeu.ro}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
