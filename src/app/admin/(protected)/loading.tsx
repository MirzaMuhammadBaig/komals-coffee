import CoffeeLoader from "@/components/CoffeeLoader";

/**
 * Shown while an admin screen fetches its data from Supabase. `delayed`
 * keeps it invisible for the first ~280ms, so screens that load quickly
 * never flash the loader.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <CoffeeLoader delayed size={116} />
    </div>
  );
}
