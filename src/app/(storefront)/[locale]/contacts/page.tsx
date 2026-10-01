import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/settings";
import { alternatesFor, openGraph, samePath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LeadDialog } from "@/components/catalog/LeadDialog";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([getTranslations({ locale }), getSettings()]);
  const description = `${settings.phone} · ${settings.email} · ${settings.address}`;

  return {
    title: t("contacts.title"),
    description,
    alternates: alternatesFor(locale, samePath("/contacts")),
    openGraph: openGraph({ title: t("contacts.title"), description, locale, path: "/contacts" }),
  };
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([getTranslations(), getSettings()]);

  const rows = [
    {
      Icon: Phone,
      label: t("common.phone"),
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
    },
    { Icon: Mail, label: t("common.email"), value: settings.email, href: `mailto:${settings.email}` },
    { Icon: MapPin, label: t("common.address"), value: settings.address, href: null },
    { Icon: Clock, label: t("contacts.workingHours"), value: settings.workingHours, href: null },
  ];

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("contacts.title") }]} />
      <h1 className="text-2xl font-extrabold md:text-4xl">{t("contacts.title")}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="space-y-6">
          {rows.map(({ Icon, label, value, href }) => (
            <li key={label} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink-50 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
                {href ? (
                  <a href={href} className="mt-1 block text-lg font-bold transition hover:text-brand-600">
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-bold">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-card border border-ink-100 bg-ink-50/60 p-6">
          <h2 className="text-xl font-extrabold">{t("contacts.writeUs")}</h2>
          <p className="mt-2 text-sm text-ink-600">{t("lead.text")}</p>
          <LeadDialog
            locale={locale}
            type="CONTACT"
            size="lg"
            className="mt-6 w-full"
            labels={{
              trigger: t("lead.callback"),
              title: t("contacts.writeUs"),
              text: t("lead.text"),
              name: t("lead.name"),
              phone: t("common.phone"),
              message: t("lead.message"),
              send: t("common.send"),
              sending: t("common.sending"),
              sent: t("lead.sent"),
              sentText: t("lead.sentText"),
              close: t("common.close"),
              required: t("common.required"),
              error: t("common.somethingWrong"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
