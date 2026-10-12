import type { IconProps } from "./iconProps";

function RefreshIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12a8 8 0 1 0 3-6" />
      <path d="M4 4v6h6" />
    </svg>
  );
}

export default RefreshIcon;
