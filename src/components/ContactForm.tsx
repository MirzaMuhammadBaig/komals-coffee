"use client";

import { useId, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

/* Per-keystroke filters — stop bad characters at the source instead of
 * waiting for submit. Names get letters + name punctuation; phones get
 * digits + the few punctuation chars used in international numbers. */
const lettersOnly = /[^a-zA-Z\s'\-\.]/g;
const phoneChars = /[^0-9+\s()\-]/g;

function sanitize(
  e: React.ChangeEvent<HTMLInputElement>,
  pattern: RegExp,
) {
  const cleaned = e.target.value.replace(pattern, "");
  if (e.target.value !== cleaned) e.target.value = cleaned;
}

export default function ContactForm() {
  const id = useId();
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-caramel-500/15 text-caramel-600">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl text-espresso-800 sm:text-2xl">
            Message sent. Thank you.
          </h3>
          <p className="mt-2 text-sm text-espresso-500">
            Komal replies to every message personally, usually within a few
            hours during order time. Check your inbox.
          </p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-espresso-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-espresso-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream-50 active:translate-y-0 active:scale-95"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Contact form"
      className="card grid gap-5 p-6 sm:p-8 lg:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
          >
            Name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            inputMode="text"
            autoComplete="name"
            maxLength={60}
            className="input mt-2"
            placeholder="Your name"
            onChange={(e) => sanitize(e, lettersOnly)}
          />
        </div>
        <div>
          <label
            htmlFor={`${id}-email`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
          >
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={120}
            className="input mt-2"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-phone`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
          >
            Phone <span className="font-normal text-espresso-400">(optional)</span>
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            className="input mt-2"
            placeholder="+92 ..."
            onChange={(e) => sanitize(e, phoneChars)}
          />
        </div>
        <div>
          <label
            htmlFor={`${id}-subject`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
          >
            Subject{" "}
            <span className="font-normal text-espresso-400">(optional)</span>
          </label>
          <input
            id={`${id}-subject`}
            name="subject"
            maxLength={120}
            className="input mt-2"
            placeholder="What's on your mind?"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${id}-message`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso-500"
        >
          Message
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={5}
          maxLength={1000}
          className="input mt-2 resize-none"
          placeholder="Tell us a little more…"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-espresso-400">
          Komal replies personally, usually within a few hours.
        </p>
        <button
          type="submit"
          disabled={state === "loading"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-[0_8px_20px_-8px_rgba(40,24,15,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-espresso-800 hover:shadow-[0_14px_28px_-12px_rgba(40,24,15,0.55)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
