import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getStoreSettings } from "@/lib/admin/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!getAdminSession()) {
    redirect("/admin/login");
  }

  const store = await getStoreSettings();
  const storeOpen = store ? store.is_open : true;

  return (
    <div className="flex min-h-screen bg-cream-100/40">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          title="Admin"
          subtitle="Manage Komal's Coffee"
          storeOpen={storeOpen}
        />
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
