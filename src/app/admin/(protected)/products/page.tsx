import Link from "next/link";
import { Plus } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { formatPkr, cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const supabase = createSupabaseServiceClient();
  const [{ data: items }, { data: cats }] = await Promise.all([
    supabase
      .from("menu_items")
      .select(
        "id, name, slug, price_pkr, size, image_url, is_active, is_bestseller, is_signature, category_id, sort_order",
      )
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_categories")
      .select("id, name")
      .order("sort_order", { ascending: true }),
  ]);

  const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Add new drinks, update prices, disable items that are out of stock, or remove them."
        actions={[
          {
            label: "Add product",
            href: "/admin/products/new",
            primary: true,
            icon: <Plus className="h-3.5 w-3.5" />,
          },
        ]}
      />

      {!items || items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-xl text-espresso-800">
            No products yet.
          </p>
          <Link href="/admin/products/new" className="btn-primary mt-5">
            <Plus className="mr-1.5 h-4 w-4" /> Add the first product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[80px_1.5fr_1fr_0.8fr_0.6fr_auto] gap-4 border-b border-espresso-100 bg-cream-100/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 lg:grid">
            <span></span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span></span>
          </div>
          <ul className="divide-y divide-espresso-100">
            {items.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-cream-100/40 sm:grid-cols-[64px_1fr_auto] sm:gap-4 sm:px-5 lg:grid-cols-[80px_1.5fr_1fr_0.8fr_0.6fr_auto]"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-cream-100 sm:h-14 sm:w-14">
                  <SafeImage
                    src={it.image_url}
                    alt={it.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm text-espresso-800 sm:text-base">
                    {it.name}
                  </p>
                  <p className="truncate text-[11px] text-espresso-400 sm:text-xs">
                    {it.slug}
                    {it.size && ` · ${it.size}`}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-1 gap-y-0.5 lg:hidden">
                    <span className="text-[11px] text-espresso-500">
                      {catMap.get(it.category_id as string) ?? "—"}
                    </span>
                    <span className="text-[11px] font-semibold text-espresso-700">
                      · {formatPkr(it.price_pkr)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase tracking-[0.12em]",
                        it.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-cream-100 text-espresso-400",
                      )}
                    >
                      {it.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                </div>
                <span className="hidden text-sm text-espresso-600 lg:inline">
                  {catMap.get(it.category_id as string) ?? "—"}
                </span>
                <span className="hidden font-semibold tabular-nums text-espresso-800 lg:inline">
                  {formatPkr(it.price_pkr)}
                </span>
                <span className="hidden lg:inline">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
                      it.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-cream-100 text-espresso-400",
                    )}
                  >
                    {it.is_active ? "Active" : "Disabled"}
                  </span>
                </span>
                <ProductRowActions id={it.id} isActive={it.is_active} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
