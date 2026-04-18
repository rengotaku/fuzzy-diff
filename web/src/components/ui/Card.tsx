import type { ReactNode } from "react";

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly "data-testid"?: string;
}

export function Card({ children, className = "", "data-testid": dataTestId = "card" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 ${className}`}
      data-testid="card-header"
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`p-4 ${className}`} data-testid="card-content">
      {children}
    </div>
  );
}
