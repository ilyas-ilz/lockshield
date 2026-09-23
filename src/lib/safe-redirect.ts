/**
 * Only follow a post-login callbackUrl back into the admin. Without this, a
 * crafted link like /admin/login?callbackUrl=https://evil.example sends a
 * freshly signed-in user straight to an attacker's page (open redirect).
 */
export function safeAdminCallbackUrl(raw: string | null | undefined): string {
  return raw && /^\/admin(?:[/?#]|$)/.test(raw) ? raw : "/admin";
}
