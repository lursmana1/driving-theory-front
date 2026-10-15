type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
};

export default function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`min-w-[28px] rounded-xs px-2 py-1.5 text-sm font-medium transition-colors hover:bg-surface-strong ${
        active ? "bg-surface-strong text-accent" : "text-fg-muted"
      }`}
    >
      {children}
    </button>
  );
}
