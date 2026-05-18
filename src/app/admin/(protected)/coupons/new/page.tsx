import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CouponForm from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/coupons"
        className="link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500 hover:text-caramel-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Coupons
      </Link>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Add a new coupon"
        description="Pick a code, the discount amount, and any limits. You can disable it any time."
      />
      <CouponForm
        mode="create"
        initial={{
          code: "",
          kind: "percent",
          value: 10,
          min_order_pkr: 0,
          max_uses: null,
          starts_at: "",
          expires_at: "",
          is_active: true,
          notes: "",
        }}
      />
    </div>
  );
}
