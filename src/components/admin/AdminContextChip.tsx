import CloseIcon from "../icons/CloseIcon";

type AdminContextChipProps = {
  label: string;
  onClear: () => void;
};

function AdminContextChip({ label, onClear }: AdminContextChipProps) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#C9DACE] bg-white px-3 py-1.5">
      <span className="truncate text-xs font-semibold text-[#405348]">{label}</span>

      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${label}`}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#718078] transition hover:bg-[#F1F6F2] hover:text-[#405348]"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default AdminContextChip;
