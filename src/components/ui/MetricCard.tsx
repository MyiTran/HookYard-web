import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type MetricTone = "blue" | "green" | "amber" | "purple" | "red";

type MetricCardProps = {
  label: string;
  value: string;
  tone: MetricTone;
  icon: ReactNode;
  to?: string;
  unavailable?: boolean;
};

const TONE_STYLES: Record<MetricTone, { iconBg: string; iconText: string; value: string }> = {
  blue: { iconBg: "bg-[#E8F1FB]", iconText: "text-[#2563A8]", value: "text-[#1D5FA8]" },
  green: { iconBg: "bg-[#EAF5EE]", iconText: "text-[#23613F]", value: "text-[#1E5A34]" },
  amber: { iconBg: "bg-[#FBF1E4]", iconText: "text-[#9A6B1F]", value: "text-[#8A5D14]" },
  purple: { iconBg: "bg-[#EFEAF9]", iconText: "text-[#6D4AA8]", value: "text-[#5E3E96]" },
  red: { iconBg: "bg-[#FBEEEE]", iconText: "text-[#B42318]", value: "text-[#9B2018]" },
};

const CARD_BASE =
  "block rounded-[16px] border border-[#E4EBE6] bg-white p-4 shadow-[0_4px_16px_rgba(32,78,53,0.04)]";

function MetricCard({ label, value, tone, icon, to, unavailable = false }: MetricCardProps) {
  const styles = TONE_STYLES[tone];

  const body = (
    <>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${styles.iconBg} ${styles.iconText}`}
      >
        {icon}
      </span>

      <p className={`mt-3 text-2xl font-semibold tracking-tight ${unavailable ? "text-[#9AA79F]" : styles.value}`}>
        {value}
      </p>
      <p className="text-xs font-semibold text-[#53665A]">{label}</p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`${CARD_BASE} cursor-pointer transition hover:border-[#C9DACE] hover:shadow-[0_8px_24px_rgba(32,78,53,0.08)]`}
      >
        {body}
      </Link>
    );
  }

  return <div className={CARD_BASE}>{body}</div>;
}

export default MetricCard;
