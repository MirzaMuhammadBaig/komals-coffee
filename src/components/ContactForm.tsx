"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setState("done");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:p-8">
        <div className="rounded-full bg-caramel-500/15 p-3 text-caramel-600">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl text-espresso-800">
            Message sent. Thank you.
          </h3>
          <p className="mt-2 text-sm text-espresso-500">
            Komal replies to every message personally, usually within a few
            hours during order time. Check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:p-8 lg:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Name
          </label>
          <input
            name="name"
            required
            className="input mt-2"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="input mt-2"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Phone (optional)
          </label>
          <input name="phone" className="input mt-2" placeholder="+92 ..." />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Subject
          </label>
          <input
            name="subject"
            className="input mt-2"
            placeholder="What's on your mind?"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="input mt-2 resize-none"
          placeholder="Tell us a little more…"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-sm font-medium text-cream-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending
            </>
          ) : (
            <>
              Send message
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
