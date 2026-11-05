import { replaySummaryEntries } from "../../lib/replayStatus";
import type { ReplaySummary } from "../../types/replay";

type ReplaySummaryGridProps = {
  summary: ReplaySummary;
};

function ReplaySummaryGrid({ summary }: ReplaySummaryGridProps) {
  return (
    <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5 xl:grid-cols-9">
      {replaySummaryEntries(summary).map((entry) => (
        <div key={entry.key} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">{entry.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default ReplaySummaryGrid;
