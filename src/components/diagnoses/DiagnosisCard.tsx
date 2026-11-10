import { useEffect, useId, useRef, useState } from "react";
import { createEndpointDiagnosis, getLatestEndpointDiagnosis } from "../../lib/diagnosisApi";
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
  const [latestError, setLatestError] = useState("");
  const postedRef = useRef(false);
  const shouldFocusResult = useRef(false);
  const shouldFocusError = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      const result = await getLatestEndpointDiagnosis(projectId, endpointId);

      if (cancelled || postedRef.current) return;

      if (!result.ok) {
        if (result.status === 404 || result.status === 403) {
          setUnavailable(true);
        } else {
          setLatestError("Latest saved analysis could not be loaded.");
        }
        return;
      }

      if (result.data) setDiagnosis(result.data);
    }

    loadLatest();

    return () => {
      cancelled = true;
    };
  }, [projectId, endpointId]);

  useEffect(() => {
    if (diagnosis && shouldFocusResult.current) {
      resultRef.current?.focus();
      shouldFocusResult.current = false;
    }
  }, [diagnosis]);

  useEffect(() => {
    if ((error || unavailable) && shouldFocusError.current) {
      errorRef.current?.focus();
      shouldFocusError.current = false;
    }
  }, [error, unavailable]);

  async function runDiagnosis() {
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setConfirming(false);
    setLoading(true);
    setError("");
    setUnavailable(false);
    setLatestError("");

    const result = await createEndpointDiagnosis(projectId, endpointId);

    requestInFlight.current = false;
    setLoading(false);

    if (!result.ok) {
      setDiagnosis(null);
      shouldFocusError.current = true;
      setUnavailable(result.status === 404 || result.status === 403);
      setError(result.error);
      return;
    }

    postedRef.current = true;
    shouldFocusResult.current = true;
    setDiagnosis(result.data);
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading}
      className="mt-6 rounded-[18px] border border-[#DDD4F3] bg-[#FAF8FE] p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6DDF8] text-[#5B47A6]"
          >
            <SparkIcon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#E6DDF8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[2px] text-[#5B47A6]">
                AI
              </span>
              <h2 id={titleId} className="text-sm font-semibold tracking-tight text-[#1F2A24]">
                AI failure diagnosis
              </h2>
            </div>

            <p className="mt-1 text-sm font-medium text-[#53665A]">
              Find the likely cause from recent failed attempts.
            </p>
          </div>
        </div>

        {!diagnosis && (
          <Button
            variant="primary"
            size="md"
            className="w-full shrink-0 sm:w-auto"
            disabled={loading}
            onClick={() => setConfirming(true)}
          >
            Analyze failures
          </Button>
        )}
      </div>

      <div aria-live="polite">
        {loading && (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#53665A]">
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DDD4F3] border-t-[#5B47A6]"
            />
            Analyzing recent failed attempts…
          </p>
        )}

        {diagnosis && (
          <div ref={resultRef} tabIndex={-1} className="outline-none">
            <DiagnosisResultCard
              diagnosis={diagnosis}
              loading={loading}
              onAnalyzeAgain={() => setConfirming(true)}
            />
          </div>
        )}
      </div>

      {!unavailable && !diagnosis && latestError && (
        <p className="mt-4 text-sm font-medium text-[#8A9990]">{latestError}</p>
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

      {confirming && <DiagnosisConfirmModal onConfirm={runDiagnosis} onCancel={() => setConfirming(false)} />}
    </section>
  );
}

export default DiagnosisCard;
