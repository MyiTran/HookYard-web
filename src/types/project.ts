import type { Plan, ProjectUsage } from "./plan";
import type { UserProfile } from "./user";

export type ProjectMembershipRole = "owner" | "maintainer";

export type Project = {
  id: string;
  name: string;
  plan: Plan;
  endpoint_limit: number;
  monthly_delivery_limit: number;
  usage: ProjectUsage | null;
  created_at: string;
  updated_at: string;
  current_user_role: ProjectMembershipRole | null;
};

export type ProjectMembership = {
  id: string;
  role: ProjectMembershipRole;
  user: UserProfile;
};

export type InvitedUserSummary = {
  id: string;
  first_name: string;
  last_name: string;
};

export type InvitationProject = {
  id: string;
  name: string;
};

export type ProjectInvitation = {
  id: string;
  role: "maintainer";
  status: "pending" | "accepted" | "cancelled";
  created_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
  project: InvitationProject;
  invited_by: InvitedUserSummary;
  recipient: InvitedUserSummary;
};
