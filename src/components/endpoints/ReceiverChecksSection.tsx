import { formatDateTime } from "../../lib/dateFormat";
import { formatDuration } from "../../lib/durationFormat";
import type { EndpointCircuit, EndpointCircuitProbe } from "../../types/endpoint";
import HttpStatusBadge from "../deliveries/HttpStatusBadge";
import Badge from "../ui/Badge";
import EndpointCircuitBadge from "./EndpointCircuitBadge";

type ReceiverChecksSectionProps = {
  circuit: EndpointCircuit;
};

const CIRCUIT_CONTEXT: Record<EndpointCircuit["state"], string> = {
  enabled: "Normal delivery is active.",
  circuit_open: "Business deliveries are held while HookYard checks the receiver.",
  disabled: "Automatic delivery is stopped until an owner re-enables it.",
};

type CheckTone = "green" | "red" | "blue" | "neutral";

type CheckSummary = {
  label: string;
  tone: CheckTone;
};

function isSuccessfulResponse(status: number | null): boolean {
  return status !== null && status >= 200 && status < 300;
}

function checkSummary(probe: EndpointCircuitProbe | null): CheckSummary {
  if (!probe || probe.status === "pending" || !probe.completed_at) {
    return probe ? { label: "Check in progress", tone: "blue" } : { label: "No receiver checks yet", tone: "neutral" };
  }

  if (isSuccessfulResponse(probe.response_status)) {
    return { label: "Healthy", tone: "green" };
  }

  return { label: "Failed", tone: "red" };
}

function checkTimestamp(probe: EndpointCircuitProbe): string {
  const prefix = probe.completed_at ? "Checked" : "Started";
  const timestamp = formatDateTime(probe.completed_at ?? probe.started_at);

  return timestamp ? `${prefix} ${timestamp}` : prefix;
}

function ReceiverChecksSection({ circuit }: ReceiverChecksSectionProps) {
  const probe = circuit.last_probe ?? null;
  const summary = checkSummary(probe);
  const nextCheck = circuit.state === "circuit_open" ? circuit.next_probe_at : null;
  const protectionDeadline = circuit.state === "enabled" ? null : circuit.disable_window_ends_at;

  return (
    <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Receiver checks</h2>
      <p className="mt-1 text-xs font-medium text-[#8A9990]">
        Automatic health checks run while delivery protection is active.
      </p>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
            Latest receiver check
          </dt>
          <dd className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={summary.tone} dot>
                {summary.label}
              </Badge>
              {probe && probe.completed_at && (
                <HttpStatusBadge status={probe.response_status} errorType={probe.error_type} />
              )}
            </div>

            <p className="mt-2 break-words text-xs font-medium text-[#53665A]">
              {probe ? checkTimestamp(probe) : "Checks will appear after HookYard tries the receiver."}
            </p>

            {probe && probe.duration_ms !== null && (
              <p className="mt-1 text-xs font-medium text-[#8A9990]">Duration {formatDuration(probe.duration_ms)}</p>
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
            Circuit protection
          </dt>
          <dd className="mt-2">
            <EndpointCircuitBadge circuit={circuit} showEnabled />
            <p className="mt-2 text-xs font-medium text-[#53665A]">{CIRCUIT_CONTEXT[circuit.state]}</p>
          </dd>
        </div>

        {nextCheck && (
          <div className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
              Next receiver check
            </dt>
            <dd className="mt-2 break-words text-sm font-semibold text-[#1F2A24]">{formatDateTime(nextCheck)}</dd>
            <p className="mt-2 text-xs font-medium text-[#53665A]">
              Checks run after this time when the delivery worker next scans for due work.
            </p>
          </div>
        )}

        {protectionDeadline && (
          <div className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
              {circuit.state === "disabled" ? "Protection window ended" : "Protection window ends"}
            </dt>
            <dd className="mt-2 break-words text-sm font-semibold text-[#1F2A24]">
              {formatDateTime(protectionDeadline)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default ReceiverChecksSection;
