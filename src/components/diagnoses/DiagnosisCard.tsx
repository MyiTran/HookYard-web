import { useEffect, useId, useRef, useState } from "react";
import { createEndpointDiagnosis } from "../../lib/diagnosisApi";
import type { EndpointDiagnosis } from "../../types/diagnosis";
import SparkIcon from "../icons/SparkIcon";
import Button from "../ui/Button";
import DiagnosisConfirmModal from "./DiagnosisConfirmModal";
import DiagnosisResultCard from "./DiagnosisResultCard";

type DiagnosisCardProps = {
  projectId: string;
  endpointId: string;
};

const UNAVAILABLE_MESSAGE = "This endpoint does not exist or you do not have access to it.";

function DiagnosisCard({ projectId, endpointId }: DiagnosisCardProps) {
  const titleId = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const requestInFlight = useRef(false);

  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<EndpointDiagnosis | null>(null);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (diagnosis) resultRef.current?.focus();
  }, [diagnosis]);

  useEffect(() => {
    if (error || unavailable) errorRef.current?.focus();
  }, [error, unavailable]);

  async function runDiagnosis() {
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setConfirming(false);
    setLoading(true);
    setError("");
    setUnavailable(false);

    const result = await createEndpointDiagnosis(projectId, endpointId);

    requestInFlight.current = false;
    setLoading(false);

    if (!result.ok) {
      setDiagnosis(null);
      setUnavailable(result.status === 404 || result.status === 403);
      setError(result.error);
      return;
    }

    setDiagnosis(result.data);
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading}
      className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4EFE7] text-[#23613F]"
          >
            <SparkIcon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <h2 id={titleId} className="text-sm font-semibold tracking-tight text-[#1F2A24]">
              Diagnose delivery failures
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-[#53665A]">
              Analyze recent failed attempts to identify a likely cause. Diagnosis does not send or change
              deliveries.
            </p>
          </div>
        </div>

        <Button
          variant={diagnosis ? "secondary" : "primary"}
          size="md"
          className="shrink-0"
          disabled={loading}
          onClick={() => setConfirming(true)}
        >
          {diagnosis ? "Analyze again" : "Analyze recent failures"}
        </Button>
      </div>

      {loading && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-[#53665A]">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C9DACE] border-t-[#23613F]"
          />
          Reviewing recent redacted attempts…
        </p>
      )}

      {unavailable && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className="mt-4 rounded-xl border border-[#D8E3DB] bg-[#F5F8F6] px-4 py-3 outline-none"
        >
          <p className="text-sm font-semibold text-[#1F2A24]">Diagnosis unavailable</p>
          <p className="mt-1 text-sm font-medium text-[#53665A]">{UNAVAILABLE_MESSAGE}</p>
        </div>
      )}

      {!unavailable && error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm font-medium text-[#B42318] outline-none"
        >
          {error}
        </div>
      )}

      {diagnosis && (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          <DiagnosisResultCard diagnosis={diagnosis} />
        </div>
      )}

      <p className="mt-4 text-xs font-medium text-[#8A9990]">
        Analysis only. HookYard never sends a webhook or changes delivery state from this card.
      </p>

      {confirming && <DiagnosisConfirmModal onConfirm={runDiagnosis} onCancel={() => setConfirming(false)} />}
    </section>
  );
}

export default DiagnosisCard;
