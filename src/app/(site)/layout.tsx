import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingOrderButton from "@/components/FloatingOrderButton";
import CartDrawer from "@/components/CartDrawer";
import StoreClosedBanner from "@/components/StoreClosedBanner";
import { CartProvider } from "@/lib/cart/CartContext";
import { getStoreSettings } from "@/lib/admin/store";
import { isWithinOrderHours, getNextOpening } from "@/lib/hours";

// Always render with fresh store settings + a fresh clock — so the closed
// banner flips the moment Komal toggles the switch or opening hours pass.
export const dynamic = "force-dynamic";

/** "Sat, 24 May, 6:00 PM" — for a manual closure with a known reopen time. */
function formatDate(iso: string | null): string | null {
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

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStoreSettings();

  // Closed for EITHER reason: Komal's manual switch, or being outside the
  // published opening hours.
  const adminOpen = store?.is_open ?? true;
  const withinHours = isWithinOrderHours();
  const manuallyClosed = !adminOpen;
  const afterHours = adminOpen && !withinHours;
  const isClosed = manuallyClosed || afterHours;

  // Banner copy: a manual close shows Komal's own reason (+ reopen time if
  // set); an after-hours close gets an auto schedule message.
  let closedMessage: string | null = null;
  if (manuallyClosed) {
    closedMessage = store?.closed_reason || "Komal is taking a short break.";
    const untilLabel = formatDate(store?.closed_until ?? null);
    if (untilLabel) closedMessage += ` Reopens ${untilLabel}.`;
  } else if (afterHours) {
    const next = getNextOpening();
    closedMessage = next
      ? `We reopen ${next.dayLabel} at ${next.time}.`
      : "Back during our regular opening hours.";
  }

  return (
    <CartProvider>
      {isClosed && <StoreClosedBanner message={closedMessage} tone="warn" />}
      {store?.announcement && (
        <StoreClosedBanner message={store.announcement} tone="info" />
      )}
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <FloatingOrderButton />
      <CartDrawer />
    </CartProvider>
  );
}
