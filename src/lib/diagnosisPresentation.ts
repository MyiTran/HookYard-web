import type { ComponentType } from "react";
import ActivityIcon from "../components/icons/ActivityIcon";
import AlertTriangleIcon from "../components/icons/AlertTriangleIcon";
import BoltIcon from "../components/icons/BoltIcon";
import HelpCircleIcon from "../components/icons/HelpCircleIcon";
import LockIcon from "../components/icons/LockIcon";
import PlugIcon from "../components/icons/PlugIcon";
import SearchAlertIcon from "../components/icons/SearchAlertIcon";
import ShieldIcon from "../components/icons/ShieldIcon";
import type { IconProps } from "../components/icons/iconProps";
import type { BadgeTone } from "../components/ui/Badge";
import type { DiagnosisLabel, DiagnosisSource } from "../types/diagnosis";

type DiagnosisAccent = "violet" | "amber" | "purple" | "blue" | "orange" | "yellow" | "red" | "neutral";

type DiagnosisAccentStyles = {
  surface: string;
  border: string;
  iconWrap: string;
  titleText: string;
};

type DiagnosisBase = {
  accent: DiagnosisAccent;
  title: string;
  Icon: ComponentType<IconProps>;
};

export type DiagnosisPresentation = DiagnosisBase & {
  styles: DiagnosisAccentStyles;
};

export type DiagnosisSourceBadge = {
  label: string;
  tone: BadgeTone;
};

const ACCENT_STYLES: Record<DiagnosisAccent, DiagnosisAccentStyles> = {
  violet: {
    surface: "bg-[#F5F1FC]",
    border: "border-[#DDD4F3]",
    iconWrap: "bg-[#E6DDF8] text-[#5B47A6]",
    titleText: "text-[#4B3A8F]",
  },
  amber: {
    surface: "bg-[#FBF7EC]",
    border: "border-[#E8D5B5]",
    iconWrap: "bg-[#F3E3C4] text-[#8A5D14]",
    titleText: "text-[#8A5D14]",
  },
  purple: {
    surface: "bg-[#F6F2FC]",
    border: "border-[#DED5F2]",
    iconWrap: "bg-[#EBE3F9] text-[#6D4AA8]",
    titleText: "text-[#5F3F94]",
  },
  blue: {
    surface: "bg-[#F2F7FD]",
    border: "border-[#CFE0F5]",
    iconWrap: "bg-[#DCEAFA] text-[#2563A8]",
    titleText: "text-[#215A96]",
  },
  orange: {
    surface: "bg-[#FDF5ED]",
    border: "border-[#F0D6C1]",
    iconWrap: "bg-[#FBE5D4] text-[#A85417]",
    titleText: "text-[#964A13]",
  },
  yellow: {
    surface: "bg-[#FCF9E9]",
    border: "border-[#EADFB6]",
    iconWrap: "bg-[#F7EFC9] text-[#8A6B12]",
    titleText: "text-[#7A5E0F]",
  },
  red: {
    surface: "bg-[#FCF3F3]",
    border: "border-[#F1D5D5]",
    iconWrap: "bg-[#F7D9D9] text-[#B42318]",
    titleText: "text-[#9D1E14]",
  },
  neutral: {
    surface: "bg-[#F5F8F6]",
    border: "border-[#D8E3DB]",
    iconWrap: "bg-[#E6EDE8] text-[#53665A]",
    titleText: "text-[#405348]",
  },
};

const PRESENTATIONS: Record<DiagnosisLabel, DiagnosisBase> = {
  signature_mismatch: {
    accent: "violet",
    title: "Webhook signature could not be verified",
    Icon: ShieldIcon,
  },
  auth_expired: {
    accent: "amber",
    title: "Endpoint authentication was rejected",
    Icon: LockIcon,
  },
  endpoint_moved: {
    accent: "purple",
    title: "Endpoint may have moved",
    Icon: PlugIcon,
  },
  handler_timeout: {
    accent: "blue",
    title: "Receiver took too long to respond",
    Icon: ActivityIcon,
  },
  payload_rejected: {
    accent: "orange",
    title: "Receiver rejected the payload",
    Icon: AlertTriangleIcon,
  },
  rate_limited: {
    accent: "yellow",
    title: "Receiver is rate limiting requests",
    Icon: BoltIcon,
  },
  tls_failure: {
    accent: "red",
    title: "Secure connection to receiver failed",
    Icon: AlertTriangleIcon,
  },
  endpoint_gone: {
    accent: "purple",
    title: "Endpoint is no longer available",
    Icon: SearchAlertIcon,
  },
  unknown: {
    accent: "neutral",
    title: "Cause could not be determined",
    Icon: HelpCircleIcon,
  },
};

const PRESENTATION_BY_LABEL = new Map<string, DiagnosisBase>(Object.entries(PRESENTATIONS));

const SOURCE_BADGES: Record<DiagnosisSource, DiagnosisSourceBadge> = {
  ai: { label: "AI analysis", tone: "purple" },
  fallback: { label: "Rule-based fallback", tone: "neutral" },
};

export function diagnosisPresentation(label: string): DiagnosisPresentation {
  const base = PRESENTATION_BY_LABEL.get(label) ?? PRESENTATIONS.unknown;

  return { ...base, styles: ACCENT_STYLES[base.accent] };
}

export function diagnosisSourceBadge(source: DiagnosisSource): DiagnosisSourceBadge {
  return SOURCE_BADGES[source] ?? SOURCE_BADGES.fallback;
}
