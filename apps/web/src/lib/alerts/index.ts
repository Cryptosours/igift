/**
 * Alert System — Public API
 *
 * Orchestrates alert matching and delivery after ingestion.
 * Called from the ingestion orchestrator after offers are upserted.
 */

import { matchAlerts, markAlertsSent } from "./matcher";
import { deliverAlertEmails } from "./email";

export interface AlertsResult {
  matched: number;
  delivered: number;
  failed: number;
  deliveryResults: Array<{
    alertId: number;
    email: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Run the full alert cycle:
 * 1. Match active alerts against eligible offers
 * 2. Deliver notifications (email)
 * 3. Mark successfully delivered alerts as sent
 *
 * @param offerIds - Optional: scope matching to these offer IDs (from current ingestion run)
 */
export async function processAlerts(offerIds?: number[]): Promise<AlertsResult> {
  // Step 1: Find matches
  const matches = await matchAlerts(offerIds);
  if (matches.length === 0) {
    return { matched: 0, delivered: 0, failed: 0, deliveryResults: [] };
  }

  // Step 2: Deliver (email only for now; Telegram can be added as a second channel)
  const emailMatches = matches.filter((m) => m.deliveryChannel === "email");
  const emailResults = await deliverAlertEmails(emailMatches);

  // Step 3: Mark successful alerts as sent
  const successfulIds = emailResults
    .filter((r) => r.success)
    .map((r) => r.alertId);
  await markAlertsSent(successfulIds);

  return {
    matched: matches.length,
    delivered: successfulIds.length,
    failed: emailResults.filter((r) => !r.success).length,
    deliveryResults: emailResults,
  };
}

export { matchAlerts } from "./matcher";
export type { AlertMatch } from "./matcher";
