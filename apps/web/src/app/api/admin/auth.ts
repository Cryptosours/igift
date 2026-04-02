/**
 * Shared admin API authentication.
 * Bearer token via ADMIN_API_KEY env var.
 */

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? "dev-admin-key";

export function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") === ADMIN_KEY;
}
