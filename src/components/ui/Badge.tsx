import type { ReactNode } from "react";

type BadgeTone = "green" | "purple" | "amber" | "red" | "blue" | "neutral";

type BadgeProps = {
  tone: BadgeTone;
  dot?: boolean;
  children: ReactNode;
};

const TONE_STYLES: Record<BadgeTone, string> = {
  green: "bg-[#EAF5EE] text-[#23613F]",
  purple: "bg-[#EFEAF9] text-[#6D4AA8]",
  amber: "bg-[#FBF1E4] text-[#9A6B1F]",
  red: "bg-[#FBEEEE] text-[#B42318]",
  blue: "bg-[#E8F1FB] text-[#2563A8]",
  neutral: "bg-[#EFF5F1] text-[#53665A]",
};

const DOT_STYLES: Record<BadgeTone, string> = {
  green: "bg-[#43AD61]",
  purple: "bg-[#7C57C9]",
  amber: "bg-[#C0891F]",
  red: "bg-[#D92D20]",
  blue: "bg-[#2563A8]",
  neutral: "bg-[#8A9990]",
};

function Badge({ tone, dot = false, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${TONE_STYLES[tone]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]}`} />}
      {children}
    </span>
  );
}

export default Badge;
