import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingOrderButton from "@/components/FloatingOrderButton";
import CartDrawer from "@/components/CartDrawer";
import StoreClosedBanner from "@/components/StoreClosedBanner";
import { CartProvider } from "@/lib/cart/CartContext";
import { getStoreSettings } from "@/lib/admin/store";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStoreSettings();

  return (
    <CartProvider>
      {store && !store.is_open && (
        <StoreClosedBanner
          reason={store.closed_reason}
          until={store.closed_until}
          announcement={store.announcement}
        />
      )}
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <FloatingOrderButton />
      <CartDrawer />
    </CartProvider>
  );
}
