import { Users } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminNewsletterPage() {
  const supabase = createSupabaseServiceClient();
  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Engagement"
        title="Newsletter subscribers"
        description={`${(subs ?? []).length} subscriber${(subs ?? []).length === 1 ? "" : "s"} on your list.`}
      />

      {!subs || subs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-espresso-400">
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-xl text-espresso-800">
            No subscribers yet.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr] gap-4 border-b border-espresso-100 bg-cream-100/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500 md:grid">
            <span>Email</span>
            <span>Source</span>
            <span>Subscribed</span>
          </div>
          <ul className="divide-y divide-espresso-100">
            {subs.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 transition-colors hover:bg-cream-100/40 md:grid-cols-[1.5fr_1fr_1fr] md:items-center"
              >
                <a
                  href={`mailto:${s.email}`}
                  className="link-underline truncate text-sm font-semibold text-espresso-800 hover:text-caramel-700"
                >
                  {s.email}
                </a>
                <span className="text-xs text-espresso-500">
                  {s.source ?? "—"}
                </span>
                <span className="text-xs text-espresso-400">
                  {new Date(s.created_at).toLocaleString("en-PK", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
