import type { ReactNode, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
  ghost: "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500",
  icon: "text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full p-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  default: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "default",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isIcon = variant === "icon";
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${isIcon ? "" : sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
