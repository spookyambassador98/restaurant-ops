import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import type { StaffRole } from "@/lib/types/order";

export async function requireStaff(roles?: StaffRole[]) {
  const session = await getStaffSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (roles && !roles.includes(session.role)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  return requireStaff(["ADMIN"]);
}
