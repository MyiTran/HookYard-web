import { formatDateTime } from "../../lib/dateFormat";
import { formatDuration } from "../../lib/durationFormat";
import type { EndpointCircuit, EndpointCircuitProbe } from "../../types/endpoint";
import HttpStatusBadge from "../deliveries/HttpStatusBadge";
import Badge from "../ui/Badge";

type ReceiverChecksSectionProps = {
  circuit: EndpointCircuit;
};

type CheckTone = "green" | "red" | "blue" | "neutral";

type CheckSummary = {
  label: string;
  tone: CheckTone;
};

const SECTION_CLASS =
  "mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]";
const LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

function isSuccessfulResponse(status: number | null): boolean {
  return status !== null && status >= 200 && status < 300;
}

function checkSummary(probe: EndpointCircuitProbe): CheckSummary {
  if (probe.status === "pending" || !probe.completed_at) return { label: "Check in progress", tone: "blue" };

  if (isSuccessfulResponse(probe.response_status)) return { label: "Healthy", tone: "green" };

  return { label: "Failed", tone: "red" };
}

function checkTimestamp(probe: EndpointCircuitProbe): string {
  const prefix = probe.completed_at ? "Checked" : "Started";
  const timestamp = formatDateTime(probe.completed_at ?? probe.started_at);

  return timestamp ? `${prefix} ${timestamp}` : prefix;
}

function ReceiverChecksSection({ circuit }: ReceiverChecksSectionProps) {
  const probe = circuit.last_probe ?? null;

  if (!probe) {
    return (
      <section className={SECTION_CLASS}>
        <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Receiver checks</h2>
        <p className="mt-1 text-sm font-medium text-[#53665A]">No receiver checks have run yet.</p>
      </section>
    );
  }

  const summary = checkSummary(probe);
  const nextCheck = circuit.state === "circuit_open" ? circuit.next_probe_at : null;

  return (
    <section className={SECTION_CLASS}>
      <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Receiver checks</h2>

      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className={LABEL_CLASS}>Latest receiver check</dt>
          <dd className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={summary.tone} dot>
              {summary.label}
            </Badge>
            {probe.completed_at && (
              <HttpStatusBadge status={probe.response_status} errorType={probe.error_type} />
            )}
          </dd>
          <p className="mt-1 text-xs font-medium text-[#8A9990]">{checkTimestamp(probe)}</p>
          {probe.duration_ms !== null && (
            <p className="mt-0.5 text-xs font-medium text-[#8A9990]">Duration {formatDuration(probe.duration_ms)}</p>
          )}
        </div>

        {nextCheck && (
          <div className="min-w-0">
            <dt className={LABEL_CLASS}>Next receiver check</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#1F2A24]">{formatDateTime(nextCheck)}</dd>
            <p className="mt-1 text-xs font-medium text-[#8A9990]">
              Checks run after this time when the delivery worker next scans for due work.
            </p>
          </div>
        )}

        {circuit.state === "disabled" && (
          <div className="min-w-0">
            <dt className={LABEL_CLASS}>What happens next</dt>
            <dd className="mt-1.5 text-sm font-medium text-[#53665A]">
              Automatic delivery is paused until a project owner re-enables this endpoint.
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default ReceiverChecksSection;
