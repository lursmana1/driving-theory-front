import axios from "axios";

/** Keys under the `Auth` message namespace. */
export type AuthErrorKey =
  | "errorRateLimited"
  | "errorInvalidCredentials"
  | "errorEmailTaken"
  | "errorNetwork"
  | "errorGeneric";

export function authErrorKey(
  err: unknown,
  mode: "login" | "register",
): AuthErrorKey {
  if (!axios.isAxiosError(err)) return "errorGeneric";

  const status = err.response?.status;
  if (status == null) return "errorNetwork";

  // Login and register are capped at 5 requests per minute per IP.
  if (status === 429) return "errorRateLimited";
  if (status === 409) return "errorEmailTaken";
  if (mode === "login" && (status === 400 || status === 401)) {
    return "errorInvalidCredentials";
  }

  return "errorGeneric";
}
