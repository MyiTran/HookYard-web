import { useEffect, useState } from "react";
import FilterDateRange from "../filters/FilterDateRange";
import FilterSelect from "../filters/FilterSelect";
import { dateRangeLabel } from "../../lib/dateFormat";
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
  replayLimitBatchHint,
  replayLimitWarning,
  type ReplayLimit,
} from "../../lib/replayLimit";
import type { DeliveryOrder } from "../../types/delivery";
import type { Endpoint } from "../../types/endpoint";
import type { Project } from "../../types/project";
import type { ReplayPreview, ReplayRun } from "../../types/replay";
import Button from "../ui/Button";
import BulkRecoveryConfirmModal, { type RecoveryScopeItem } from "./BulkRecoveryConfirmModal";
import ReplayPreviewCard from "./ReplayPreviewCard";
import ReplayRunPanel from "./ReplayRunPanel";

const DEFAULT_ORDER: DeliveryOrder = "created_desc";

const ORDER_OPTIONS: { value: DeliveryOrder; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

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

  const [projectId, setProjectId] = useState("");
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [endpointId, setEndpointId] = useState("");

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [order, setOrder] = useState<DeliveryOrder>(DEFAULT_ORDER);

  const [preview, setPreview] = useState<ReplayPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [limitFailure, setLimitFailure] = useState<ReplayLimit | null>(null);

  const [run, setRun] = useState<ReplayRun | null>(null);
  const [pollError, setPollError] = useState("");
  const [pollingPaused, setPollingPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    let cancelled = false;

    async function load() {
      const result = await getEndpoints({ projectId: projectId || undefined, order: "name_asc", perPage: 100 });

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
    setStartError("");
    setLimitFailure(null);
    setConfirmOpen(false);
  }

  function handleProjectChange(value: string) {
    setProjectId(value);
    setEndpointId("");
    setEndpoints([]);
    setRun(null);
    setPollError("");
    setPollingPaused(false);
    resetPreview();
  }

  function handleEndpointChange(value: string) {
    setEndpointId(value);
    resetPreview();
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPreview();
  }

  function handleEventTypeChange(value: string) {
    setEventType(value);
    resetPreview();
  }

  function handleFromChange(value: string) {
    setFrom(value);
    resetPreview();
  }

  function handleToChange(value: string) {
    setTo(value);
    resetPreview();
  }

  function handleOrderChange(value: string) {
    setOrder(value as DeliveryOrder);
    resetPreview();
  }

  function handleReset() {
    setSearch("");
    setEventType("");
    setFrom("");
    setTo("");
    setOrder(DEFAULT_ORDER);
    setEndpointId("");
    resetPreview();
  }

  async function handlePreview() {
    if (!projectId) return;

    setPreviewing(true);
    setPreviewError("");

    const result = await previewReplay(projectId, replayFilters());

    setPreviewing(false);

    if (!result.ok) {
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

    const result = await createBulkReplay(projectId, replayFilters());

    setStarting(false);
    setConfirmOpen(false);

    if (!result.ok) {
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
  }

  const projectOptions = [
    { value: "", label: "Select a project" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  const endpointOptions = [
    { value: "", label: "All endpoints" },
    ...endpoints.map((endpoint) => ({ value: endpoint.id, label: endpoint.name })),
  ];

  const hasFilters = search !== "" || endpointId !== "" || eventType !== "" || from !== "" || to !== "";

  return (
    <div>
      <p className="text-xs font-medium text-[#53665A]">
        Choose criteria, preview the matching deliveries, then confirm the recovery.
      </p>
      <p className="mt-1 text-xs font-medium text-[#8A9990]">
        Only terminally failed deliveries with an active endpoint are included automatically.
      </p>

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
                  Message ID, request ID, or search
                </label>

                <input
                  id="groupRecoverySearch"
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search Message ID, Request ID, or delivery text"
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

              <Button type="submit" variant="primary" size="lg" loading={previewing} disabled={!projectId}>
                {previewing ? "Previewing..." : "Preview recovery"}
              </Button>

              <Button variant="secondary" size="lg" onClick={handleReset} disabled={!hasFilters}>
                Reset filters
              </Button>
            </div>

            <p className="mt-2 text-[11px] font-medium leading-relaxed text-[#8A9990]">
              {replayLimitBatchHint(previewLimit)}
            </p>
          </>
        )}
      </form>

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
