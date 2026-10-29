import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerOutline" | "dangerSoft";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export type { ButtonVariant };

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-[#214E35] text-white hover:bg-[#173D28]",
  secondary: "border border-[#C9DACE] text-[#405348] hover:bg-[#F1F6F2]",
  ghost: "text-[#405348] hover:bg-[#F1F6F2]",
  danger: "bg-[#B42318] text-white hover:bg-[#8F1C13]",
  dangerOutline: "border border-[#F1D5D5] text-[#B42318] hover:bg-[#FBEEEE]",
  dangerSoft: "text-[#B42318] hover:bg-[#FBEEEE]",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  xl: "h-12 px-6 text-sm",
};

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
