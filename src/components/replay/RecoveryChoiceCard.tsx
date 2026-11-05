import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import ChevronDownIcon from "../icons/ChevronDownIcon";

type RecoveryChoiceCardProps = {
  panelId: string;
  title: string;
  description: string;
  availability: string;
  badge?: ReactNode;
  open: boolean;
  mounted?: boolean;
  locked?: boolean;
  lockedMessage?: string;
  plansTo?: string;
  onToggle: () => void;
  children: ReactNode;
};

function RecoveryChoiceCard({
  panelId,
  title,
  description,
  availability,
  badge,
  open,
  mounted = open,
  locked = false,
  lockedMessage,
  plansTo,
  onToggle,
  children,
}: RecoveryChoiceCardProps) {
  const header = (
    <>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-[#1F2A24]">{title}</span>
          {badge}
        </span>

        <span className={`mt-1 block text-sm font-medium ${locked ? "text-[#8A9990]" : "text-[#53665A]"}`}>
          {description}
        </span>

        <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
          {availability}
        </span>
      </span>

      {!locked && (
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );

  return (
    <section
      aria-label={title}
      className={`rounded-[18px] border bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)] ${
        open ? "border-[#23613F]" : "border-[#D8E3DB]"
      }`}
    >
      {locked ? (
        <div className="flex flex-wrap items-start gap-3 p-5">{header}</div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={`flex w-full cursor-pointer flex-wrap items-start gap-3 rounded-[18px] p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30 ${
            open ? "" : "hover:bg-[#F7FAF8]"
          }`}
        >
          {header}
        </button>
      )}

      {locked && lockedMessage && (
        <div className="px-5 pb-5">
          <p className="rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 text-xs font-semibold text-[#8A5D14]">
            {lockedMessage}
          </p>

          {plansTo && (
            <Link
              to={plansTo}
              className="mt-3 inline-flex h-10 items-center rounded-xl border border-[#C9DACE] px-4 text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
            >
              View plans
            </Link>
          )}
        </div>
      )}

      {mounted && !locked && (
        <div id={panelId} hidden={!open} className="border-t border-[#E4EBE6] p-5">
          {children}
        </div>
      )}
    </section>
  );
}

export default RecoveryChoiceCard;
