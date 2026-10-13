export const USER_ROLES = ["admin", "support"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

export type CurrentUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: UserRole | null;
};

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_confirmed?: boolean;
  role: UserRole | null;
  avatar_url?: string | null;
};
