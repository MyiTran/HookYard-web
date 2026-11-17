import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterDateRange from "../filters/FilterDateRange";
import FilterSelect from "../filters/FilterSelect";
import { dateRangeLabel } from "../../lib/dateFormat";
import { readDateParam } from "../../lib/dateRange";
import { readDeliverySearchKind } from "../../lib/deliveryApi";
import { getEndpoints } from "../../lib/endpointApi";
import { getProjects } from "../../lib/projectApi";
import {
  createBulkReplay,
  getReplayRun,
  previewReplay,
  REPLAY_HELD_POLL_INTERVAL_MS,
  REPLAY_HELD_POLL_MAX_WAIT_MS,
  REPLAY_POLL_INTERVAL_MS,
} from "../../lib/replayApi";
import { isReplayRunWaitingForRecovery } from "../../lib/replayStatus";
import {
  FALLBACK_MAX_ITEMS_PER_RUN,
  readReplayLimitFailure,
  replayItemLimit,
  replayLimitWarning,
  type ReplayLimit,
} from "../../lib/replayLimit";
import { bulkReplayQuotaMessage, readReplayQuotaError } from "../../lib/replayQuota";
import type { DeliveryOrder } from "../../types/delivery";
import type { Endpoint } from "../../types/endpoint";
import type { Project } from "../../types/project";
import type { ReplayPreview, ReplayQuotaError, ReplayRun } from "../../types/replay";
import Button from "../ui/Button";
import ContextualHelp from "../ui/ContextualHelp";
import BulkRecoveryConfirmModal, { type RecoveryScopeItem } from "./BulkRecoveryConfirmModal";
import ReplayPreviewCard from "./ReplayPreviewCard";
import ReplayRunPanel from "./ReplayRunPanel";

const DEFAULT_ORDER: DeliveryOrder = "created_desc";
const ORDER_VALUES: DeliveryOrder[] = ["created_desc", "created_asc"];

const ORDER_OPTIONS: { value: DeliveryOrder; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

function readOrder(value: string | null): DeliveryOrder {
  return ORDER_VALUES.includes(value as DeliveryOrder) ? (value as DeliveryOrder) : DEFAULT_ORDER;
}

const TEXT_INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-[#C9DACE] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

const FIELD_LABEL = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

const SEARCH_LABELS = {
  message: "Message ID",
  request: "Request ID",
  text: "Search",
};

function isEndpointPaused(endpoint: Endpoint): boolean {
  return endpoint.active === false;
}

function GroupRecovery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const projectId = searchParams.get("project_id") ?? "";
  const endpointId = searchParams.get("endpoint_id") ?? "";
  const search = searchParams.get("q") ?? "";
  const eventType = searchParams.get("event_type") ?? "";
  const from = readDateParam(searchParams.get("from"));
  const to = readDateParam(searchParams.get("to"));
  const order = readOrder(searchParams.get("order"));

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [endpointsProjectId, setEndpointsProjectId] = useState(projectId);

  if (projectId !== endpointsProjectId) {
    setEndpointsProjectId(projectId);
    setEndpoints([]);
  }

  const [preview, setPreview] = useState<ReplayPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [quotaError, setQuotaError] = useState<ReplayQuotaError | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [limitFailure, setLimitFailure] = useState<ReplayLimit | null>(null);

  const [run, setRun] = useState<ReplayRun | null>(null);
  const [pollError, setPollError] = useState("");
  const [pollingPaused, setPollingPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filterSignature = `${projectId}|${endpointId}|${search}|${eventType}|${from}|${to}|${order}`;
  const [clearedFilterSignature, setClearedFilterSignature] = useState(filterSignature);

  if (filterSignature !== clearedFilterSignature) {
    setClearedFilterSignature(filterSignature);
    setPreview(null);
    setPreviewError("");
    setQuotaError(null);
    setStartError("");
    setLimitFailure(null);
    setConfirmOpen(false);
    setRun(null);
    setPollError("");
    setPollingPaused(false);
    setRefreshing(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getProjects({ perPage: 100 });

      if (cancelled) return;

      if (!result.ok) {
        setProjectsError(result.error);
        setProjectsLoading(false);
        return;
      }

      setProjects(result.data.data);
      setProjectsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    async function load() {
      const result = await getEndpoints({ projectId, order: "name_asc", perPage: 100 });

      if (cancelled || !result.ok) return;

      setEndpoints(result.data.data);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const runId = run?.id ?? "";
  const runProjectId = run?.project_id ?? "";
  const runStatus = run?.status;
  const waitingForRecovery = run ? isReplayRunWaitingForRecovery(run) : false;

  useEffect(() => {
    if (!runId || runStatus === "completed" || pollingPaused) return;

    let cancelled = false;

    async function refreshRun() {
      const result = await getReplayRun(runProjectId, runId);

      if (cancelled) return;

      if (!result.ok) {
        setPollError(result.error);
        return;
      }

      setPollError("");
      setRun(result.data);
    }

    const interval = window.setInterval(
      refreshRun,
      waitingForRecovery ? REPLAY_HELD_POLL_INTERVAL_MS : REPLAY_POLL_INTERVAL_MS,
    );

    const pauseTimer = waitingForRecovery
      ? window.setTimeout(() => {
          if (!cancelled) setPollingPaused(true);
        }, REPLAY_HELD_POLL_MAX_WAIT_MS)
      : null;

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      if (pauseTimer) window.clearTimeout(pauseTimer);
    };
  }, [runId, runProjectId, runStatus, waitingForRecovery, pollingPaused]);

  async function handleRefreshRun() {
    if (!run) return;

    setRefreshing(true);

    const result = await getReplayRun(run.project_id, run.id);

    setRefreshing(false);

    if (!result.ok) {
      setPollError(result.error);
      return;
    }

    setPollError("");
    setRun(result.data);
    setPollingPaused(false);
  }

  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const selectedEndpoint = endpoints.find((endpoint) => endpoint.id === endpointId) ?? null;
  const planLocked = selectedProject !== null && selectedProject.plan !== "pro";
  const endpointPaused = selectedEndpoint !== null && isEndpointPaused(selectedEndpoint);
  const endpointRecovering = !endpointPaused && selectedEndpoint?.circuit?.state === "circuit_open";
  const previewLimit = preview ? replayItemLimit(preview) : FALLBACK_MAX_ITEMS_PER_RUN;
  const limitWarning = limitFailure ?? (preview ? replayLimitWarning(preview) : null);
  const quotaMessage = quotaError ? bulkReplayQuotaMessage(quotaError, preview?.eligible_count ?? null) : null;

  function recoveryScope(): RecoveryScopeItem[] {
    const items: RecoveryScopeItem[] = [];

    if (selectedProject) items.push({ label: "Project", value: selectedProject.name });
    if (selectedEndpoint) items.push({ label: "Endpoint", value: selectedEndpoint.name });

    const trimmedEventType = eventType.trim();
    if (trimmedEventType) items.push({ label: "Event type", value: trimmedEventType });

    const dates = dateRangeLabel(from, to);
    if (dates) items.push({ label: "Date range", value: dates });

    const searchTerm = search.trim();
    if (searchTerm) {
      items.push({ label: SEARCH_LABELS[readDeliverySearchKind(searchTerm)], value: searchTerm });
    }

    return items;
  }

  function replayFilters() {
    return {
      q: search.trim() || undefined,
      endpointId: endpointId || undefined,
      eventType: eventType.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
      order,
    };
  }

  function resetPreview() {
    setPreview(null);
    setPreviewError("");
    setQuotaError(null);
    setStartError("");
    setLimitFailure(null);
    setConfirmOpen(false);
  }

  function patchSearchParams(patch: Record<string, string>) {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);

      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }

      return params;
    });
  }

  function handleProjectChange(value: string) {
    patchSearchParams({ project_id: value, endpoint_id: "" });
    setEndpoints([]);
    setRun(null);
    setPollError("");
    setPollingPaused(false);
    resetPreview();
  }

  function handleEndpointChange(value: string) {
    patchSearchParams({ endpoint_id: value });
    resetPreview();
  }

  function handleSearchChange(value: string) {
    patchSearchParams({ q: value });
    resetPreview();
  }

  function handleEventTypeChange(value: string) {
    patchSearchParams({ event_type: value });
    resetPreview();
  }

  function handleFromChange(value: string) {
    patchSearchParams({ from: value });
    resetPreview();
  }

  function handleToChange(value: string) {
    patchSearchParams({ to: value });
    resetPreview();
  }

  function handleOrderChange(value: string) {
    patchSearchParams({ order: value === DEFAULT_ORDER ? "" : value });
    resetPreview();
  }

  function handleReset() {
    patchSearchParams({
      project_id: "",
      endpoint_id: "",
      q: "",
      event_type: "",
      from: "",
      to: "",
      order: "",
    });
    setEndpoints([]);
    setRun(null);
    setPollError("");
    setPollingPaused(false);
    resetPreview();
  }

  async function handlePreview() {
    if (!projectId) return;

    setPreviewing(true);
    setPreviewError("");
    setQuotaError(null);
    setStartError("");
    setLimitFailure(null);

    const result = await previewReplay(projectId, replayFilters());

    setPreviewing(false);

    if (!result.ok) {
      const nextQuotaError = readReplayQuotaError(result);

      if (nextQuotaError) {
        setPreview(null);
        setQuotaError(nextQuotaError);
        return;
      }

      setPreview(null);
      setPreviewError(result.error);
      return;
    }

    setPreview(result.data);
  }

  async function handleStart() {
    if (!projectId || limitWarning) return;

    setStarting(true);
    setStartError("");
    setQuotaError(null);
    setLimitFailure(null);

    const result = await createBulkReplay(projectId, replayFilters());

    setStarting(false);
    setConfirmOpen(false);

    if (!result.ok) {
      const nextQuotaError = readReplayQuotaError(result);

      if (nextQuotaError) {
        setQuotaError(nextQuotaError);
        return;
      }

      const limit = readReplayLimitFailure(result.error, result.data, {
        eligible: preview?.eligible_count ?? 0,
        limit: previewLimit,
      });

      if (limit) {
        setLimitFailure(limit);
        return;
      }

      setStartError(result.error);
      return;
    }

    setPreview(null);
    setLimitFailure(null);
    setRun(result.data);
    setPollError("");
    setPollingPaused(false);
    setRefreshing(false);
  }

  const projectOptions = [
    { value: "", label: "Select a project" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  const endpointOptions = [
    { value: "", label: "All endpoints" },
    ...endpoints.map((endpoint) => ({ value: endpoint.id, label: endpoint.name })),
  ];

  const hasFilters =
    projectId !== "" ||
    endpointId !== "" ||
    search !== "" ||
    eventType !== "" ||
    from !== "" ||
    to !== "" ||
    order !== DEFAULT_ORDER;

  return (
    <div>
      <p className="text-xs font-medium text-[#53665A]">Filter deliveries, preview the matches, then confirm.</p>

      <div className="mt-1 flex items-center gap-1.5">
        <p className="text-xs font-medium text-[#8A9990]">Eligible failed deliveries only.</p>

        <ContextualHelp label="Eligibility details" title="Eligible deliveries">
          <p className="text-sm font-medium leading-relaxed text-[#53665A]">
            Paused, archived, disabled, held, and already-recovering deliveries are excluded.
          </p>
        </ContextualHelp>
      </div>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          handlePreview();
        }}
      >
        {projectsLoading ? (
          <p role="status" className="text-sm font-medium text-[#607267]">
            Loading projects...
          </p>
        ) : projectsError ? (
          <p className="text-sm font-medium text-[#B42318]">{projectsError}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm font-medium text-[#607267]">
            You do not have access to a project yet, so there are no deliveries to recover.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="min-w-0">
                <label htmlFor="groupRecoveryProject" className={FIELD_LABEL}>
                  Project
                </label>

                <FilterSelect
                  id="groupRecoveryProject"
                  value={projectId}
                  onChange={handleProjectChange}
                  options={projectOptions}
                  ariaLabel="Recovery project"
                  className="w-full"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="groupRecoveryEndpoint" className={FIELD_LABEL}>
                  Endpoint
                </label>

                <FilterSelect
                  id="groupRecoveryEndpoint"
                  value={endpointId}
                  onChange={handleEndpointChange}
                  options={endpointOptions}
                  ariaLabel="Filter recovery candidates by endpoint"
                  className="w-full"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="groupRecoveryEventType" className={FIELD_LABEL}>
                  Event type
                </label>

                <input
                  id="groupRecoveryEventType"
                  type="text"
                  value={eventType}
                  onChange={(event) => handleEventTypeChange(event.target.value)}
                  placeholder="Event type, e.g. order.created"
                  className={TEXT_INPUT_CLASS}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="groupRecoveryOrder" className={FIELD_LABEL}>
                  Order
                </label>

                <FilterSelect
                  id="groupRecoveryOrder"
                  value={order}
                  onChange={handleOrderChange}
                  options={ORDER_OPTIONS}
                  ariaLabel="Recovery candidate order"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="w-full min-w-0 sm:flex-1">
                <label htmlFor="groupRecoverySearch" className={FIELD_LABEL}>
                  Search
                </label>

                <input
                  id="groupRecoverySearch"
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Message ID, request ID, or text"
                  aria-label="Search Message ID, request ID, or delivery text"
                  className={`${TEXT_INPUT_CLASS} [&::-webkit-search-cancel-button]:appearance-none`}
                />
              </div>

              <FilterDateRange
                idPrefix="groupRecoveryRange"
                layout="row"
                from={from}
                to={to}
                onFromChange={handleFromChange}
                onToChange={handleToChange}
              />

              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="lg" loading={previewing} disabled={!projectId} aria-label="Preview recovery">
                  {previewing ? "Previewing..." : "Preview"}
                </Button>

                <ContextualHelp label="Bulk replay capacity" title="Recovery capacity" widthRem={28}>
                  <p className="text-sm font-medium leading-relaxed text-[#53665A]">
                    A single recovery can include up to 20,000 deliveries. For large recoveries, use a smaller date
                    range and run them in batches.
                  </p>
                </ContextualHelp>
              </div>

              <Button variant="secondary" size="lg" onClick={handleReset} disabled={!hasFilters} aria-label="Reset filters">
                Clear
              </Button>
            </div>

          </>
        )}
      </form>

      {quotaMessage && (
        <div role="alert" className="mt-4 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-5">
          <p className="text-sm font-medium text-[#B42318]">{quotaMessage.title}</p>

          {quotaMessage.context && (
            <p className="mt-1 text-xs font-medium text-[#8A9990]">{quotaMessage.context}</p>
          )}
        </div>
      )}

      {previewError && (
        <div className="mt-4 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-5">
          <p className="text-sm font-medium text-[#B42318]">{previewError}</p>
        </div>
      )}

      {startError && (
        <div className="mt-4 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-5">
          <p className="text-sm font-medium text-[#B42318]">{startError}</p>
        </div>
      )}

      {preview && (
        <div className="mt-6">
          <ReplayPreviewCard
            preview={preview}
            planLocked={planLocked}
            starting={starting}
            limitWarning={limitWarning}
            quotaBlocked={quotaError !== null}
            onStart={() => setConfirmOpen(true)}
          />
        </div>
      )}

      {run && (
        <div className="mt-6">
          <ReplayRunPanel
            run={run}
            waitingForRecovery={waitingForRecovery}
            pollingPaused={pollingPaused}
            refreshing={refreshing}
            pollError={pollError}
            onRefresh={handleRefreshRun}
          />
        </div>
      )}

      {confirmOpen && preview && (
        <BulkRecoveryConfirmModal
          preview={preview}
          scope={recoveryScope()}
          endpointPaused={endpointPaused}
          endpointRecovering={endpointRecovering}
          loading={starting}
          onConfirm={handleStart}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export default GroupRecovery;
