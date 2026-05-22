import { AlertCircle, MessageCircle } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

/**
 * Closed-store notice strip. Shows when Komal's is closed — manually or
 * because it is outside opening hours — and offers a WhatsApp shortcut.
 * (The separate caramel announcement banner is `AnnouncementBanner`.)
 */
export default function StoreClosedBanner({
  message,
}: {
  message: string | null;
}) {
  if (!message) return null;

  return (
    <div role="alert" className="relative z-40 bg-espresso-900 text-cream-50">
      <div className="container-base flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-3 text-center text-sm sm:gap-4">
        <AlertCircle className="h-4 w-4 shrink-0 text-caramel-400" />
        <p className="leading-snug">
          <span className="font-semibold">We are temporarily closed.</span>{" "}
          <span className="text-cream-100/80">{message}</span>
        </p>
        <a
          href={whatsappLink(site.contact.whatsapp)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-cream-50/20"
        >
          <MessageCircle className="h-3 w-3" /> Message Komal
        </a>
      </div>
    </div>
  );
}
