import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import lebureau from "@/data/venues/lebureau";

export default async function LeBureauPage({ params }: PageProps<"/[lang]/lebureau">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <VenuePage
      data={lebureau[lang] ?? lebureau.ro}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
