import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import VenuePage from "@/components/VenuePage";
import lafonte from "@/data/venues/lafonte";

export default async function LaFontePage({ params }: PageProps<"/[lang]/lafonte">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <VenuePage
      data={lafonte[lang] ?? lafonte.ro}
      locale={lang}
      contactLabel={dict.nav.contact}
      langLabel={dict.nav.lang}
    />
  );
}
