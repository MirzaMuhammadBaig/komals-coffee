// Safepay payment provider helper.
// Reads credentials from env vars (see .env.example):
//   SAFEPAY_API_KEY        — server-side secret key (sec_…)
//   SAFEPAY_V1_SECRET      — v1 API secret (used for HMAC where required)
//   SAFEPAY_WEBHOOK_SECRET — for verifying webhook signatures (future)
//   SAFEPAY_ENVIRONMENT    — "sandbox" or "production"
//
// Flow:
//   1. server creates an "order tracker" with Safepay via /order/v1/init
//   2. user is redirected to Safepay's hosted checkout (sandbox or production)
//   3. on success / cancel Safepay redirects back to redirect_url / cancel_url

const SAFEPAY_ENVIRONMENT = (
  process.env.SAFEPAY_ENVIRONMENT ||
  process.env.SAFEPAY_ENV ||
  "sandbox"
).toLowerCase();

const SAFEPAY_API_KEY =
  process.env.SAFEPAY_API_KEY || process.env.SAFEPAY_SECRET_KEY || "";

const IS_PROD = SAFEPAY_ENVIRONMENT === "production";

const API_BASE = IS_PROD
  ? "https://api.getsafepay.com"
  : "https://sandbox.api.getsafepay.com";

const CHECKOUT_BASE = IS_PROD
  ? "https://getsafepay.com/embedded"
  : "https://sandbox.api.getsafepay.com/embedded";

export function isSafepayConfigured(): boolean {
  return Boolean(SAFEPAY_API_KEY);
}

export type CreateTrackerInput = {
  amountPkr: number; // major units, e.g. 1100 means PKR 1,100
  orderId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  redirectUrl: string;
  cancelUrl: string;
};

export type CreateTrackerResult = {
  tracker: string;
  checkoutUrl: string;
};

export async function createSafepayTracker(
  input: CreateTrackerInput,
): Promise<CreateTrackerResult> {
  if (!isSafepayConfigured()) {
    throw new Error(
      "Safepay is not configured. Set SAFEPAY_API_KEY (and SAFEPAY_ENVIRONMENT) in .env.local.",
    );
  }

  // Safepay expects amounts in minor units (paisa for PKR).
  const amountMinor = Math.round(input.amountPkr * 100);

  const res = await fetch(`${API_BASE}/order/v1/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SAFEPAY_API_KEY}`,
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency: "PKR",
      environment: SAFEPAY_ENVIRONMENT,
      intent: "CYBERSOURCE",
      mode: "payment",
      order_id: input.orderId,
      customer: {
        name: input.customerName,
        email: input.customerEmail ?? undefined,
        phone: input.customerPhone,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Safepay init failed (${res.status}): ${txt.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    data?: { token?: string; tracker?: string };
    status?: { code?: number; message?: string };
  };

  const tracker = data.data?.tracker ?? data.data?.token;
  if (!tracker) {
    throw new Error(
      `Safepay init returned no tracker: ${data.status?.message ?? "unknown response"}`,
    );
  }

  const checkout = new URL(`${CHECKOUT_BASE}/`);
  checkout.searchParams.set("env", SAFEPAY_ENVIRONMENT);
  checkout.searchParams.set("tbt", tracker);
  checkout.searchParams.set("source", "custom");
  checkout.searchParams.set("redirect_url", input.redirectUrl);
  checkout.searchParams.set("cancel_url", input.cancelUrl);
  checkout.searchParams.set("order_id", input.orderId);

  return { tracker, checkoutUrl: checkout.toString() };
}
