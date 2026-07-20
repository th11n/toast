import type { CSSProperties, ReactNode } from "react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export type ToastIcon = ReactNode;

export type ToastIcons = Partial<Record<ToastVariant, ToastIcon>>;

export type ToastIconStyle = "phosphor" | "lucide" | "react-icons";

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type ToastInput = {
  title: ReactNode;
  /** Additional classes merged with the toast card styles. */
  className?: string;
  description?: ReactNode;
  /** Auto-dismiss delay in milliseconds. Set to 0 to keep the toast open. */
  duration?: number;
  grain?: boolean;
  icon?: ToastIcon;
  showCategory?: boolean;
  showDescription?: boolean;
  /** Inline styles applied after the built-in variant gradient. */
  style?: CSSProperties;
};

export type ToastOptions = Omit<ToastInput, "title">;

export type ToastProps = ToastInput & {
  dismissDirection?: -1 | 1;
  variant?: ToastVariant;
  onDismiss?: () => void;
};

export type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
};
