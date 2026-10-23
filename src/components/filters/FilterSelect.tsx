import ChevronDownIcon from "../icons/ChevronDownIcon";

type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  ariaLabel: string;
  id?: string;
  className?: string;
};

function FilterSelect({ value, onChange, options, ariaLabel, id, className = "" }: FilterSelectProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className={`relative min-w-0 ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        title={selectedLabel}
        className="h-11 w-full cursor-pointer appearance-none truncate rounded-xl border border-[#C9DACE] bg-white py-0 pl-4 pr-11 text-sm font-medium text-[#405348] outline-none transition focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" />
    </div>
  );
}

export default FilterSelect;
