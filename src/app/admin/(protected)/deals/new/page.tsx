import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DealForm from "@/components/admin/DealForm";

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/deals"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Deals
      </Link>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Add a new deal"
      />
      <DealForm
        mode="create"
        initial={{
          title: "",
          description: "",
          badge: "",
          image_url: "",
          discount_pkr: null,
          discount_percent: null,
          valid_from: "",
          valid_until: "",
          is_active: true,
          sort_order: 0,
        }}
      />
    </div>
  );
}
