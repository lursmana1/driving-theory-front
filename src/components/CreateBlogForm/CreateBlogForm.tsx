"use client";

import { App, Form, Input, Button } from "antd";
import type { FormInstance } from "antd";
import axios from "axios";
import { useState } from "react";
import Tiptap from "../Tiptap/Tiptap";
import ImageUploadInput from "./ImageUploadInput";
import BaseApi from "@/api/BaseApi";

type FormValues = {
  name: string;
  content: string;
  description: string;
  image?: File | null;
};

type BlogField = keyof FormValues;

function apiErrorText(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Could not create the blog";
  const raw = (error.response?.data as { message?: unknown } | undefined)
    ?.message;
  if (Array.isArray(raw)) return raw.map(String).join(" ");
  if (typeof raw === "string" && raw.trim()) return raw;
  if (error.response?.status === 401) return "You need to sign in again";
  if (error.response?.status === 403) return "Admin access required";
  return "Could not create the blog";
}

function fieldForApiError(message: string): BlogField | null {
  const text = message.toLowerCase();
  if (text.includes("name")) return "name";
  if (text.includes("description")) return "description";
  if (text.includes("content")) return "content";
  if (text.includes("image") || text.includes("file")) return "image";
  return null;
}

function showApiError(error: unknown, form: FormInstance<FormValues>) {
  const message = apiErrorText(error);
  const field = fieldForApiError(message);
  if (field) {
    form.setFields([{ name: field, errors: [message] }]);
  }
  return message;
}

function toFormData(values: FormValues): FormData {
  const fd = new FormData();
  fd.append("name", values.name);
  fd.append("content", values.content);
  fd.append("description", values.description);
  if (values.image) fd.append("file", values.image);
  return fd;
}

export default function CreateBlogForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    if (!values.image) {
      form.setFields([{ name: "image", errors: ["Image is required"] }]);
      return;
    }

    setLoading(true);
    try {
      await BaseApi.post("/blogs", toFormData(values));
      form.resetFields();
      message.success("Blog created");
    } catch (error) {
      message.error(showApiError(error, form));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full max-w-3xl space-y-6 [&_.ant-form-item]:mb-0"
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Name is required" }]}
      >
        <Input size="large" placeholder="Blog title" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: "Content is required" }]}
      >
        <Tiptap />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <Input.TextArea rows={4} placeholder="Description" />
      </Form.Item>

      <Form.Item
        name="image"
        label="Image"
        rules={[{ required: true, message: "Image is required" }]}
      >
        <ImageUploadInput />
      </Form.Item>

      <Form.Item className="mb-0! pt-1">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
        >
          Create Blog
        </Button>
      </Form.Item>
    </Form>
  );
}
