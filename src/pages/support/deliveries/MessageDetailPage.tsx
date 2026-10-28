import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom";
import AttemptCard from "../../../components/deliveries/AttemptCard";
import DeliveryLifecycleText from "../../../components/deliveries/DeliveryLifecycleText";
import DeliveryStatusBadge from "../../../components/deliveries/DeliveryStatusBadge";
import HttpStatusBadge from "../../../components/deliveries/HttpStatusBadge";
import PayloadBlock from "../../../components/deliveries/PayloadBlock";
import AppLayout from "../../../components/layout/AppLayout";
import CopyButton from "../../../components/ui/CopyButton";
import { formatDateTime } from "../../../lib/dateFormat";
import { formatAttemptsUsed } from "../../../lib/deliveryStatus";
import { getDeliveryMessage } from "../../../lib/deliveryApi";
import { formatDuration } from "../../../lib/durationFormat";
import { readNavValue } from "../../../lib/navState";
import type { DeliveryMessageDetail } from "../../../types/delivery";
import type { CurrentUser } from "../../../types/user";

function MessageDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const location = useLocation();
  const { projectId = "", endpointId = "", messageId = "" } = useParams();

  const [message, setMessage] = useState<DeliveryMessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const endpointPath = `/projects/${projectId}/endpoints/${endpointId}`;
  const backTo = readNavValue(location.state, "from") ?? endpointPath;
  const backLabel = readNavValue(location.state, "fromLabel") ?? "Endpoint";
  const endpointOrigin = {
    from: readNavValue(location.state, "endpointFrom"),
    fromLabel: readNavValue(location.state, "endpointFromLabel"),
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getDeliveryMessage(projectId, messageId);

      if (cancelled) return;

      if (!result.ok) {
        setUnavailable(result.status === 404 || result.status === 403);
        setLoadError(result.error);
        setLoading(false);
        return;
      }

      setMessage(result.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, messageId]);

  let body: ReactNode;

  if (loading) {
    body = <p className="mt-8 text-sm font-medium text-[#607267]">Loading delivery...</p>;
  } else if (unavailable) {
    body = (
      <div className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h2 className="text-lg font-semibold tracking-tight">Delivery unavailable</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
          This message does not exist or you do not have access to it.
        </p>

        <Link
          to={backTo}
          state={endpointOrigin}
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#214E35] px-6 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          Back to endpoint
        </Link>
      </div>
    );
  } else if (!message) {
    body = (
      <div className="mt-8 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
        {loadError}
      </div>
    );
  } else {
    const latestAttempt = message.attempts[message.attempts.length - 1] ?? null;

    body = (
      <>
        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="min-w-0 truncate text-3xl font-semibold tracking-tight" title={message.event.event_type}>
                {message.event.event_type}
              </h1>
              <DeliveryStatusBadge status={message.status} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-[#53665A]">
              <code className="break-all font-mono text-xs text-[#405348]">{message.webhook_id}</code>
              <CopyButton value={message.webhook_id} ariaLabel="Copy message webhook ID" />
              <span className="text-[#8A9990]">•</span>
              <span>{formatDateTime(message.created_at)}</span>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Delivery status</h2>

          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Status</dt>
              <dd className="mt-1 space-y-1.5">
                <DeliveryStatusBadge status={message.status} />
                <p className="text-xs leading-snug">
                  <DeliveryLifecycleText message={message} />
                </p>
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Attempts used</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                {formatAttemptsUsed(message.attempt_count, message.max_attempts)}
                <p className="mt-0.5 text-xs font-medium text-[#8A9990]">
                  {latestAttempt ? `Latest ${formatDateTime(latestAttempt.created_at)}` : "No attempts yet"}
                </p>
              </dd>
            </div>

            {message.next_retry_at && (
              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Next retry</dt>
                <dd className="mt-1 text-sm font-semibold text-[#9A6B1F]">{formatDateTime(message.next_retry_at)}</dd>
              </div>
            )}

            {message.terminal_at && (
              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Completed</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(message.terminal_at)}</dd>
              </div>
            )}

            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Endpoint</dt>
              <dd className="mt-1 min-w-0">
                <Link
                  to={endpointPath}
                  state={endpointOrigin}
                  className="block truncate text-sm font-semibold text-[#23613F] transition hover:underline"
                >
                  {message.endpoint.name}
                </Link>
                <Link
                  to={`/projects/${message.endpoint.project.id}`}
                  className="mt-0.5 block truncate text-xs font-medium text-[#8A9990] transition hover:underline"
                >
                  {message.endpoint.project.name}
                </Link>
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Received</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(message.created_at)}</dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Latest result</dt>
              <dd className="mt-1">
                {latestAttempt ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <DeliveryStatusBadge status={latestAttempt.status} />
                    <HttpStatusBadge
                      status={latestAttempt.response_status}
                      errorType={latestAttempt.error_type}
                    />
                    {latestAttempt.duration_ms !== null && (
                      <span className="text-xs font-medium text-[#8A9990]">
                        {formatDuration(latestAttempt.duration_ms)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-[#8A9990]">No attempts yet</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)] lg:col-span-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Event</h2>

            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Message ID</dt>
                <dd className="mt-1 break-all font-mono text-xs font-medium text-[#405348]">{message.id}</dd>
              </div>

              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Event ID</dt>
                <dd className="mt-1 break-all font-mono text-xs font-medium text-[#405348]">{message.event.id}</dd>
              </div>

              <div className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Event type</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-[#1F2A24]">{message.event.event_type}</dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Received</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(message.event.created_at)}</dd>
              </div>
            </dl>

            <details className="group mt-5 border-t border-[#E4EBE6] pt-5">
              <summary className="cursor-pointer list-none text-xs font-semibold text-[#23613F] transition hover:underline [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show event payload</span>
                <span className="hidden group-open:inline">Hide event payload</span>
              </summary>

              <div className="mt-3">
                <PayloadBlock label="Payload" value={message.event.payload} />
              </div>
            </details>
          </section>

          <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoint</h2>

            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Endpoint</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  <Link
                    to={endpointPath}
                    state={endpointOrigin}
                    className="break-words text-[#23613F] transition hover:underline"
                  >
                    {message.endpoint.name}
                  </Link>
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">URL</dt>
                <dd className="mt-1 break-all font-mono text-xs font-medium text-[#405348]">{message.endpoint.url}</dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Project</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">
                  <Link
                    to={`/projects/${message.endpoint.project.id}`}
                    className="break-words text-[#23613F] transition hover:underline"
                  >
                    {message.endpoint.project.name}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Attempt history</h2>
              <p className="mt-1 text-xs font-medium text-[#8A9990]">
                Oldest first. Each HTTP attempt recorded for this message.
              </p>
            </div>

            <p className="text-xs font-medium text-[#8A9990]">
              {message.attempts.length} {message.attempts.length === 1 ? "attempt" : "attempts"}
            </p>
          </div>

          {message.attempts.length === 0 ? (
            <div className="mt-4 rounded-[14px] border border-dashed border-[#D2DAD5] bg-[#F2F4F3] px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[#1F2A24]">No delivery attempts yet</p>
              <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-[#8A9990]">
                Attempts will appear here once HookYard starts delivering this message.
              </p>
            </div>
          ) : (
            <ol className="mt-4 space-y-4">
              {message.attempts.map((attempt) => (
                <li key={attempt.id}>
                  <AttemptCard attempt={attempt} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </>
    );
  }

  return (
    <AppLayout user={user} title={message?.event.event_type || "Delivery"}>
      <Link
        to={backTo}
        state={endpointOrigin}
        className="text-sm font-semibold text-[#23613F] transition hover:underline"
      >
        ← {backLabel}
      </Link>

      {body}
    </AppLayout>
  );
}

export default MessageDetailPage;
