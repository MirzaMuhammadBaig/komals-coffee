"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

type Props = {
  title: string;
  subtitle?: string;
  storeOpen: boolean;
};

export default function AdminTopbar({ title, subtitle, storeOpen }: Props) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-espresso-100 bg-cream-50/95 px-3 py-3 backdrop-blur sm:gap-4 sm:px-5 sm:py-4 lg:px-8">
      <AdminMobileNav />

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg text-espresso-800 sm:text-xl lg:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 hidden truncate text-xs text-espresso-500 sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Link
          href="/admin/store"
          aria-label={storeOpen ? "Store is open" : "Store is closed"}
          title={storeOpen ? "Store is open" : "Store is closed"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:px-3",
            storeOpen
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
          )}
        >
          {storeOpen ? (
            <Power className="h-3 w-3" />
          ) : (
            <PowerOff className="h-3 w-3" />
          )}
          <span className="hidden xs:inline sm:inline">
            {storeOpen ? "Open" : "Closed"}
          </span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          className="inline-flex items-center gap-1.5 rounded-full border border-espresso-200 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-espresso-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-400 hover:bg-espresso-700 hover:text-cream-50 active:translate-y-0 active:scale-95 sm:px-3"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
