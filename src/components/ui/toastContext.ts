import { createContext, useContext } from "react";

export type ToastType = "success" | "error";

export type ToastInput = {
  type: ToastType;
  message: string;
};

export type ToastValue = {
  showToast: (toast: ToastInput) => void;
};

export const ToastContext = createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return value;
}
