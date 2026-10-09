import type { CurrentUser, UserProfile, UserRole } from "../types/user";

function normalizeRole(role: UserProfile["role"]): UserRole | null {
  return role === "admin" || role === "support" ? role : null;
}

export function toCurrentUser(profile: UserProfile): CurrentUser {
  return {
    id: profile.id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    role: normalizeRole(profile.role),
  };
}
