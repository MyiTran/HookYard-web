import type { IconProps } from "./iconProps";

function HelpCircleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 2-2.3 2-2.3 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export default HelpCircleIcon;
