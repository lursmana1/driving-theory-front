"use client";

import { useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { resetPassword } from "@/api/auth";
import { useAuth } from "@/contexts/UserContext";
import {
  AUTH_PASSWORD_MIN_LENGTH,
  authErrorKey,
  type AuthErrorKey,
} from "@/utills/helpers/authErrorKey";
import AuthFormError from "./AuthFormError";
import { AuthCard } from "./AuthPageShell";

/** Matches the API's reset DTO: 43 base64url characters. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** The token must not stay in the address bar, history or a shared screenshot. */
function stripTokenFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("token")) return;
  url.searchParams.delete("token");
  const search = url.searchParams.toString();
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${search ? `?${search}` : ""}${url.hash}`,
  );
}

type Values = { password: string; confirmPassword: string };

export default function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { refresh } = useAuth();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const validToken = token && TOKEN_PATTERN.test(token) ? token : null;

  useEffect(() => {
    stripTokenFromUrl();
  }, []);

  const requestNewLink = (
    <Link
      href="/auth/forgot-password"
      className="mt-6 inline-block font-semibold text-accent hover:text-accent-strong hover:underline"
    >
      {t("requestNewLink")}
    </Link>
  );

  if (!validToken) {
    return (
      <AuthCard title={t("resetTitle")}>
        <AuthFormError message={t("errorResetLinkInvalid")} />
        {requestNewLink}
      </AuthCard>
    );
  }

  const onFinish = async ({ password }: Values) => {
    setErrorKey(null);
    setSubmitting(true);
    try {
      await resetPassword(validToken, password);
      await refresh();
      router.replace("/profile");
    } catch (err) {
      setErrorKey(authErrorKey(err, "reset"));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title={t("resetTitle")} intro={t("resetIntro")}>
      <Form
        layout="vertical"
        validateTrigger="onBlur"
        onFinish={onFinish}
        onValuesChange={() => {
          if (errorKey) setErrorKey(null);
        }}
        className="space-y-6 [&_.ant-form-item]:mb-0"
      >
        <AuthFormError message={errorKey ? t(errorKey) : null} />
        <Form.Item
          name="password"
          label={t("newPassword")}
          rules={[
            { required: true, message: t("passwordRequired") },
            { min: AUTH_PASSWORD_MIN_LENGTH, message: t("errorPasswordWeak") },
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="new-password"
            disabled={submitting}
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={t("confirmPassword")}
          dependencies={["password"]}
          rules={[
            { required: true, message: t("confirmPasswordRequired") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("passwordsMismatch")));
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="new-password"
            disabled={submitting}
          />
        </Form.Item>
        <p className="text-xs leading-5 text-fg-subtle">{t("resetSignsOutHint")}</p>
        <Form.Item className="mb-0! pt-1">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
            disabled={submitting}
          >
            {t("resetSubmit")}
          </Button>
        </Form.Item>
      </Form>
      {errorKey === "errorResetLinkInvalid" ? requestNewLink : null}
    </AuthCard>
  );
}
