import type { IconProps } from "./iconProps";

function PlugIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5v5" />
    </svg>
  );
}

export default PlugIcon;
