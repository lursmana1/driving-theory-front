export type TiptapProps = {
  value?: string;
  onChange?: (html: string) => void;
  /** When true, content is read-only and toolbar is hidden. */
  readonly?: boolean;
  /** When true with readonly, no border/wrapper styling (for blog post display). */
  bare?: boolean;
  /** Set by Ant Design Form.Item when validation fails. */
  status?: "error" | "warning" | "validating" | "";
};
