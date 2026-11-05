import { formatUsage, usageLevel, usagePercent } from "../../lib/plan";
import { formatCount } from "../../lib/numberFormat";

type UsageProgressProps = {
  label: string;
  used: number;
  limit: number;
  unit: string;
};

const LEVEL_BAR_STYLES = {
  normal: "bg-[#23613F]",
  warning: "bg-[#C0891F]",
  danger: "bg-[#B42318]",
};

const LEVEL_TEXT_STYLES = {
  normal: "text-[#53665A]",
  warning: "text-[#9A6B1F]",
  danger: "text-[#B42318]",
};

function UsageProgress({ label, used, limit, unit }: UsageProgressProps) {
  const percent = usagePercent(used, limit);
  const level = usageLevel(percent);
  const usageText = formatUsage(used, limit);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-[#53665A]">{label}</p>
        <p className={`text-xs font-semibold ${LEVEL_TEXT_STYLES[level]}`}>{percent}%</p>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={`${usageText} ${unit} (${percent}%)`}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E4EBE6]"
      >
        <div
          className={`h-full rounded-full transition-[width] ${LEVEL_BAR_STYLES[level]}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs font-medium text-[#718078]">
        <span className={`font-semibold ${LEVEL_TEXT_STYLES[level]}`}>{formatCount(used)}</span> of{" "}
        {formatCount(limit)} {unit}
      </p>
    </div>
  );
}

export default UsageProgress;
