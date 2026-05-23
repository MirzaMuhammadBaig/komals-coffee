import Link from "next/link";
import {
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Coffee,
  MessageCircle,
} from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="mt-16 bg-espresso-800 text-cream-100 sm:mt-20">
      <div className="container-base grid gap-10 py-12 sm:grid-cols-2 sm:gap-12 sm:py-14 lg:grid-cols-4 lg:py-16">
        <div>
          <Link
            href="/"
            className="group flex items-center gap-2 font-display text-2xl font-bold text-cream-50 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <Coffee
              className="h-7 w-7 shrink-0 text-caramel-400 transition-transform duration-500 group-hover:rotate-[14deg]"
              strokeWidth={1.6}
            />
            <span className="flex flex-col leading-none">
              <span className="font-script text-2xl text-caramel-400 transition-colors group-hover:text-caramel-300 sm:text-3xl">
                Komal&apos;s
              </span>
              <span className="-mt-1 text-[10px] uppercase tracking-[0.3em] text-cream-100/70 sm:text-[11px] sm:tracking-[0.35em]">
                Coffee
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-100/70">
            {site.shortDescription}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-100/20 transition-all duration-300 hover:-translate-y-1 hover:border-caramel-400 hover:bg-caramel-400/10 hover:text-caramel-400 hover:shadow-lg hover:shadow-caramel-400/20 active:scale-90"
            >
              <Instagram className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-100/20 transition-all duration-300 hover:-translate-y-1 hover:border-caramel-400 hover:bg-caramel-400/10 hover:text-caramel-400 hover:shadow-lg hover:shadow-caramel-400/20 active:scale-90"
            >
              <Facebook className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
            </a>
            <a
              href={whatsappLink(site.contact.whatsapp)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-100/20 transition-all duration-300 hover:-translate-y-1 hover:border-caramel-400 hover:bg-caramel-400/10 hover:text-caramel-400 hover:shadow-lg hover:shadow-caramel-400/20 active:scale-90"
            >
              <MessageCircle className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-caramel-400">
            Reach Komal
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caramel-400" />
              <span>
                {site.address.line1}
                <br />
                {site.address.line2}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-caramel-400" />
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="link-underline transition-colors hover:text-caramel-400"
              >
                {site.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-caramel-400" />
              <a
                href={`mailto:${site.contact.email}`}
                className="link-underline transition-colors hover:text-caramel-400"
              >
                {site.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-caramel-400" />
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline transition-colors hover:text-caramel-400"
              >
                {site.social.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-caramel-400">
            Order hours
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-100/80">
            {site.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day.slice(0, 3)}</span>
                <span className="tabular-nums">
                  {h.open} – {h.close}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-cream-100/50">
            Last order accepted 30 mins before close.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-caramel-400">
            Stay caffeinated
          </h4>
          <p className="mt-4 text-sm text-cream-100/70">
            New menu drops, seasonal specials, and the occasional 10%-off code,
            for our list only.
          </p>
          <div className="mt-4">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container-base flex items-center justify-center py-6 text-xs text-cream-100/60">
          <p>
            © {new Date().getFullYear()} {site.name}. Brewed with love in
            Lahore.
          </p>
        </div>
      </div>
    </footer>
  );
}
