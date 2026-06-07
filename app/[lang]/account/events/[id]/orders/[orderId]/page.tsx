import { notFound, redirect } from "next/navigation";
import { getAccessToken } from "@/app/api/_lib/authCookie";
import DynamicOrderDetail from "@/components/Account/DynamicOrderDetail";
import { getDictionary, hasLocale } from "../../../../../dictionaries";

interface Props {
  params: Promise<{ lang: string; id: string; orderId: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { lang, id, orderId } = await params;
  if (!hasLocale(lang)) notFound();
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/account/login`);
  const dict = await getDictionary(lang);
  const account = dict.account as {
    event_detail: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicOrderDetail
      locale={lang}
      eventId={id}
      orderId={orderId}
      dict={{
        event_detail: account.event_detail as unknown as Parameters<typeof DynamicOrderDetail>[0]["dict"]["event_detail"],
        nav: account.nav as unknown as Parameters<typeof DynamicOrderDetail>[0]["dict"]["nav"],
      }}
    />
  );
}
