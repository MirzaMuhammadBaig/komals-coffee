import { getStoreSettings } from "@/lib/admin/store";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AnnouncementForm from "@/components/admin/AnnouncementForm";

export default async function AdminAnnouncementPage() {
  const store = await getStoreSettings();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Announcement banner"
        description="Show a message across the top of the entire website — a promotion, a holiday note, anything. It appears whether the store is open or closed."
      />
      <AnnouncementForm initial={store?.announcement ?? ""} />
    </div>
  );
}
