import { notFound, redirect } from "next/navigation";
import { getAccessToken } from "@/app/api/_lib/authCookie";
import DynamicEventDetail from "@/components/Account/DynamicEventDetail";
import { getDictionary, hasLocale } from "../../../dictionaries";

interface Props {
  params: Promise<{ lang: string; id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/account/login`);
  const dict = await getDictionary(lang);
  const account = dict.account as {
    event_detail: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicEventDetail
      locale={lang}
      eventId={id}
      dict={{
        event_detail: account.event_detail as unknown as Parameters<typeof DynamicEventDetail>[0]["dict"]["event_detail"],
        nav: account.nav as unknown as Parameters<typeof DynamicEventDetail>[0]["dict"]["nav"],
      }}
    />
  );
}
