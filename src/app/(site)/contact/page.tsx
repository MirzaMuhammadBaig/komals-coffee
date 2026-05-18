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

      <section className="section">
        <div className="container-base grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="card-hoverable group relative flex h-full flex-col gap-2 overflow-hidden p-6 active:scale-[0.98]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-caramel-500/0 blur-2xl transition-all duration-500 group-hover:bg-caramel-500/30" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-caramel-500/30">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <p className="relative mt-3 text-xs uppercase tracking-[0.2em] text-espresso-400">
                      {c.label}
                    </p>
                    <p className="relative font-display text-lg text-espresso-800 transition-colors duration-300 group-hover:text-caramel-700">
                      {c.value}
                    </p>
                  </a>
                </li>
              ))}
            </ul>

            <div className="card mt-6 p-6">
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

            <div className="card mt-6 bg-espresso-700 p-6 text-cream-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-caramel-400">
                Bulk & corporate
              </p>
              <h3 className="mt-2 font-display text-2xl text-cream-50">
                Office orders, birthday boxes, gift packs.
              </h3>
              <p className="mt-3 text-sm text-cream-100/70">
                Need 10+ drinks at once? A coffee-themed birthday surprise? Drop
                Komal a WhatsApp. She will work out timings and a custom
                quote.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <LocationHours />
    </>
  );
}
