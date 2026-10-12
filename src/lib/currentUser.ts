import type { CurrentUser, UserProfile, UserRole } from "../types/user";

function normalizeRole(role: UserProfile["role"]): UserRole | null {
  return role === "admin" || role === "support" ? role : null;
}

export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function toCurrentUser(profile: UserProfile): CurrentUser {
  return {
    id: profile.id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    name: formatUserName(profile.first_name, profile.last_name),
    role: normalizeRole(profile.role),
  };
}
