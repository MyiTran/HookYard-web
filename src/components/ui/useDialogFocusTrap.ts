import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DialogFocusTrapOptions = {
  onClose: () => void;
  dismissible?: boolean;
};

export function useDialogFocusTrap({ onClose, dismissible = true }: DialogFocusTrapOptions) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    if (dialog && !dialog.contains(document.activeElement)) {
      const focusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

      (focusable ?? dialog).focus();
    }

    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    if (!dismissible) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, dismissible]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => element.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  return { dialogRef, handleDialogKeyDown };
}
