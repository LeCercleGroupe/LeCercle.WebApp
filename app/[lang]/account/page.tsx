import { notFound, redirect } from "next/navigation";
import { getAccessToken } from "@/app/api/_lib/authCookie";
import DynamicEventsOverview from "@/components/Account/DynamicEventsOverview";
import { getDictionary, hasLocale } from "../dictionaries";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function AccountPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/account/login`);
  const dict = await getDictionary(lang);
  const account = dict.account as {
    events_page: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicEventsOverview
      locale={lang}
      dict={{
        events_page: account.events_page as unknown as Parameters<typeof DynamicEventsOverview>[0]["dict"]["events_page"],
        nav: account.nav as unknown as Parameters<typeof DynamicEventsOverview>[0]["dict"]["nav"],
      }}
    />
  );
}
