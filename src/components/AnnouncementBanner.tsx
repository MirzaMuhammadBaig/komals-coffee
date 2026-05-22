import { Megaphone } from "lucide-react";

/**
 * Site-wide announcement strip — the "topbar message" managed from
 * Admin → Announcement. Sits above the navigation on every page and
 * shows whether the store is open or closed. Renders nothing when no
 * message is set.
 */
export default function AnnouncementBanner({
  message,
}: {
  message: string | null;
}) {
  const text = message?.trim();
  if (!text) return null;

  return (
    <div role="status" className="relative z-40 bg-caramel-500 text-espresso-900">
      <div className="container-base flex items-center justify-center gap-2.5 py-2.5 text-center text-sm font-medium sm:gap-3">
        <Megaphone className="h-4 w-4 shrink-0" strokeWidth={2} />
        <p className="leading-snug">{text}</p>
      </div>
    </div>
  );
}
