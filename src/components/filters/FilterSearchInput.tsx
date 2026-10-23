import SearchIcon from "../icons/SearchIcon";

type FilterSearchInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
};

function FilterSearchInput({ id, value, onChange, placeholder, label, className = "" }: FilterSearchInputProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9EADA3]" />

      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#C9DACE] bg-white pl-10 pr-24 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10 [&::-webkit-search-cancel-button]:appearance-none"
      />

      <button
        type="submit"
        className="absolute right-1.5 top-1/2 flex h-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg bg-[#EFF5F1] px-3 text-xs font-semibold text-[#214E35] transition hover:bg-[#D8E3DB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
      >
        Search
      </button>
    </div>
  );
}

export default FilterSearchInput;
