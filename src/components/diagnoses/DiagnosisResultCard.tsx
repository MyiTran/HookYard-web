import { diagnosisPresentation, diagnosisSourceBadge } from "../../lib/diagnosisPresentation";
import { formatDateTime } from "../../lib/dateFormat";
import type { EndpointDiagnosis } from "../../types/diagnosis";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import Badge from "../ui/Badge";

type DiagnosisResultCardProps = {
  diagnosis: EndpointDiagnosis;
};

const ANALYZED_EVIDENCE =
  "Recent redacted response status, headers, body excerpts, duration and transport failures.";

function DiagnosisResultCard({ diagnosis }: DiagnosisResultCardProps) {
  const presentation = diagnosisPresentation(diagnosis.label);
  const sourceBadge = diagnosisSourceBadge(diagnosis.source);
  const { Icon, styles } = presentation;
  const analyzedAt = formatDateTime(diagnosis.created_at);

  return (
    <div className={`mt-4 rounded-2xl border p-5 ${styles.surface} ${styles.border}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
          >
            <Icon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <h3 className={`text-sm font-semibold tracking-tight ${styles.titleText}`}>{presentation.title}</h3>
            <p className="mt-1 text-xs font-medium text-[#53665A]">
              {analyzedAt ? `Analyzed ${analyzedAt}` : "Analyzed just now"}
            </p>
          </div>
        </div>

        <Badge tone={sourceBadge.tone}>{sourceBadge.label}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-[#E4EBE6] bg-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Suggested action</p>
        <p className="mt-1 text-sm font-medium leading-6 text-[#1F2A24]">{diagnosis.suggested_action}</p>
      </div>

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg py-1 text-xs font-semibold text-[#23613F] transition hover:text-[#173D28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30">
          <ChevronRightIcon className="h-3 w-3 transition group-open:rotate-90" />
          What was analyzed?
        </summary>

        <p className="mt-1.5 text-xs font-medium leading-5 text-[#53665A]">{ANALYZED_EVIDENCE}</p>
      </details>
    </div>
  );
}

export default DiagnosisResultCard;
