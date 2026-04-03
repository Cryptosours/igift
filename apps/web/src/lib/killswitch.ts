/**
 * Source Kill Switches
 *
 * Operational safety controls for the ingestion pipeline:
 * - Per-source: disable a single source (sets isActive=false)
 * - Per-category: suppress all offers in a category
 * - Global: emergency pipeline halt
 *
 * Kill switch state is stored in a simple JSON structure in the database
 * via a dedicated config table, or as a lightweight in-memory + env approach.
 *
 * For V1, we use a file-based approach that the orchestrator checks before
 * each run. Config is stored in the sources table (per-source) and a
 * lightweight runtime config for category and global switches.
 */

import { db } from "@/db";
import { sources, offers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ── Types ──

export interface KillSwitchState {
  global: {
    enabled: boolean;
    reason: string | null;
    activatedAt: string | null;
  };
  sources: Array<{
    slug: string;
    name: string;
    isActive: boolean;
    deactivatedReason?: string;
  }>;
  categories: Array<{
    category: string;
    suppressed: boolean;
    reason?: string;
  }>;
}

export interface KillSwitchAction {
  type: "source" | "category" | "global";
  action: "enable" | "disable";
  target?: string; // source slug or category name
  reason?: string;
}

export interface KillSwitchResult {
  success: boolean;
  action: string;
  affectedOffers?: number;
}

// ── Runtime State ──
// Category and global switches are runtime state (reset on deploy).
// For persistence, these could move to a config table.

const runtimeState = {
  globalKill: false,
  globalReason: null as string | null,
  globalActivatedAt: null as Date | null,
  suppressedCategories: new Map<string, string>(), // category → reason
};

// ── Public API ──

/** Check if the pipeline should run at all */
export function isGlobalKillActive(): boolean {
  return runtimeState.globalKill;
}

/** Check if a specific category is suppressed */
export function isCategorySuppressed(category: string): boolean {
  return runtimeState.suppressedCategories.has(category);
}

/** Get full kill switch state */
export async function getKillSwitchState(): Promise<KillSwitchState> {
  const sourceRows = await db
    .select({
      slug: sources.slug,
      name: sources.name,
      isActive: sources.isActive,
    })
    .from(sources)
    .orderBy(sources.name);

  const allCategories = [
    "gaming", "app_stores", "streaming", "retail",
    "food_dining", "travel", "telecom", "other",
  ];

  return {
    global: {
      enabled: runtimeState.globalKill,
      reason: runtimeState.globalReason,
      activatedAt: runtimeState.globalActivatedAt?.toISOString() ?? null,
    },
    sources: sourceRows.map((s) => ({
      slug: s.slug,
      name: s.name,
      isActive: s.isActive,
    })),
    categories: allCategories.map((cat) => ({
      category: cat,
      suppressed: runtimeState.suppressedCategories.has(cat),
      reason: runtimeState.suppressedCategories.get(cat),
    })),
  };
}

/** Execute a kill switch action */
export async function executeKillSwitch(action: KillSwitchAction): Promise<KillSwitchResult> {
  switch (action.type) {
    case "global":
      return handleGlobal(action);
    case "source":
      return handleSource(action);
    case "category":
      return handleCategory(action);
    default:
      return { success: false, action: `Unknown type: ${action.type}` };
  }
}

// ── Handlers ──

async function handleGlobal(action: KillSwitchAction): Promise<KillSwitchResult> {
  if (action.action === "disable") {
    runtimeState.globalKill = true;
    runtimeState.globalReason = action.reason ?? "Manual global kill switch";
    runtimeState.globalActivatedAt = new Date();
    return {
      success: true,
      action: "Global kill switch ACTIVATED — pipeline will not run",
    };
  } else {
    runtimeState.globalKill = false;
    runtimeState.globalReason = null;
    runtimeState.globalActivatedAt = null;
    return {
      success: true,
      action: "Global kill switch DEACTIVATED — pipeline will resume",
    };
  }
}

async function handleSource(action: KillSwitchAction): Promise<KillSwitchResult> {
  if (!action.target) {
    return { success: false, action: "Source slug is required" };
  }

  const isActive = action.action === "enable";

  const result = await db
    .update(sources)
    .set({
      isActive,
      contractNotes: isActive
        ? null
        : `Kill switch: ${action.reason ?? "Manually disabled"}`,
      updatedAt: new Date(),
    })
    .where(eq(sources.slug, action.target))
    .returning({ id: sources.id });

  if (result.length === 0) {
    return { success: false, action: `Source '${action.target}' not found` };
  }

  // If disabling, also suppress active offers from this source
  let affectedOffers = 0;
  if (!isActive) {
    const suppressed = await db
      .update(offers)
      .set({
        status: "suppressed",
        suppressionReason: `Source kill switch: ${action.reason ?? "disabled"}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(offers.sourceId, result[0].id),
          eq(offers.status, "active"),
        ),
      )
      .returning({ id: offers.id });
    affectedOffers = suppressed.length;
  }

  return {
    success: true,
    action: isActive
      ? `Source '${action.target}' ENABLED`
      : `Source '${action.target}' DISABLED — ${affectedOffers} offers suppressed`,
    affectedOffers,
  };
}

async function handleCategory(action: KillSwitchAction): Promise<KillSwitchResult> {
  if (!action.target) {
    return { success: false, action: "Category name is required" };
  }

  const category = action.target;

  if (action.action === "disable") {
    runtimeState.suppressedCategories.set(category, action.reason ?? "Manually suppressed");

    // Suppress all active offers in this category
    const suppressed = await db.execute(sql`
      UPDATE offers o
      SET status = 'suppressed',
          suppression_reason = ${"Category kill switch: " + (action.reason ?? "disabled")},
          updated_at = NOW()
      FROM brands b
      WHERE o.brand_id = b.id
        AND b.category = ${category}
        AND o.status = 'active'
      RETURNING o.id
    `);

    const affectedOffers = Array.isArray(suppressed) ? suppressed.length : 0;

    return {
      success: true,
      action: `Category '${category}' SUPPRESSED — ${affectedOffers} offers affected`,
      affectedOffers,
    };
  } else {
    runtimeState.suppressedCategories.delete(category);
    return {
      success: true,
      action: `Category '${category}' UNSUPPRESSED — new offers will be accepted`,
    };
  }
}
