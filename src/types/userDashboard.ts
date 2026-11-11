import type { Plan } from "./plan";
import type { ProjectMembershipRole } from "./project";

export type UserWorkspaceSummary = {
  project_count: number;
  owned_project_count: number;
  shared_project_count: number;
};

export type UserDeliveryHealth = {
  period_label: string;
  total: number;
  succeeded: number;
  failed: number;
  in_flight: number;
  held: number;
  retries_due: number;
  success_rate: number | null;
};

export type UserNeedsAttention = {
  open_circuit_endpoints: number;
  held_deliveries: number;
  retries_due: number;
  failed_deliveries: number;
};

export type UserDashboardProject = {
  id: string;
  name: string;
  relationship: "owned" | "shared";
  current_user_role: ProjectMembershipRole | null;
  effective_plan: Plan | null;
  endpoint_count: number;
  active_endpoint_count: number;
  circuit_open_endpoint_count: number;
  held_delivery_count: number;
  recent_failed_delivery_count: number;
  updated_at: string;
};

export type UserDashboard = {
  workspace: UserWorkspaceSummary;
  delivery_health: UserDeliveryHealth;
  needs_attention: UserNeedsAttention;
  projects: UserDashboardProject[];
};
