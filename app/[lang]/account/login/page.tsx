import { notFound } from "next/navigation";
import DynamicAccountLogin from "@/components/Account/DynamicAccountLogin";
import { getDictionary, hasLocale } from "../../dictionaries";
import type { AccountDict } from "@/components/Account/AccountLogin";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function AccountLoginPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <DynamicAccountLogin locale={lang} dict={dict.account as AccountDict} />;
}
