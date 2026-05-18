import { Mail } from "lucide-react";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MessageActions from "@/components/admin/MessageActions";
import { cn } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const supabase = createSupabaseServiceClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unhandled = (messages ?? []).filter((m) => !m.handled).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact messages"
        description={`${unhandled} message${unhandled === 1 ? "" : "s"} waiting for a reply.`}
      />

      {!messages || messages.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-espresso-400">
            <Mail className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-xl text-espresso-800">
            No messages yet.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-espresso-100">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "grid grid-cols-1 gap-3 px-5 py-4 transition-colors md:grid-cols-[1fr_auto] md:items-start",
                  !m.handled && "bg-caramel-500/5",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base text-espresso-800">
                      {m.name}
                    </p>
                    {!m.handled && (
                      <span className="rounded-full bg-caramel-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-caramel-700">
                        New
                      </span>
                    )}
                    <span className="text-xs text-espresso-400">
                      {new Date(m.created_at).toLocaleString("en-PK", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-espresso-500">
                    <a
                      href={`mailto:${m.email}`}
                      className="link-underline hover:text-caramel-700"
                    >
                      {m.email}
                    </a>
                    {m.phone && <> · {m.phone}</>}
                    {m.subject && <> · {m.subject}</>}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-espresso-700">
                    {m.message}
                  </p>
                </div>
                <MessageActions id={m.id} handled={m.handled} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
