import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Настройки" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  // The stored shape uses null for "not set"; the form inputs want "".
  const initial = {
    ...settings,
    phoneSecondary: settings.phoneSecondary ?? "",
    telegram: settings.telegram ?? "",
    instagram: settings.instagram ?? "",
    facebook: settings.facebook ?? "",
    youtube: settings.youtube ?? "",
  };

  return (
    <>
      <PageHeader
        title="Настройки сайта"
        description="Контакты и валюта, которые показываются на всех четырёх языках"
      />
      <SettingsForm initial={initial} />
    </>
  );
}
