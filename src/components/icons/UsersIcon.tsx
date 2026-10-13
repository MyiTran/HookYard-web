import type { IconProps } from "./iconProps";

function UsersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M17 14c2.5.5 4 2.5 4 5" />
    </svg>
  );
}

export default UsersIcon;
