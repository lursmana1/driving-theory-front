import { examCtaPillBase } from "@/layoutComponents/Header/headerVariants";

type StartExamButtonProps = {
  disabled: boolean;
  onClick: () => void;
  label: string;
  className?: string;
};

export function StartExamButton({
  disabled,
  onClick,
  label,
  className = "",
}: StartExamButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${examCtaPillBase} ${className}`}
    >
      {label}
    </button>
  );
}
