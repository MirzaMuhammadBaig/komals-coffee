import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

/**
 * Drop this at the top of any admin API route to reject unauthenticated
 * requests. Returns null when authorised; otherwise returns the 401 response
 * for the caller to return immediately.
 *
 *   const denied = requireAdmin();
 *   if (denied) return denied;
 */
export function requireAdmin(): NextResponse | null {
  if (getAdminSession()) return null;
  return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
}
