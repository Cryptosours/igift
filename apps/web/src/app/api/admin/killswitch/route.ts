/**
 * GET  /api/admin/killswitch — Current kill switch state
 * POST /api/admin/killswitch — Execute a kill switch action
 *
 * Body for POST:
 *   { type: "source"|"category"|"global", action: "enable"|"disable", target?: string, reason?: string }
 *
 * Protected by ADMIN_API_KEY.
 */

import { NextResponse } from "next/server";
import { getKillSwitchState, executeKillSwitch, type KillSwitchAction } from "@/lib/killswitch";
import { checkAdminAuth } from "../auth";

export const dynamic = "force-dynamic";

/** GET — Current state of all kill switches */
export async function GET(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getKillSwitchState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("Kill switch state failed:", error);
    return NextResponse.json(
      { error: "Failed to get kill switch state" },
      { status: 500 },
    );
  }
}

/** POST — Execute a kill switch action */
export async function POST(request: Request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: KillSwitchAction;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.type || !body.action) {
    return NextResponse.json(
      { error: "Required: type (source|category|global) and action (enable|disable)" },
      { status: 400 },
    );
  }

  if (!["source", "category", "global"].includes(body.type)) {
    return NextResponse.json(
      { error: "type must be: source, category, or global" },
      { status: 400 },
    );
  }

  if (!["enable", "disable"].includes(body.action)) {
    return NextResponse.json(
      { error: "action must be: enable or disable" },
      { status: 400 },
    );
  }

  try {
    const result = await executeKillSwitch(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Kill switch execution failed:", error);
    return NextResponse.json(
      { error: "Kill switch execution failed" },
      { status: 500 },
    );
  }
}
