import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = createSupabaseServiceClient();
  const { data: cats } = await supabase
    .from("menu_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Products
      </Link>

      <AdminPageHeader
        eyebrow="Catalog"
        title="Add a new product"
        description="Fill in the details and hit Create. You can disable it any time without deleting."
      />

      <ProductForm
        mode="create"
        categories={cats ?? []}
        initial={{
          slug: "",
          name: "",
          description: "",
          price_pkr: 0,
          size: "",
          image_url: "",
          category_id: cats?.[0]?.id ?? "",
          tags: "",
          is_active: true,
          is_signature: false,
          is_bestseller: false,
          sort_order: 0,
        }}
      />
    </div>
  );
}
