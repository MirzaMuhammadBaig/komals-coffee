import { getStoreSettings } from "@/lib/admin/store";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BusynessForm from "@/components/admin/BusynessForm";
import { DEFAULT_AUTO_PROGRESS_MINUTES } from "@/lib/admin/busyness-types";

export default async function AdminBusynessPage() {
  const store = await getStoreSettings();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Operations"
        title="Busyness"
        description="Set how busy Komal is right now. Orders auto-advance through the pipeline on a timer that scales with the busyness level."
      />
      <BusynessForm
        initial={{
          level: store?.busyness_level ?? "normal",
          minutes:
            store?.auto_progress_minutes ?? DEFAULT_AUTO_PROGRESS_MINUTES,
        }}
      />
    </div>
  );
}
