import type { IngestRejectionReason } from "../../types/ingestRejection";
import Badge from "../ui/Badge";

type IngestRejectionReasonBadgeProps = {
  reason: IngestRejectionReason;
};

type ReasonPresentation = {
  label: string;
  tone: "amber" | "purple";
};

const REASON_PRESENTATION: Record<IngestRejectionReason, ReasonPresentation> = {
  queue_capacity_exceeded: { label: "Queue capacity exceeded", tone: "amber" },
  monthly_delivery_limit_exceeded: { label: "Monthly delivery limit", tone: "purple" },
};

function IngestRejectionReasonBadge({ reason }: IngestRejectionReasonBadgeProps) {
  const presentation = REASON_PRESENTATION[reason];

  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}

export default IngestRejectionReasonBadge;
