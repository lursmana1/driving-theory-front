import { ReactNode } from "react";

type ButtonMode = "primary" | "secondary" | "danger";

type CustomButtonProps = {
  onButtonClick: () => void;
  children: ReactNode;
  mode?: ButtonMode;
};

const modeClasses: Record<ButtonMode, string> = {
  primary: "text-accent",
  secondary: "text-gray-700",
  danger: "text-red-500",
};

const Button = ({
  onButtonClick,
  children,
  mode = "primary",
}: CustomButtonProps) => {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium bg-slate-100 shadow-[4px_4px_10px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:shadow-[2px_2px_5px_rgba(0,0,0,0.15),-2px_-2px_5px_rgba(255,255,255,0.9)] active:shadow-inner active:translate-y-0.5";

  return (
    <button onClick={onButtonClick} className={`${base} ${modeClasses[mode]}`}>
      {children}
    </button>
  );
};

export default Button;
