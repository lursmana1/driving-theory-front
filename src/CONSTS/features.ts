/**
 * Forgot-password link + /auth/forgot-password page.
 * Off until the Resend sending domain (DNS) is verified; turn on with
 * NEXT_PUBLIC_PASSWORD_RESET_ENABLED=true (build-time, needs a rebuild/redeploy).
 */
export const PASSWORD_RESET_ENABLED =
  process.env.NEXT_PUBLIC_PASSWORD_RESET_ENABLED === "true";
