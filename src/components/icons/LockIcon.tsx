import type { IconProps } from "./iconProps";

function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.4" />
      <path d="M12 14.2v2.4" />
    </svg>
  );
}

export default LockIcon;
