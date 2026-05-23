"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setState("done");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-cream-50/10 px-4 py-3 text-sm text-cream-50">
        <Check className="h-4 w-4 text-caramel-400" />
        You are on the list. See you soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full min-w-0 rounded-full bg-cream-50/10 px-4 py-3 text-sm text-cream-50 placeholder:text-cream-100/40 focus:outline-none focus:ring-2 focus:ring-caramel-400"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-caramel-500 text-espresso-900 transition hover:bg-caramel-400 disabled:opacity-60"
        aria-label="Subscribe"
      >
        <Send className="h-4 w-4" />
      </button>
      {error && (
        <p className="absolute -bottom-6 left-0 text-xs text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
