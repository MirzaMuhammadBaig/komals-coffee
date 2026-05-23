import { MapPin, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export default function LocationHours() {
  return (
    <section className="section bg-cream-100/50">
      <div className="container-base grid gap-10 sm:gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow">Order from us</p>
          <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:mt-4 sm:text-4xl lg:text-5xl">
            Based in Bahria Orchard.{" "}
            <em className="text-caramel-600">Delivered to you.</em>
          </h2>
          <p className="mt-3 text-sm text-espresso-600 sm:mt-4 sm:text-base">
            We are a home-based studio with no walk-in counter. Order via the
            website, WhatsApp, Instagram DM, or foodpanda. Sealed and insulated,
            arrives warm.
          </p>

          <ul className="mt-6 space-y-2 text-espresso-700 sm:mt-8 sm:space-y-3">
            <li className="group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-caramel-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              <div>
                <p className="font-semibold text-espresso-800">Base kitchen</p>
                <p className="text-sm text-espresso-600">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </p>
                <a
                  href={site.address.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline mt-1 inline-block text-sm font-semibold text-espresso-700 hover:text-caramel-700"
                >
                  Open in Google Maps →
                </a>
              </div>
            </li>
            <li className="group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100">
              <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-caramel-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              <div>
                <p className="font-semibold text-espresso-800">WhatsApp</p>
                <a
                  href={whatsappLink(site.contact.whatsapp)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline break-all text-sm text-espresso-600 hover:text-espresso-800"
                >
                  {site.contact.whatsapp}
                </a>
                <p className="text-xs text-espresso-400">
                  Fastest reply. Komal answers personally.
                </p>
              </div>
            </li>
            <li className="group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-caramel-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              <div>
                <p className="font-semibold text-espresso-800">Call</p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="link-underline break-all text-sm text-espresso-600 hover:text-espresso-800"
                >
                  {site.contact.phone}
                </a>
              </div>
            </li>
            <li className="group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-caramel-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div>
                <p className="font-semibold text-espresso-800">Order hours</p>
                <p className="text-sm text-espresso-600">
                  Daily · 11:00 AM – 10:00 PM (Fri/Sat till 11:00 PM)
                </p>
                <p className="text-xs text-espresso-400">
                  Last order 30 mins before close.
                </p>
              </div>
            </li>
            <li className="group flex gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-espresso-100">
              <Instagram className="mt-1 h-5 w-5 shrink-0 text-caramel-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div>
                <p className="font-semibold text-espresso-800">DM us</p>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline break-all text-sm text-espresso-600 hover:text-espresso-800"
                >
                  {site.social.instagramHandle}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="card group overflow-hidden transition-shadow duration-500 hover:shadow-2xl">
            <iframe
              title="Komal's Coffee, Bahria Orchard, Lahore"
              src={site.address.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[260px] w-full border-0 grayscale-[15%] transition-all duration-700 group-hover:grayscale-0 sm:h-[400px] lg:h-[480px]"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-center text-xs text-espresso-400">
            Exact address shared after order confirmation (pickup) or during
            delivery dispatch.
          </p>
        </div>
      </div>
    </section>
  );
}
