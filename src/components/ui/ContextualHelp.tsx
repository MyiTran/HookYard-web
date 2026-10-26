import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import CloseIcon from "../icons/CloseIcon";
import HelpCircleIcon from "../icons/HelpCircleIcon";

type ContextualHelpProps = {
  label: string;
  title: string;
  children: ReactNode;
  widthRem?: number;
};

type HelpPlacement = {
  side: "above" | "below";
  maxHeight: number;
  offsetLeft: number;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function measureHelpPlacement(anchor: HTMLElement, widthRem: number): HelpPlacement {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - 24;
  const spaceAbove = rect.top - 24;
  const side = spaceBelow >= 320 || spaceBelow >= spaceAbove ? "below" : "above";
  const panelWidth = Math.min(widthRem * 16, window.innerWidth - 32);
  const maxLeft = Math.max(16, window.innerWidth - panelWidth - 16);
  const offsetLeft = Math.max(16, Math.min(rect.left, maxLeft)) - rect.left;

  return {
    side,
    maxHeight: Math.max(0, Math.floor(side === "below" ? spaceBelow : spaceAbove)),
    offsetLeft,
  };
}

function ContextualHelp({ label, title, children, widthRem = 34 }: ContextualHelpProps) {
  const titleId = useId();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [placement, setPlacement] = useState<HelpPlacement>({ side: "below", maxHeight: 0, offsetLeft: 0 });

  const closeHelp = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  function openHelp() {
    setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    if (anchorRef.current) setPlacement(measureHelpPlacement(anchorRef.current, widthRem));
    setOpen(true);
  }

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    function handleChange() {
      setIsDesktop(query.matches);
    }

    query.addEventListener("change", handleChange);
    window.addEventListener("resize", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
      window.removeEventListener("resize", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!open || !isDesktop) return;

    function updatePlacement() {
      if (anchorRef.current) setPlacement(measureHelpPlacement(anchorRef.current, widthRem));
    }

    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, isDesktop, widthRem]);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
  }, [open, isDesktop]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeHelp();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeHelp]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => element.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

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

  return (
    <div ref={anchorRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={openHelp}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#718078] transition hover:bg-[#EFF5F1] hover:text-[#23613F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F] focus-visible:ring-offset-2"
      >
        <HelpCircleIcon className="h-3.5 w-3.5" />
      </button>

      {open && isDesktop && (
        <>
          <div className="fixed inset-0 z-40 bg-[#17211B]/20" onMouseDown={closeHelp} aria-hidden="true" />

          <div
            ref={dialogRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
            className={`absolute z-50 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_24px_70px_rgba(23,33,27,0.22)] ${placement.side === "below" ? "top-full mt-2" : "bottom-full mb-2"}`}
            style={{
              left: placement.offsetLeft,
              width: `min(${widthRem}rem, calc(100vw - 2rem))`,
              maxHeight: placement.maxHeight,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id={titleId} className="text-base font-semibold tracking-tight text-[#1F2A24]">
                {title}
              </h3>

              <button
                ref={closeRef}
                type="button"
                aria-label="Close help"
                onClick={closeHelp}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#718078] transition hover:bg-[#EFF5F1] hover:text-[#405348] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F] focus-visible:ring-offset-2"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-3">{children}</div>
          </div>
        </>
      )}

      {open && !isDesktop && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] items-end justify-center bg-[#17211B]/40 p-4"
          onMouseDown={closeHelp}
        >
          <div
            ref={dialogRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
            className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-[#D8E3DB] bg-white shadow-[0_24px_70px_rgba(23,33,27,0.25)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-5">
              <h3 id={titleId} className="text-base font-semibold tracking-tight text-[#1F2A24]">
                {title}
              </h3>

              <button
                ref={closeRef}
                type="button"
                aria-label="Close help"
                onClick={closeHelp}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#718078] transition hover:bg-[#EFF5F1] hover:text-[#405348] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F] focus-visible:ring-offset-2"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 pb-5">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContextualHelp;
