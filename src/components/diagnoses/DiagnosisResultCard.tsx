import { formatDateTime } from "../../lib/dateFormat";
import { diagnosisPresentation, diagnosisSourceBadge } from "../../lib/diagnosisPresentation";
import type { EndpointDiagnosis } from "../../types/diagnosis";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

type DiagnosisResultCardProps = {
  diagnosis: EndpointDiagnosis;
  loading?: boolean;
  onAnalyzeAgain: () => void;
};

const ANALYZED_EVIDENCE =
  "Recent redacted response status, headers, body excerpts, duration and transport failures.";

function DiagnosisResultCard({ diagnosis, loading = false, onAnalyzeAgain }: DiagnosisResultCardProps) {
  const presentation = diagnosisPresentation(diagnosis.label);
  const sourceBadge = diagnosisSourceBadge(diagnosis.source);
  const { Icon, styles } = presentation;
  const analyzedAt = formatDateTime(diagnosis.created_at);

  return (
    <div className={`mt-4 rounded-2xl border p-5 ${styles.surface} ${styles.border}`}>
      <Badge tone={sourceBadge.tone} dot>
        {sourceBadge.label}
      </Badge>

      <h3 className="mt-3 flex items-start gap-2 text-base font-semibold tracking-tight text-[#1F2A24]">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">{presentation.title}</span>
      </h3>

      <div className="mt-3 rounded-xl border border-[#E4EBE6] bg-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Suggested action</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#1F2A24]">{diagnosis.suggested_action}</p>
      </div>

      <p className="mt-3 text-xs font-medium text-[#8A9990]">
        {analyzedAt ? `Analyzed ${analyzedAt}` : "Analyzed just now"}
      </p>

      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-xs font-semibold text-[#23613F] transition hover:text-[#173D28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30">
          <ChevronRightIcon className="h-3 w-3 transition group-open:rotate-90" />
          What was analyzed?
        </summary>

        <p className="mt-1.5 text-xs font-medium leading-5 text-[#53665A]">{ANALYZED_EVIDENCE}</p>
      </details>

      <div className="mt-4">
        <Button
          variant="secondary"
          size="md"
          className="w-full sm:w-auto"
          disabled={loading}
          onClick={onAnalyzeAgain}
        >
          Analyze again
        </Button>
      </div>
    </div>
  );
}

export default DiagnosisResultCard;
