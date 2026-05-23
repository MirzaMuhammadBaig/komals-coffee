import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Instagram } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import LocationHours from "@/components/LocationHours";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Komal's Coffee. Orders, bulk requests, events, collaborations, partnerships.",
};

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp (fastest)",
    value: site.contact.whatsapp,
    href: whatsappLink(site.contact.whatsapp),
  },
  {
    icon: Phone,
    label: "Call",
    value: site.contact.phone,
    href: `tel:${site.contact.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: site.social.instagramHandle,
    href: site.social.instagram,
  },
  {
    icon: MapPin,
    label: "Kitchen",
    value: site.address.line1,
    href: site.address.mapsUrl,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Komal answers personally."
        description="Orders, bulk requests, events, collaborations. Komal reads and replies to every message herself. Usually within an hour."
      />

      {/* Quick channels — 5 cards in a responsive grid */}
      <section className="pt-10 sm:pt-20">
        <div className="container-base">
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="card-hoverable group relative flex h-full flex-col gap-2 overflow-hidden p-4 active:scale-[0.98] sm:p-5 lg:p-6"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-caramel-500/0 blur-2xl transition-all duration-500 group-hover:bg-caramel-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-caramel-500/30">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="relative mt-3 text-[10px] uppercase tracking-[0.18em] text-espresso-400 sm:text-[11px] sm:tracking-[0.2em]">
                    {c.label}
                  </p>
                  <p className="relative break-words font-display text-sm text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700 sm:text-base lg:text-[15px] xl:text-lg">
                    {c.value}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Order hours + Bulk corporate — side by side, each sized to its own content */}
      <section className="pt-6 sm:pt-8">
        <div className="container-base grid items-start gap-4 md:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Order hours</p>
            <ul className="mt-4 divide-y divide-espresso-100 text-sm text-espresso-700">
              {site.hours.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between py-2.5"
                >
                  <span>{h.day}</span>
                  <span className="tabular-nums text-espresso-500">
                    {h.open} – {h.close}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-espresso-400">
              Last order accepted 30 mins before close.
            </p>
          </div>

          <div className="card bg-espresso-700 p-5 text-cream-100 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-caramel-400 sm:text-xs">
              Bulk & corporate
            </p>
            <h3 className="mt-2 font-display text-xl text-cream-50 sm:text-2xl">
              Office orders, birthday boxes, gift packs.
            </h3>
            <p className="mt-3 text-sm text-cream-100/70">
              Need 10+ drinks at once? A coffee-themed birthday surprise?
              Mention the details in the form below and Komal will work out
              timings and a custom quote.
            </p>
          </div>
        </div>
      </section>

      {/* Contact form — centered, capped width for readable line lengths */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="container-base">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="eyebrow">Or send a message</p>
              <h2 className="mt-2 font-display text-2xl text-espresso-800 sm:mt-3 sm:text-3xl lg:text-4xl">
                Anything else on your mind?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-espresso-500">
                Fill the form below — Komal will reply to your email within a
                few hours during order time.
              </p>
            </div>
            <div className="mt-8 sm:mt-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <LocationHours />
    </>
  );
}
