import { useState } from "react";
import { useProjectRealtime } from "../../hooks/useProjectRealtime";
import { formatDateTime } from "../../lib/dateFormat";
import { getDeliveries } from "../../lib/deliveryApi";
import { formatCount } from "../../lib/numberFormat";
import type { GlobalDeliveryMessageSummary } from "../../types/delivery";
import DeliveryLifecycleText from "../deliveries/DeliveryLifecycleText";
import DeliveryStatusBadge from "../deliveries/DeliveryStatusBadge";
import HttpStatusBadge from "../deliveries/HttpStatusBadge";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import LiveStatusBadge from "../ui/LiveStatusBadge";
import SingleReplayControl from "./SingleReplayControl";

const MATCH_LIMIT = 10;

const TEXT_INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-[#C9DACE] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

const FIELD_LABEL = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

function SingleDeliveryRecovery() {
  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [matches, setMatches] = useState<GlobalDeliveryMessageSummary[] | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [refreshError, setRefreshError] = useState("");

  const selected = matches?.find((message) => message.id === selectedId) ?? null;

  const { status: realtimeStatus } = useProjectRealtime({
    projectId: selected?.project.id ?? null,
    messageId: selected?.id ?? null,
    onReplayChanged: refreshSelected,
    onConnected: refreshSelected,
  });

  async function handleSearch() {
    const query = term.trim();

    setSearchError("");
    setRefreshError("");

    if (!query) {
      setMatches(null);
      setSelectedId("");
      setSearchError("Enter a Message ID or Request ID to find a delivery.");
      return;
    }

    setSearching(true);

    const result = await getDeliveries({ q: query, page: 1, perPage: MATCH_LIMIT });

    setSearching(false);
    setSelectedId("");

    if (!result.ok) {
      setMatches(null);
      setMatchCount(0);
      setSearchError(result.error);
      return;
    }

    setMatches(result.data.data);
    setMatchCount(result.data.meta.total_count);
  }

  async function refreshSelected() {
    if (!selected) return;

    const result = await getDeliveries({ q: selected.id, page: 1, perPage: MATCH_LIMIT });

    if (!result.ok) {
      setRefreshError(result.error);
      return;
    }

    const updated = result.data.data.find((message) => message.id === selected.id);

    if (!updated) return;

    setRefreshError("");
    setMatches((current) =>
      current ? current.map((message) => (message.id === updated.id ? updated : message)) : current,
    );
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 sm:flex-1">
            <label htmlFor="recoveryMessageSearch" className={FIELD_LABEL}>
              Message ID or Request ID
            </label>

            <input
              id="recoveryMessageSearch"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="msg_… or req_…"
              className={`${TEXT_INPUT_CLASS} [&::-webkit-search-cancel-button]:appearance-none`}
            />
          </div>

          <Button type="submit" variant="secondary" size="lg" loading={searching}>
            {searching ? "Searching..." : "Find delivery"}
          </Button>
        </div>
      </form>

      {searchError && (
        <p role="alert" className="mt-3 text-xs font-semibold text-[#B42318]">
          {searchError}
        </p>
      )}

      {matches !== null && matches.length === 0 && !searchError && (
        <p role="status" className="mt-3 text-sm font-medium text-[#607267]">
          No deliveries match that ID. Check the ID and try again.
        </p>
      )}

      {matches !== null && matches.length > 0 && (
        <fieldset className="mt-4 min-w-0">
          <legend className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
            Matching deliveries
          </legend>

          <ul className="mt-2 divide-y divide-[#E4EBE6] overflow-hidden rounded-xl border border-[#E4EBE6]">
            {matches.map((message) => (
              <li key={message.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition ${
                    selectedId === message.id ? "bg-[#F1F6F2]" : "hover:bg-[#F7FAF8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="recoveryMessage"
                    value={message.id}
                    checked={selectedId === message.id}
                    onChange={() => setSelectedId(message.id)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#23613F]"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="break-all font-mono text-xs font-semibold text-[#1F2A24]">{message.id}</span>
                      <DeliveryStatusBadge status={message.status} />

                      {message.replay.blocked_reason === "endpoint_paused" && (
                        <Badge tone="amber">Endpoint paused</Badge>
                      )}
                    </span>

                    <span className="mt-1 block truncate text-xs font-semibold text-[#53665A]" title={message.event_type}>
                      {message.event_type}
                    </span>

                    <span className="mt-0.5 block truncate text-xs font-medium text-[#8A9990]">
                      {message.endpoint.name} · {message.project.name} · {formatDateTime(message.created_at)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {matchCount > matches.length && (
            <p className="mt-2 text-xs font-medium text-[#8A9990]">
              Showing the first {matches.length} of {formatCount(matchCount)} matches. Search the full Message ID to
              narrow the list.
            </p>
          )}

          {!selected && (
            <p className="mt-2 text-xs font-medium text-[#8A9990]">Select one delivery to continue.</p>
          )}
        </fieldset>
      )}

      {selected && (
        <div className="mt-4 rounded-xl border border-[#D8E3DB] bg-[#F7FAF8] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Selected delivery</h3>
            <div className="flex items-center gap-2">
              <LiveStatusBadge status={realtimeStatus} />
              <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">One delivery</span>
            </div>
          </div>

          <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <dt className={FIELD_LABEL}>Message ID</dt>
              <dd className="break-all font-mono text-xs font-semibold text-[#1F2A24]">{selected.id}</dd>
            </div>

            <div className="min-w-0">
              <dt className={FIELD_LABEL}>Endpoint</dt>
              <dd className="truncate text-sm font-semibold text-[#1F2A24]" title={selected.endpoint.name}>
                {selected.endpoint.name}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className={FIELD_LABEL}>Event type</dt>
              <dd className="truncate text-sm font-semibold text-[#1F2A24]" title={selected.event_type}>
                {selected.event_type}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className={FIELD_LABEL}>Delivery outcome</dt>
              <dd className="text-sm">
                <DeliveryLifecycleText message={selected} />
              </dd>
              <dd className="mt-1">
                <HttpStatusBadge
                  status={selected.last_response_status}
                  errorType={selected.last_error_type}
                  failureCategory={selected.failure_category}
                />
              </dd>
            </div>
          </dl>

          <SingleReplayControl messageId={selected.id} replay={selected.replay} onReplayed={refreshSelected} />

          {refreshError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-[#B42318]">
              {refreshError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SingleDeliveryRecovery;
