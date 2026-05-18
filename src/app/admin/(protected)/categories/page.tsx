import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("menu_categories")
    .select("id, slug, name, description, sort_order")
    .order("sort_order", { ascending: true });
  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Group your menu into sections. The menu page lists products under these categories."
      />
      <CategoriesManager initial={data ?? []} />
    </div>
  );
}
