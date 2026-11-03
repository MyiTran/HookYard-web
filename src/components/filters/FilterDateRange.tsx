const TEXT_INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-[#C9DACE] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

const DATE_FIELD_CLASS =
  "flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#C9DACE] bg-white px-3 text-sm transition focus-within:border-[#23613F] focus-within:ring-2 focus-within:ring-[#23613F]/10";

const FIELD_LABEL = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

type FilterDateRangeProps = {
  idPrefix: string;
  layout: "row" | "stacked";
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

function FilterDateRange({ idPrefix, layout, from, to, onFromChange, onToChange }: FilterDateRangeProps) {
  if (layout === "row") {
    return (
      <>
        <label className={`${DATE_FIELD_CLASS} w-full sm:w-44`}>
          <span className="shrink-0 text-xs font-semibold text-[#8A9990]">From</span>
          <input
            id={`${idPrefix}From`}
            type="date"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            aria-label="From date (UTC)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>

        <label className={`${DATE_FIELD_CLASS} w-full sm:w-44`}>
          <span className="shrink-0 text-xs font-semibold text-[#8A9990]">To</span>
          <input
            id={`${idPrefix}To`}
            type="date"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            aria-label="To date (UTC)"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </>
    );
  }

  return (
    <fieldset>
      <legend className={FIELD_LABEL}>Received date range (UTC)</legend>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}From`} className={FIELD_LABEL}>
            From (UTC)
          </label>

          <input
            id={`${idPrefix}From`}
            type="date"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            className={TEXT_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}To`} className={FIELD_LABEL}>
            To (UTC)
          </label>

          <input
            id={`${idPrefix}To`}
            type="date"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            className={TEXT_INPUT_CLASS}
          />
        </div>
      </div>
    </fieldset>
  );
}

export default FilterDateRange;
