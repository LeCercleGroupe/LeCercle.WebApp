import LeCercleHero from "@/components/MainHero/LeCercleHero";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main>
      <LeCercleHero dict={dict} locale={lang} />
    </main>
  );
}
