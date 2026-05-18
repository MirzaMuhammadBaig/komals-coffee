import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "komals_admin";
const SECRET =
  process.env.ADMIN_SESSION_SECRET || "dev-secret-please-change-me";
// Defaults are baked in so the admin works out of the box. Override via env
// for production (ADMIN_EMAIL + ADMIN_PASSWORD in .env.local).
const EMAIL = (process.env.ADMIN_EMAIL || "webdev.muhammad@gmail.com")
  .trim()
  .toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "Komals@1";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return Boolean(EMAIL && PASSWORD);
}

export function verifyCredentials(
  emailInput: string,
  passwordInput: string,
): boolean {
  if (!EMAIL || !PASSWORD) return false;
  const emailOk = constantTimeEqual(emailInput.trim().toLowerCase(), EMAIL);
  const passOk = constantTimeEqual(passwordInput, PASSWORD);
  // Always run both comparisons so timing reveals nothing.
  return emailOk && passOk;
}

// Kept for backwards compatibility with any caller that still imports it.
export function verifyPassword(input: string): boolean {
  return constantTimeEqual(input, PASSWORD);
}

export function createSessionToken(): string {
  const expiry = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin:${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Constant-time signature compare.
  const expected = sign(payload);
  try {
    if (
      !timingSafeEqual(
        Buffer.from(sig, "hex"),
        Buffer.from(expected, "hex"),
      )
    ) {
      return false;
    }
  } catch {
    return false;
  }

  const [tag, expStr] = payload.split(":");
  if (tag !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return true;
}

export function getAdminSession(): boolean {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value);
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
