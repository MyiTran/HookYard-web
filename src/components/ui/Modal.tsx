import { useEffect, useId, type ReactNode } from "react";
import CloseIcon from "../icons/CloseIcon";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ title, onClose, children }: ModalProps) {
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
        className="w-full max-w-md rounded-[22px] border border-[#D8E3DB] bg-white p-6 shadow-[0_24px_70px_rgba(23,33,27,0.25)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
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

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
