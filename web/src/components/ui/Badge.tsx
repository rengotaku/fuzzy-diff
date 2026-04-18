import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "added"
  | "removed"
  | "changed";

export type BadgeSize = "sm" | "default";

interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly children: ReactNode;
  readonly className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  destructive: "bg-red-100 text-red-700",
  added: "bg-diff-added-bg text-diff-added-text",
  removed: "bg-diff-removed-bg text-diff-removed-text",
  changed: "bg-diff-changed-bg text-diff-changed-text",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  default: "px-2.5 py-0.5 text-sm",
};

export function Badge({
  variant = "default",
  size = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      data-testid="badge"
    >
      {children}
    </span>
  );
}
