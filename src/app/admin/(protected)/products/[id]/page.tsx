import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServiceClient();
  const [{ data: item }, { data: cats }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("*")
      .eq("id", params.id)
      .maybeSingle(),
    supabase
      .from("menu_categories")
      .select("id, name")
      .order("sort_order", { ascending: true }),
  ]);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Products
      </Link>

      <AdminPageHeader
        eyebrow="Edit product"
        title={item.name}
        description={`Slug: ${item.slug}`}
      />

      <ProductForm
        mode="edit"
        categories={cats ?? []}
        initial={{
          id: item.id,
          slug: item.slug ?? "",
          name: item.name ?? "",
          description: item.description ?? "",
          price_pkr: item.price_pkr ?? 0,
          size: item.size ?? "",
          image_url: item.image_url ?? "",
          category_id: item.category_id ?? "",
          tags: (item.tags ?? []).join(", "),
          is_active: item.is_active ?? true,
          is_signature: item.is_signature ?? false,
          is_bestseller: item.is_bestseller ?? false,
          sort_order: item.sort_order ?? 0,
        }}
      />
    </div>
  );
}
