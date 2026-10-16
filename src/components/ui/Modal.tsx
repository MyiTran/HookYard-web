import { useEffect, useId, type ReactNode } from "react";
import CloseIcon from "../icons/CloseIcon";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

const SCROLL_CLASS =
  "min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-7 [scrollbar-width:thin] [scrollbar-color:#C2D4C7_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C2D4C7] [&::-webkit-scrollbar-track]:bg-transparent";

function Modal({ title, onClose, children, footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#17211B]/40 p-4 sm:items-center"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[22px] border border-[#D8E3DB] bg-white shadow-[0_24px_70px_rgba(23,33,27,0.25)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-7 sm:pt-7">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#718078] transition hover:bg-[#F1F6F2] hover:text-[#405348]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={SCROLL_CLASS}>{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-[#E4EBE6] px-6 py-4 sm:px-7">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
