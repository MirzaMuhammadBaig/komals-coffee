import { AlertCircle, Megaphone, MessageCircle } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

/**
 * Site-wide notice strip. Renders in two tones:
 *  - "warn"  → store is closed (manually by Komal, or outside opening
 *              hours). Leads with "We are temporarily closed." + a
 *              WhatsApp shortcut so customers can still reach out.
 *  - "info"  → a general announcement (deals, holiday notes, etc).
 */
export default function StoreClosedBanner({
  message,
  tone = "warn",
}: {
  message: string | null;
  tone?: "warn" | "info";
}) {
  if (!message) return null;
  const isWarn = tone === "warn";

  return (
    <div
      role="alert"
      className={
        "relative z-40 " +
        (isWarn
          ? "bg-espresso-900 text-cream-50"
          : "bg-caramel-500 text-espresso-900")
      }
    >
      <div className="container-base flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-3 text-center text-sm sm:gap-4">
        {isWarn ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-caramel-400" />
        ) : (
          <Megaphone className="h-4 w-4 shrink-0" />
        )}
        <p className="leading-snug">
          {isWarn && (
            <span className="font-semibold">We are temporarily closed.</span>
          )}{" "}
          <span className={isWarn ? "text-cream-100/80" : "font-medium"}>
            {message}
          </span>
        </p>
        {isWarn && (
          <a
            href={whatsappLink(site.contact.whatsapp)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-cream-50/20"
          >
            <MessageCircle className="h-3 w-3" /> Message Komal
          </a>
        )}
      </div>
    </div>
  );
}
