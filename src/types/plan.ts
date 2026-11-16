export const PLANS = ["free", "pro"] as const;

export type Plan = (typeof PLANS)[number];

export type AvailablePlan = {
  plan: Plan;
  project_limit: number;
  endpoint_limit_per_project: number;
  monthly_delivery_limit: number;
};

export type AccountUsage = {
  project_count: number;
  deliveries_this_period: number;
  deliveries_remaining: number;
  period_starts_at: string;
  period_ends_at: string;
};

export type AccountPlan = {
  id: string;
  plan: Plan;
  project_limit: number;
  endpoint_limit_per_project: number;
  monthly_delivery_limit: number;
  available_plans: AvailablePlan[] | null;
  usage: AccountUsage | null;
};

export type ProjectUsage = {
  endpoint_count: number;
  deliveries_this_period: number;
  deliveries_remaining: number;
  period_starts_at: string;
  period_ends_at: string;
};
