import { getStoreSettings } from "@/lib/admin/store";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StoreSettingsForm from "@/components/admin/StoreSettingsForm";

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminStorePage() {
  const store = await getStoreSettings();
  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store status"
        description="Open or close the store with one click. The banner on the site updates instantly."
      />
      <StoreSettingsForm
        initial={{
          is_open: store?.is_open ?? true,
          closed_reason: store?.closed_reason ?? "",
          closed_until: toLocalInput(store?.closed_until),
        }}
      />
    </div>
  );
}
