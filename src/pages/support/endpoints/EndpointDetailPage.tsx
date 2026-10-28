
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import EndpointCircuitBadge from "../../../components/endpoints/EndpointCircuitBadge";
import EndpointFormModal, { type EndpointFormValues } from "../../../components/endpoints/EndpointFormModal";
import DeliveryActivityPanel from "../../../components/endpoints/DeliveryActivityPanel";
import EndpointStatusBadge from "../../../components/endpoints/EndpointStatusBadge";
import ReceiverChecksSection from "../../../components/endpoints/ReceiverChecksSection";
import EventSubscriptions from "../../../components/endpoints/EventSubscriptions";
import EventSubscriptionsModal from "../../../components/endpoints/EventSubscriptionsModal";
import SigningSecretDialog from "../../../components/endpoints/SigningSecretDialog";
import SigningSecretHelp from "../../../components/endpoints/SigningSecretHelp";
import AppLayout from "../../../components/layout/AppLayout";
import ShieldIcon from "../../../components/icons/ShieldIcon";
import AlertTriangleIcon from "../../../components/icons/AlertTriangleIcon";
import RefreshIcon from "../../../components/icons/RefreshIcon";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import ContextualHelp from "../../../components/ui/ContextualHelp";
import { useToast } from "../../../components/ui/toastContext";
import type { ApiResult } from "../../../lib/apiRequest";
import { formatDateTime } from "../../../lib/dateFormat";
import { archiveEndpoint, getEndpoint, reEnableEndpointDelivery, rotateSigningSecret, updateEndpoint } from "../../../lib/endpointApi";
import { readNavState } from "../../../lib/navState";
import { formatCount } from "../../../lib/numberFormat";
import { getProject } from "../../../lib/projectApi";
import type { Endpoint } from "../../../types/endpoint";
import type { Project } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

const MASKED_SECRET = "••••••••••••••••";

function EndpointDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const navigate = useNavigate();
  const { projectId = "", endpointId = "" } = useParams();
  const location = useLocation();
  const { showToast } = useToast();

  const navState = readNavState(location.state);
  const backTo = navState.from ?? "/endpoints";
  const backLabel = navState.fromLabel ?? "Endpoints";

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [actionError, setActionError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showRotate, setShowRotate] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [showReEnable, setShowReEnable] = useState(false);
  const [reEnabling, setReEnabling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const endpointResult = await getEndpoint(projectId, endpointId);

      if (cancelled) return;

      if (!endpointResult.ok) {
        setUnavailable(endpointResult.status === 404 || endpointResult.status === 403);
        setLoadError(endpointResult.error);
        setLoading(false);
        return;
      }

      setEndpoint(endpointResult.data);

      const projectResult = await getProject(projectId);

      if (cancelled) return;

      if (projectResult.ok) setProject(projectResult.data);

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, endpointId]);

  async function handleUpdate(values: EndpointFormValues) {
    const result = await updateEndpoint(projectId, endpointId, {
      name: values.name,
      url: values.url,
      description: values.description,
      active: values.active,
      event_types: values.event_types,
    });

    if (result.ok) {
      setEndpoint(result.data);
      showToast({ type: "success", message: "Endpoint updated successfully" });
    }

    return result;
  }

  async function handleToggleActive() {
    if (!endpoint) return;

    const nextActive = !endpoint.active;
    setActionError("");
    setTogglingActive(true);

    const result = await updateEndpoint(projectId, endpointId, {
      name: endpoint.name,
      url: endpoint.url,
      description: endpoint.description ?? "",
      active: nextActive,
      event_types: endpoint.event_types,
    });

    setTogglingActive(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setEndpoint(result.data);
    showToast({
      type: "success",
      message: nextActive ? "Endpoint resumed successfully" : "Endpoint paused successfully",
    });
  }

  async function handleUpdateSubscriptions(eventTypes: string[]): Promise<ApiResult<Endpoint>> {
    if (!endpoint) return { ok: false, error: "Endpoint unavailable.", status: 0 };

    const result = await updateEndpoint(projectId, endpointId, {
      name: endpoint.name,
      url: endpoint.url,
      description: endpoint.description ?? "",
      active: endpoint.active,
      event_types: eventTypes,
    });

    if (result.ok) {
      setEndpoint(result.data);
      showToast({ type: "success", message: "Event subscriptions updated successfully" });
    }

    return result;
  }

  async function handleReEnable() {
    setActionError("");
    setReEnabling(true);

    const result = await reEnableEndpointDelivery(projectId, endpointId);

    setReEnabling(false);
    setShowReEnable(false);

    if (!result.ok) {
      setActionError(result.error);

      const refreshed = await getEndpoint(projectId, endpointId);
      if (refreshed.ok) setEndpoint(refreshed.data);

      return;
    }

    setEndpoint(result.data);
    showToast({ type: "success", message: "Delivery re-enabled successfully" });
  }

  async function handleArchive() {
    setActionError("");
    setArchiving(true);

    const result = await archiveEndpoint(projectId, endpointId);

    if (!result.ok) {
      setActionError(result.error);
      setArchiving(false);
      setShowArchive(false);
      return;
    }

    showToast({ type: "success", message: "Endpoint archived successfully" });
    navigate("/endpoints");
  }

  async function handleRotate() {
    setActionError("");
    setRotating(true);

    const result = await rotateSigningSecret(projectId, endpointId);

    setRotating(false);
    setShowRotate(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setEndpoint(result.data);
    setSecret(result.data.signing_secret);
    showToast({ type: "success", message: "Signing secret rotated successfully" });
  }

  let body: ReactNode;

  if (loading) {
    body = <p className="mt-8 text-sm font-medium text-[#607267]">Loading endpoint...</p>;
  } else if (unavailable) {
    body = (
      <div className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h2 className="text-lg font-semibold tracking-tight">Endpoint unavailable</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
          This endpoint does not exist or you do not have access to it.
        </p>

        <Link
          to="/endpoints"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#214E35] px-6 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          Back to endpoints
        </Link>
      </div>
    );
  } else if (!endpoint) {
    body = (
      <div className="mt-8 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
        {loadError}
      </div>
    );
  } else {
    const archived = Boolean(endpoint.archived_at);
    const isOwner = project?.current_user_role === "owner";
    const lastRotated = endpoint.signing_secret_last_rotated_at;
    const circuit = endpoint.circuit;
    const queue = endpoint.queue;
    const circuitOpen = circuit?.state === "circuit_open";
    const deliveryDisabled = circuit?.state === "disabled";
    const circuitProtected = !archived && Boolean(circuitOpen || deliveryDisabled);

    body = (
      <>
        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-semibold tracking-tight">{endpoint.name}</h1>
              <EndpointStatusBadge active={endpoint.active} archived={archived} />
              <EndpointCircuitBadge circuit={circuit} archived={archived} />
            </div>

            <p className="mt-2 truncate text-sm font-medium text-[#53665A]">{endpoint.url}</p>
          </div>

          {isOwner && !archived && (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Button variant="secondary" size="md" onClick={() => setShowEdit(true)}>
                Edit
              </Button>

              <Button variant="secondary" size="md" disabled={togglingActive} onClick={handleToggleActive}>
                {endpoint.active ? "Pause endpoint" : "Resume endpoint"}
              </Button>

              <span className="hidden h-6 w-px bg-[#D8E3DB] sm:block" aria-hidden="true" />

              <Button variant="dangerOutline" size="md" onClick={() => setShowArchive(true)}>
                Archive
              </Button>
            </div>
          )}
        </header>

        {archived && (
          <p className="mt-6 rounded-xl bg-[#FBF1E4] px-4 py-3 text-sm font-medium text-[#9A6B1F]">
            This endpoint is archived and read-only. It no longer receives webhook events.
          </p>
        )}

        {actionError && (
          <p className="mt-6 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{actionError}</p>
        )}

        {circuitProtected && circuit && (
          <section
            className={`mt-6 rounded-[18px] border p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)] ${
              circuitOpen ? "border-[#E8D5B5] bg-[#FBF7EC]" : "border-[#F1D5D5] bg-[#FBEEEE]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    circuitOpen ? "bg-[#F3E3C4] text-[#8A5D14]" : "bg-[#F7D9D9] text-[#B42318]"
                  }`}
                >
                  {circuitOpen ? <ShieldIcon className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                </span>

                <div className="min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">
                    {circuitOpen ? "Delivery temporarily paused" : "Delivery requires attention"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm font-medium text-[#53665A]">
                    {circuitOpen
                      ? "The receiver has repeatedly failed, so HookYard is protecting delivery traffic."
                      : "Receiver checks kept failing during the protection window, so automatic delivery is disabled."}
                  </p>
                </div>
              </div>

              {isOwner && deliveryDisabled && (
                <Button
                  variant="primary"
                  size="md"
                  className="shrink-0"
                  disabled={reEnabling}
                  onClick={() => setShowReEnable(true)}
                >
                  Re-enable delivery
                </Button>
              )}
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                  Failures
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  {formatCount(circuit.failure_count)} consecutive failures
                </dd>
                <p className="mt-1 text-xs font-medium text-[#53665A]">
                  Circuit opened after {formatCount(circuit.failure_threshold)} failures.
                </p>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                  Circuit opened
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  {circuit.opened_at ? formatDateTime(circuit.opened_at) : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                  Held deliveries
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  {formatCount(circuit.held_message_count)}
                </dd>
              </div>

              {queue && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                    Delivery queue
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                    {formatCount(queue.queued_count)} / {formatCount(queue.capacity)} queued
                  </dd>
                </div>
              )}
            </dl>

            {circuitOpen && circuit.probe_in_flight && (
              <p className="mt-3 text-xs font-medium text-[#8A5D14]">Checking receiver…</p>
            )}

            {deliveryDisabled && (
              <p className="mt-3 text-xs font-medium text-[#B42318]">
                Only a project owner can re-enable delivery.
              </p>
            )}
          </section>
        )}

        {queue && queue.state !== "ok" && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              queue.state === "full"
                ? "border-[#F1D5D5] bg-[#FBEEEE] text-[#B42318]"
                : "border-[#E8D5B5] bg-[#FBF7EC] text-[#8A5D14]"
            }`}
          >
            {queue.state === "full"
              ? `Delivery queue is full (${formatCount(queue.queued_count)} of ${formatCount(queue.capacity)}). New events may be rejected until capacity is available.`
              : `Delivery queue is filling up (${formatCount(queue.queued_count)} of ${formatCount(queue.capacity)}). Monitor delivery health before sending high volumes.`}
          </div>
        )}

        {!archived && circuit && <ReceiverChecksSection circuit={circuit} />}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)] lg:col-span-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoint information</h2>

            <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Project</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  <Link to={`/projects/${endpoint.project.id}`} className="text-[#23613F] transition hover:underline">
                    {endpoint.project.name}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Status</dt>
                <dd className="mt-1">
                  <EndpointStatusBadge active={endpoint.active} archived={archived} />
                </dd>
              </div>

              {circuit && !archived && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                    Circuit protection
                  </dt>
                  <dd className="mt-1">
                    <EndpointCircuitBadge circuit={circuit} showEnabled />
                  </dd>
                </div>
              )}

              {circuit?.state === "enabled" && queue && !archived && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                    Delivery queue
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                    {formatCount(queue.queued_count)} / {formatCount(queue.capacity)} queued
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Created</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(endpoint.created_at)}</dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Updated</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(endpoint.updated_at)}</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-[#E4EBE6] pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-[#53665A]">
                {endpoint.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 border-t border-[#E4EBE6] pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Event subscriptions</h3>
                  <p className="mt-1 text-xs font-medium text-[#8A9990]">
                    This endpoint receives webhook events matching these subscriptions.
                  </p>
                </div>

                {isOwner && !archived && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="shrink-0"
                    onClick={() => setShowSubscriptions(true)}
                  >
                    {endpoint.event_types.length === 0 ? "Add event subscription" : "Edit subscriptions"}
                  </Button>
                )}
              </div>

              <div className="mt-3">
                <EventSubscriptions eventTypes={endpoint.event_types} />
              </div>
            </div>
          </section>

          <section className="rounded-[18px] border border-[#B7CCBC] bg-[#E7F1EA] p-6 shadow-[0_8px_30px_rgba(32,78,53,0.06)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E5A34] text-white">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold tracking-tight text-[#173D28]">Signing secret</h2>

              <ContextualHelp label="Verify a webhook" title="Verify a webhook">
                <SigningSecretHelp />
              </ContextualHelp>
            </div>

            <p className="mt-3 text-sm font-medium text-[#53665A]">
              Used by your receiver to verify webhook requests sent by HookYard.
            </p>

            <div className="mt-4 rounded-xl border border-[#C9DACE] bg-white px-4 py-3.5">
              <code className="font-mono text-sm tracking-[0.2em] text-[#173D28]">{MASKED_SECRET}</code>

              <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 border-t border-[#E4EBE6] pt-3">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A5D14]">
                    Current secret version
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-[#173D28]">{endpoint.signing_secret_version}</dd>
                </div>

                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A5D14]">Last rotated</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-[#173D28]">
                    {lastRotated ? formatDateTime(lastRotated) : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-3 text-xs font-medium text-[#5D7063]">
              The full secret is only shown immediately after creation or rotation.
            </p>

            {isOwner && !archived && (
              <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => setShowRotate(true)}>
                <RefreshIcon className="h-4 w-4" />
                Rotate signing secret
              </Button>
            )}
          </section>
        </div>

        <DeliveryActivityPanel
          projectId={projectId}
          endpointId={endpointId}
          endpointName={endpoint.name}
          origin={navState}
          heldMessageCount={circuit?.held_message_count ?? 0}
          circuitState={circuit?.state}
        />

        {showEdit && project && (
          <EndpointFormModal
            title="Edit endpoint"
            submitLabel="Save changes"
            projects={[project]}
            initialValues={{
              projectId: project.id,
              name: endpoint.name,
              url: endpoint.url,
              description: endpoint.description ?? "",
              active: endpoint.active,
              event_types: endpoint.event_types,
            }}
            lockProject
            onSubmit={handleUpdate}
            onClose={() => setShowEdit(false)}
          />
        )}

        {showArchive && (
          <ConfirmDialog
            title="Archive endpoint"
            description="Archiving this endpoint will stop it from receiving new webhook events. Historical data will be kept. This action cannot currently be undone."
            confirmLabel="Archive endpoint"
            pendingLabel="Archiving..."
            loading={archiving}
            onConfirm={handleArchive}
            onCancel={() => setShowArchive(false)}
          />
        )}

        {showRotate && (
          <ConfirmDialog
            title="Rotate signing secret?"
            description="A new signing secret will be generated and used immediately for future webhook deliveries. The current secret will stop being used as soon as rotation succeeds. Update your receiver to use the new secret."
            note="If your receiver still uses the old secret, verification may fail."
            confirmLabel="Rotate secret"
            pendingLabel="Rotating..."
            loading={rotating}
            onConfirm={handleRotate}
            onCancel={() => setShowRotate(false)}
          />
        )}

        {showReEnable && (
          <ConfirmDialog
            title="Re-enable delivery?"
            description="Re-enabling resumes automatic delivery checks for this endpoint. It does not replay deliveries that already failed permanently. Your manual pause or resume setting is not changed."
            note="Held deliveries may be released gradually to protect the receiver."
            confirmLabel="Re-enable delivery"
            pendingLabel="Re-enabling..."
            loading={reEnabling}
            onConfirm={handleReEnable}
            onCancel={() => setShowReEnable(false)}
          />
        )}

        {showSubscriptions && (
          <EventSubscriptionsModal
            endpointName={endpoint.name}
            initialEventTypes={endpoint.event_types}
            onSubmit={handleUpdateSubscriptions}
            onClose={() => setShowSubscriptions(false)}
          />
        )}

        {secret && <SigningSecretDialog secret={secret} onClose={() => setSecret(null)} />}
      </>
    );
  }

  return (
    <AppLayout user={user} title={endpoint?.name || "Endpoints"}>
      <Link to={backTo} className="text-sm font-semibold text-[#23613F] transition hover:underline">
        ← {backLabel}
      </Link>

      {body}
    </AppLayout>
  );
}

export default EndpointDetailPage;
