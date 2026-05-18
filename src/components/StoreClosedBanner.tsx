import { AlertCircle, MessageCircle } from "lucide-react";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

type Props = {
  reason: string | null;
  until: string | null;
  announcement: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default function StoreClosedBanner({
  reason,
  until,
  announcement,
}: Props) {
  const untilLabel = formatDate(until);

  return (
    <div className="bg-espresso-900 text-cream-50">
      <div className="container-base flex flex-wrap items-center justify-center gap-3 py-3 text-center text-sm sm:gap-4">
        <AlertCircle className="h-4 w-4 shrink-0 text-caramel-400" />
        <p className="leading-snug">
          <span className="font-semibold">We are temporarily closed.</span>{" "}
          {reason || "Komal is taking a short break."}
          {untilLabel && (
            <>
              {" "}
              <span className="text-cream-100/70">
                Reopens {untilLabel}.
              </span>
            </>
          )}
          {announcement && (
            <>
              {" "}
              <span className="text-cream-100/70">{announcement}</span>
            </>
          )}
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
