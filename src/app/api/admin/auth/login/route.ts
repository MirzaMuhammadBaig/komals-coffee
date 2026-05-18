import { NextResponse } from "next/server";
import {
  createSessionToken,
  isAdminConfigured,
  setAdminCookie,
  verifyCredentials,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local and restart the server.",
      },
      { status: 503 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (!verifyCredentials(email, password)) {
    // Minor delay to dampen brute-force probing.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json(
      { error: "Wrong email or password." },
      { status: 401 },
    );
  }

  setAdminCookie(createSessionToken());
  return NextResponse.json({ ok: true });
}
