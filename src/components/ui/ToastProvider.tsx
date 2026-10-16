import { useCallback, useRef, useState, type ReactNode } from "react";
import Toast from "./Toast";
import { ToastContext, type ToastInput, type ToastValue } from "./toastContext";

type ToastProviderProps = { children: ReactNode };

type ToastRecord = ToastInput & { id: number };

const TOAST_DURATION_MS = 3000;

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;

      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    },
    [removeToast],
  );

  const value: ToastValue = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-6 top-24 z-50 flex flex-col items-end gap-3"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
