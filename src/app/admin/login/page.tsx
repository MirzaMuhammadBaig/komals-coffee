"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coffee, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Login failed");
      router.replace(next);
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-espresso-900 px-5 py-12 text-cream-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-72 w-72 animate-blob rounded-full bg-caramel-500/20 blur-3xl" />
        <div
          className="absolute -right-24 bottom-10 h-80 w-80 animate-blob rounded-full bg-blush-400/15 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2 text-cream-50">
          <Coffee className="h-7 w-7 text-caramel-400" strokeWidth={1.6} />
          <div className="flex flex-col leading-none">
            <span className="font-script text-2xl text-caramel-400">
              Komal&apos;s
            </span>
            <span className="-mt-1 text-[11px] uppercase tracking-[0.35em] text-cream-100/70">
              Coffee
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-cream-50 p-8 text-espresso-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-400">
                Admin area
              </p>
              <h1 className="font-display text-2xl text-espresso-800">
                Welcome back, Komal.
              </h1>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
              >
                Email
              </label>
              <div className="relative mt-2">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
                  aria-hidden
                />
                <input
                  id="admin-email"
                  type="email"
                  autoFocus
                  required
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
                  aria-hidden
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={state === "loading" || !email || !password}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-5 text-[11px] text-espresso-400">
            Authorised access only. All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
