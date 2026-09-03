"use client";

import { useState } from "react";
import { login as loginApi } from "@/api/auth";
import { Form, Input, Button } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { authErrorKey, type AuthErrorKey } from "@/utills/helpers/authErrorKey";
import AuthFormError from "./AuthFormError";

export default function LoginForm() {
  const t = useTranslations("Auth");
  const [form] = Form.useForm();
  const router = useRouter();
  const { refresh } = useAuth();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setErrorKey(null);
    setSubmitting(true);
    try {
      await loginApi(email, password);
      await refresh();
      router.push("/profile");
    } catch (err) {
      setErrorKey(authErrorKey(err, "login"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
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

      <Form.Item
        name="password"
        label={t("password")}
        rules={[{ required: true, message: t("passwordRequired") }]}
      >
        <Input.Password
          size="large"
          autoComplete="current-password"
          disabled={submitting}
        />
      </Form.Item>

      <Form.Item className="mb-0! pt-1">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className="mt-0!"
          loading={submitting}
          disabled={submitting}
        >
          {t("login")}
        </Button>
      </Form.Item>
    </Form>
  );
}
