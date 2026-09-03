"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { useTranslations } from "next-intl";
import { register as registerApi } from "@/api/auth";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import {
  AUTH_PASSWORD_MIN_LENGTH,
  authErrorKey,
  type AuthErrorKey,
} from "@/utills/helpers/authErrorKey";
import AuthFormError from "./AuthFormError";

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const [form] = Form.useForm();
  const router = useRouter();
  const { refresh } = useAuth();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: {
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setErrorKey(null);
    setSubmitting(true);
    try {
      await registerApi({
        name: values.name,
        surname: values.surname,
        email: values.email,
        password: values.password,
      });
      await refresh();
      router.push("/profile");
    } catch (err) {
      setErrorKey(authErrorKey(err, "register"));
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Form.Item
          name="name"
          label={t("name")}
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <Input
            size="large"
            autoComplete="given-name"
            disabled={submitting}
          />
        </Form.Item>
        <Form.Item
          name="surname"
          label={t("surname")}
          rules={[{ required: true, message: t("surnameRequired") }]}
        >
          <Input
            size="large"
            autoComplete="family-name"
            disabled={submitting}
          />
        </Form.Item>
      </div>

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
        rules={[
          { required: true, message: t("passwordRequired") },
          {
            min: AUTH_PASSWORD_MIN_LENGTH,
            message: t("errorPasswordWeak"),
          },
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
          {t("register")}
        </Button>
      </Form.Item>
    </Form>
  );
}
