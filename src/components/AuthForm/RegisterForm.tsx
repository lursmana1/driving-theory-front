"use client";

import { Form, Input, Button } from "antd";
import { useTranslations } from "next-intl";
import { register as registerApi } from "@/api/auth";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const [form] = Form.useForm();
  const router = useRouter();
  const { refresh } = useAuth();

  const onFinish = async (values: {
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const { user } = await registerApi({
        name: values.name,
        surname: values.surname,
        email: values.email,
        password: values.password,
      });
      if (user) {
        await refresh();
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-6 [&_.ant-form-item]:mb-0"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Form.Item
          name="name"
          label={t("name")}
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <Input size="large" autoComplete="given-name" />
        </Form.Item>
        <Form.Item
          name="surname"
          label={t("surname")}
          rules={[{ required: true, message: t("surnameRequired") }]}
        >
          <Input size="large" autoComplete="family-name" />
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
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={t("password")}
        rules={[{ required: true, message: t("passwordRequired") }]}
      >
        <Input.Password size="large" autoComplete="new-password" />
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
        <Input.Password size="large" autoComplete="new-password" />
      </Form.Item>

      <Form.Item className="mb-0! pt-1">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className="mt-0!"
        >
          {t("register")}
        </Button>
      </Form.Item>
    </Form>
  );
}
