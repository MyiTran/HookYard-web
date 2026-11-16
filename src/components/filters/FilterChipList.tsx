import FilterClearButton from "./FilterClearButton";
import CloseIcon from "../icons/CloseIcon";

export type FilterChip<Key extends string = string> = {
  key: Key;
  label: string;
};

type FilterChipListProps<Key extends string> = {
  chips: FilterChip<Key>[];
  onRemove: (key: Key) => void;
  onClear: () => void;
};

function FilterChipList<Key extends string>({ chips, onRemove, onClear }: FilterChipListProps<Key>) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="flex min-w-0 flex-wrap items-center gap-2" aria-label="Active filters">
        {chips.map((chip) => (
          <li key={chip.key} className="min-w-0 max-w-full">
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#EFF5F1] py-1 pl-2.5 pr-1.5 text-xs font-semibold text-[#405348]">
              <span className="min-w-0 truncate" title={chip.label}>
                {chip.label}
              </span>

              <button
                type="button"
                aria-label={`Remove filter ${chip.label}`}
                onClick={() => onRemove(chip.key)}
                className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#718078] transition hover:bg-[#D8E3DB] hover:text-[#1F2A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/40"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <span className="ml-auto">
        <FilterClearButton onClick={onClear} />
      </span>
    </div>
  );
}

export default FilterChipList;
