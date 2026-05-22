import CoffeeLoader from "@/components/CoffeeLoader";

/**
 * Shown by the App Router while a customer-site page renders on the
 * server. `delayed` keeps it invisible for the first ~280ms — a fast
 * render beats the delay, so quick navigations never flash the loader.
 */
export default function SiteLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <CoffeeLoader delayed />
    </div>
  );
}
