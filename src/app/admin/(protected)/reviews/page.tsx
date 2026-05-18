import { Star } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ReviewActions from "@/components/admin/ReviewActions";

export default async function AdminReviewsPage() {
  const supabase = createSupabaseServiceClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("reviewed_at", { ascending: false });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Engagement"
        title="Reviews"
        description="Feature a review to show it on the homepage carousel. Delete spam or duplicates."
      />

      {!reviews || reviews.length === 0 ? (
        <div className="card p-12 text-center text-sm text-espresso-500">
          No reviews yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.id} className="card flex h-full flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating ?? 0 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-caramel-500 text-caramel-500"
                    />
                  ))}
                </div>
                <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-espresso-500">
                  {r.source}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-espresso-700">
                &ldquo;{r.body}&rdquo;
              </p>
              <footer className="mt-4 flex items-center justify-between border-t border-espresso-100 pt-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-espresso-800">
                    {r.author_name}
                  </p>
                  {r.reviewed_at && (
                    <p className="text-xs text-espresso-400">
                      {new Date(r.reviewed_at).toLocaleDateString("en-PK")}
                    </p>
                  )}
                </div>
                <ReviewActions id={r.id} isFeatured={r.is_featured} />
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
