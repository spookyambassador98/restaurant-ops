import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getShiftAnalytics } from "@/lib/analytics";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const session = await getStaffSession();
  if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shiftId } = await params;
  const analytics = await getShiftAnalytics(shiftId);
  return NextResponse.json(analytics);
}
