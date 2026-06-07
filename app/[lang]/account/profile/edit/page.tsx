import { notFound, redirect } from "next/navigation";
import { getAccessToken } from "@/app/api/_lib/authCookie";
import DynamicProfileEditPage from "@/components/Account/DynamicProfileEditPage";
import { getDictionary, hasLocale } from "../../../dictionaries";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ProfileEditPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const token = await getAccessToken();
  if (!token) redirect(`/${lang}/account/login`);
  const dict = await getDictionary(lang);
  const account = dict.account as {
    profile_edit_page: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicProfileEditPage
      locale={lang}
      dict={{
        profile_edit_page: account.profile_edit_page as unknown as Parameters<typeof DynamicProfileEditPage>[0]["dict"]["profile_edit_page"],
        nav: account.nav as unknown as Parameters<typeof DynamicProfileEditPage>[0]["dict"]["nav"],
      }}
    />
  );
}
