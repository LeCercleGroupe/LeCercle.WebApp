import { notFound } from "next/navigation";
import DynamicProfilePage from "@/components/Account/DynamicProfilePage";
import { getDictionary, hasLocale } from "../../dictionaries";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const account = dict.account as {
    profile_page: Record<string, string>;
    nav: Record<string, string>;
  };
  return (
    <DynamicProfilePage
      locale={lang}
      dict={{
        profile_page: account.profile_page as unknown as Parameters<typeof DynamicProfilePage>[0]["dict"]["profile_page"],
        nav: account.nav as unknown as Parameters<typeof DynamicProfilePage>[0]["dict"]["nav"],
      }}
    />
  );
}
