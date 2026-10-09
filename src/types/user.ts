export type UserRole = "admin" | "support";

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
