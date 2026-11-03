"use client";

import { useState } from "react";
import { Button, Form, Input } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { forgotPassword } from "@/api/auth";
import { authErrorKey, type AuthErrorKey } from "@/utills/helpers/authErrorKey";
import AuthFormError from "./AuthFormError";
import { AuthCard } from "./AuthPageShell";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({ email }: { email: string }) => {
    setErrorKey(null);
    setSubmitting(true);
    try {
      const lang =
        routing.locales.find((l) => l === locale) ?? routing.defaultLocale;
      const address = email.trim();
      await forgotPassword(address, lang);
      setSentTo(address);
    } catch (err) {
      setErrorKey(authErrorKey(err, "forgot"));
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title={t("forgotSentTitle")}>
        <p className="text-sm leading-6 text-fg-muted">
          {t("forgotSentText", { email: sentTo })}
        </p>
        <p className="mt-4 text-sm leading-6 text-fg-muted">
          {t("forgotNotReceived")}{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="font-semibold text-accent transition hover:text-accent-strong hover:underline"
          >
            {t("forgotSendAgain")}
          </button>
        </p>
        <Link
          href="/auth"
          className="mt-6 inline-block font-semibold text-accent hover:text-accent-strong hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("forgotTitle")} intro={t("forgotIntro")}>
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
          name="email"
          label={t("email")}
          rules={[
            { required: true, message: t("emailRequired") },
            { type: "email", message: t("emailInvalid") },
          ]}
        >
          <Input
            type="email"
            size="large"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={submitting}
          />
        </Form.Item>
        <Form.Item className="mb-0! pt-1">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
            disabled={submitting}
          >
            {t("forgotSubmit")}
          </Button>
        </Form.Item>
      </Form>
      <Link
        href="/auth"
        className="mt-6 inline-block text-sm font-semibold text-accent hover:text-accent-strong hover:underline"
      >
        {t("backToLogin")}
      </Link>
    </AuthCard>
  );
}
