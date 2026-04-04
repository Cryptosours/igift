import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/app/api/admin/auth";
import { getClickStats } from "@/lib/affiliate";

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getClickStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[/api/admin/clicks] Error:", err);
    return NextResponse.json({ error: "Failed to fetch click stats" }, { status: 500 });
  }
}
