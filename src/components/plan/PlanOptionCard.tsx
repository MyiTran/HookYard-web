import type { ReactNode } from "react";
import { planLabel } from "../../lib/plan";
import { formatCount } from "../../lib/numberFormat";
import type { Plan } from "../../types/plan";
import Badge from "../ui/Badge";

export type PlanOptionRow = {
  label: string;
  value: string;
};

export type PlanOptionSection = {
  title: string;
  rows: PlanOptionRow[];
};

type PlanOptionCardProps = {
  plan: Plan;
  projectLimit: number;
  endpointLimit: number;
  deliveryLimit: number;
  current: boolean;
  action?: ReactNode;
  sections?: PlanOptionSection[];
};

const PLAN_SUMMARIES: Record<Plan, string> = {
  free: "For small teams getting started.",
  pro: "For production traffic that needs more headroom.",
};

function PlanOptionRows({ rows }: { rows: PlanOptionRow[] }) {
  return (
    <dl className="mt-2 space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <dt className="text-sm font-medium text-[#53665A]">{row.label}</dt>
          <dd className="text-sm font-semibold text-[#1F2A24]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PlanOptionSectionBlock({ title, rows }: PlanOptionSection) {
  return (
    <section className="mt-4 border-t border-[#EDF2EE] pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">{title}</p>
      <PlanOptionRows rows={rows} />
    </section>
  );
}

function PlanOptionCard({
  plan,
  projectLimit,
  endpointLimit,
  deliveryLimit,
  current,
  action,
  sections = [],
}: PlanOptionCardProps) {
  const limits: PlanOptionRow[] = [
    { label: "Projects", value: formatCount(projectLimit) },
    { label: "Endpoints per project", value: formatCount(endpointLimit) },
    { label: "Deliveries per month", value: formatCount(deliveryLimit) },
  ];
  const filledSections = sections.filter((section) => section.rows.length > 0);

  return (
    <article
      aria-current={current ? "true" : undefined}
      className={`flex h-full flex-col rounded-[18px] border bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)] ${
        current ? "border-[#23613F] ring-1 ring-[#23613F]/15" : "border-[#D8E3DB]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-[#1F2A24]">{planLabel(plan)}</h3>
        {current && (
          <Badge tone="green" dot>
            Current plan
          </Badge>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-[#718078]">{PLAN_SUMMARIES[plan]}</p>

      <div className="mt-4 border-t border-[#EDF2EE] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Limits</p>
        <PlanOptionRows rows={limits} />
      </div>

      {filledSections.map((section) => (
        <PlanOptionSectionBlock key={section.title} title={section.title} rows={section.rows} />
      ))}

      {action && <div className="mt-auto pt-5">{action}</div>}
    </article>
  );
}

export default PlanOptionCard;
