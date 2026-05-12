import { notFound } from "next/navigation";
import DynamicContractsPage from "@/components/Account/DynamicContractsPage";
import { getDictionary, hasLocale } from "../../dictionaries";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ContractsPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const account = dict.account as {
    contracts_page: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicContractsPage
      locale={lang}
      dict={{
        contracts_page: account.contracts_page as unknown as Parameters<typeof DynamicContractsPage>[0]["dict"]["contracts_page"],
        nav: account.nav as unknown as Parameters<typeof DynamicContractsPage>[0]["dict"]["nav"],
      }}
    />
  );
}
