import type { IconProps } from "./iconProps";

function SearchAlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M11 8v3M11 14h.01" />
    </svg>
  );
}

export default SearchAlertIcon;
