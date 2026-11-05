import type { Plan } from "../types/plan";
import { formatCount } from "./numberFormat";

export type UsageLevel = "normal" | "warning" | "danger";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
};

export function planLabel(plan: Plan): string {
  return PLAN_LABELS[plan];
}

export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;

  return Math.min(100, Math.round((used / limit) * 100));
}

export function usageLevel(percent: number): UsageLevel {
  if (percent >= 100) return "danger";
  if (percent >= 80) return "warning";

  return "normal";
}

export function formatUsage(used: number, limit: number): string {
  return `${formatCount(used)} of ${formatCount(limit)}`;
}
