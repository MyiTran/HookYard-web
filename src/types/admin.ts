import type { DeliveryHold, DeliveryState, MessageStatus } from "./delivery";
import type { Plan } from "./plan";

export type AdminOverviewAccounts = {
  total: number;
  admins: number;
  support: number;
  unconfirmed: number;
};

export type AdminOverviewDeliveries = {
  window_days: number;
  total_attempts: number;
  succeeded_attempts: number;
  failed_attempts: number;
  success_rate: number;
  in_flight: number;
  held: number;
  retries_due: number;
};

export type AdminOverview = {
  generated_at: string;
  accounts: AdminOverviewAccounts;
  projects: { total: number };
  endpoints: {
    active: number;
    circuit_open: number;
    disabled: number;
    queued_messages: number;
  };
  deliveries: AdminOverviewDeliveries;
};

export type AdminSupportAccountRole = "admin" | "support";

export type AdminSupportAccount = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  sign_in_count: number;
  last_sign_in_at: string | null;
  created_at: string;
  name: string;
  plan: Plan;
  confirmed: boolean;
  roles: AdminSupportAccountRole[];
};

export type AdminOwnedProjectRef = {
  id: string;
  name: string;
};

export type AdminSupportAccountDetail = AdminSupportAccount & {
  owned_project_count: number;
  owned_projects: AdminOwnedProjectRef[];
};

export type AdminBillingAccount = {
  id: string;
  email: string;
  plan: Plan;
};

export type AdminProject = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  plan: Plan | null;
  account: AdminBillingAccount | null;
};

export type AdminEndpointSummary = {
  total: number;
  active: number;
  paused: number;
  archived: number;
  enabled: number;
  circuit_open: number;
  disabled: number;
  queued_messages: number;
};

export type AdminProjectDetail = AdminProject & {
  member_count: number;
  endpoint_summary: AdminEndpointSummary;
};

export type AdminEndpoint = {
  id: string;
  name: string;
  active: boolean;
  archived_at: string | null;
  event_types: string[];
  circuit_state: "enabled" | "circuit_open" | "disabled";
  circuit_opened_at: string | null;
  queued_message_count: number;
  created_at: string;
  updated_at: string;
  url: string;
  project: { id: string; name: string };
};

export type AdminDeliverySummary = {
  total: number;
  recent: number;
  held: number;
};

export type AdminEndpointDetail = AdminEndpoint & {
  paused: boolean;
  account: AdminBillingAccount | null;
  delivery_summary: AdminDeliverySummary;
};

export type AdminDelivery = {
  id: string;
  status: MessageStatus;
  attempt_count: number;
  terminal_at: string | null;
  next_retry_at: string | null;
  last_attempt_at: string | null;
  last_response_status: number | null;
  last_duration_ms: number | null;
  created_at: string;
  updated_at: string;
  webhook_id: string;
  delivery_state: DeliveryState;
  failure_category: string | null;
  hold: DeliveryHold | null;
  event: { id: string; event_type: string; created_at: string };
  endpoint: { id: string; name: string };
  project: { id: string; name: string };
};
