import CloseIcon from "../icons/CloseIcon";

type FilterClearButtonProps = {
  onClick: () => void;
  compact?: boolean;
  className?: string;
};

function FilterClearButton({ onClick, compact = false, className = "" }: FilterClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear filters"
      title="Clear filters"
      className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30 ${
        compact ? "w-11 px-0" : "px-3"
      } ${className}`}
    >
      <CloseIcon className="h-4 w-4" />
      {!compact && "Clear"}
    </button>
  );
}

export default FilterClearButton;
