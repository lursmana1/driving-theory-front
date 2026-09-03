import axios, { type AxiosError } from "axios";

/** Must match the register DTO on the API (`MinLength(6)`). */
export const AUTH_PASSWORD_MIN_LENGTH = 6;

/** Keys under the `Auth` message namespace. */
export type AuthErrorKey =
  | "errorRateLimited"
  | "errorInvalidCredentials"
  | "errorEmailTaken"
  | "errorPasswordWeak"
  | "errorGoogle"
  | "errorNetwork"
  | "errorGeneric"
  | "emailInvalid"
  | "nameRequired"
  | "surnameRequired";

function nestMessage(err: AxiosError): string {
  const data = err.response?.data as { message?: unknown } | undefined;
  const raw = data?.message;
  if (Array.isArray(raw)) return raw.map(String).join(" ").toLowerCase();
  if (typeof raw === "string") return raw.toLowerCase();
  return "";
}

export function authErrorKey(
  err: unknown,
  mode: "login" | "register",
): AuthErrorKey {
  if (!axios.isAxiosError(err)) return "errorGeneric";

  const status = err.response?.status;
  if (status == null) return "errorNetwork";

  const msg = nestMessage(err);

  if (status === 429 || msg.includes("throttl") || msg.includes("too many")) {
    return "errorRateLimited";
  }
  if (
    status === 409 ||
    msg.includes("already exists") ||
    msg.includes("already registered") ||
    msg.includes("email already")
  ) {
    return "errorEmailTaken";
  }
  if (
    msg.includes("password") &&
    (msg.includes("longer") ||
      msg.includes("short") ||
      msg.includes("weak") ||
      msg.includes("min"))
  ) {
    return "errorPasswordWeak";
  }
  if (msg.includes("must be an email") || msg.includes("invalid email")) {
    return "emailInvalid";
  }
  if (msg.includes("name should not be empty") || msg.includes("name must")) {
    return "nameRequired";
  }
  if (msg.includes("surname")) {
    return "surnameRequired";
  }
  if (status === 403 || msg.includes("unverified")) {
    return "errorGoogle";
  }
  if (mode === "login" && (status === 400 || status === 401)) {
    return "errorInvalidCredentials";
  }
  if (mode === "register" && status === 401) {
    return "errorInvalidCredentials";
  }

  return "errorGeneric";
}

export function googleCallbackErrorKey(
  search: string | URLSearchParams,
): AuthErrorKey | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const error = params.get("error") ?? params.get("authError");
  if (!error) return null;
  return "errorGoogle";
}
