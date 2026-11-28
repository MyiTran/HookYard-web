import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useEndpointDeliveryRealtime } from "../../hooks/useEndpointDeliveryRealtime";
import {
  applyEndpointDeliveryUpdate,
  insertEndpointDeliveryUpdate,
  type EndpointDeliveryUpdate,
} from "../../lib/endpointDeliveryRealtime";
import { DELIVERIES_PAGE_SIZE, getDeliveryMessage, listEndpointMessages } from "../../lib/deliveryApi";
import { formatCount } from "../../lib/numberFormat";
import type { NavState } from "../../lib/navState";
import type { DeliveryMessageSummary } from "../../types/delivery";
import type { EndpointCircuitState } from "../../types/endpoint";
import type { PaginationMeta } from "../../types/pagination";
import ActivityIcon from "../icons/ActivityIcon";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import DeliveryRow from "../deliveries/DeliveryRow";

type DeliveryActivityPanelProps = {
  projectId: string;
  endpointId: string;
  endpointName: string;
  origin: NavState;
  heldMessageCount?: number;
  circuitState?: EndpointCircuitState;
};

function readPage(value: string | null): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 1 ? parsed : 1;
}

function DeliveryActivityPanel({
  projectId,
  endpointId,
  endpointName,
  origin,
  heldMessageCount = 0,
  circuitState,
}: DeliveryActivityPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams.get("deliveries_page"));

  const [messages, setMessages] = useState<DeliveryMessageSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const messagesRef = useRef<DeliveryMessageSummary[]>([]);
  const pendingMessageUpdatesRef = useRef(new Map<string, EndpointDeliveryUpdate>());
  const loadingMessageIdsRef = useRef(new Set<string>());

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await listEndpointMessages(projectId, endpointId, page, DELIVERIES_PAGE_SIZE);

      if (cancelled) return;

      if (!result.ok) {
        if (messagesRef.current.length === 0) {
          setError(result.error);
          setMessages([]);
          setMeta(null);
        }
        setLoading(false);
        return;
      }

      setError("");
      setMeta(result.data.meta);

      if (page > result.data.meta.last_page) {
        setLoading(false);
        return;
      }

      setMessages(result.data.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, endpointId, page, reloadToken]);

  useEffect(() => {
    if (!meta || page <= meta.last_page) return;

    const params = new URLSearchParams(searchParams);

    if (meta.last_page > 1) params.set("deliveries_page", String(meta.last_page));
    else params.delete("deliveries_page");

    setSearchParams(params, { replace: true });
  }, [meta, page, searchParams, setSearchParams]);

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    if (nextPage > 1) params.set("deliveries_page", String(nextPage));
    else params.delete("deliveries_page");

    setSearchParams(params);
  }

  const handleDeliveryUpdate = useCallback(async (update: EndpointDeliveryUpdate) => {
    if (messagesRef.current.some((message) => message.id === update.messageId)) {
      setMessages((currentMessages) => applyEndpointDeliveryUpdate(currentMessages, update));
      return;
    }

    pendingMessageUpdatesRef.current.set(update.messageId, update);

    if (loadingMessageIdsRef.current.has(update.messageId)) return;

    loadingMessageIdsRef.current.add(update.messageId);

    try {
      const messageResult = await getDeliveryMessage(projectId, update.messageId);
      const latestUpdate = pendingMessageUpdatesRef.current.get(update.messageId);

      if (!messageResult.ok || !latestUpdate || messageResult.data.endpoint.id !== endpointId) return;

      const alreadyDisplayed = messagesRef.current.some((message) => message.id === latestUpdate.messageId);

      setMessages((currentMessages) => insertEndpointDeliveryUpdate(currentMessages, messageResult.data, latestUpdate));

      if (!alreadyDisplayed) {
        setMeta((currentMeta) => currentMeta ? { ...currentMeta, total_count: currentMeta.total_count + 1 } : currentMeta);
      }
    } finally {
      pendingMessageUpdatesRef.current.delete(update.messageId);
      loadingMessageIdsRef.current.delete(update.messageId);
    }
  }, [endpointId, projectId]);

  const { status: realtimeStatus } = useEndpointDeliveryRealtime({
    endpointId,
    onDeliveryUpdate: handleDeliveryUpdate,
    onConnected: () => setReloadToken((token) => token + 1),
  });

  const totalPages = meta?.last_page ?? 1;
  const isClamping = Boolean(meta && page > meta.last_page);

  let body: ReactNode;

  if ((loading || isClamping) && messages.length === 0) {
    body = <p className="text-sm font-medium text-[#607267]">Loading deliveries...</p>;
  } else if (error) {
    body = (
      <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-6">
        <p className="text-sm font-medium text-[#B42318]">{error}</p>

        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setReloadToken((token) => token + 1)}>
          Try again
        </Button>
      </div>
    );
  } else if (messages.length === 0) {
    body = (
      <div className="rounded-[14px] border border-dashed border-[#D2DAD5] bg-[#F2F4F3] px-6 py-12 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5D7063]">
          <ActivityIcon className="h-5 w-5" />
        </span>

        <p className="mt-3 text-sm font-semibold text-[#1F2A24]">No deliveries yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-[#8A9990]">
          Messages will appear here after this endpoint receives matching events.
        </p>
      </div>
    );
  } else {
    body = (
      <div
        aria-busy={loading || isClamping}
        className={`overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)] transition ${
          loading || isClamping ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="divide-y divide-[#E4EBE6]">
          {messages.map((message) => (
            <DeliveryRow
              key={message.id}
              message={message}
              projectId={projectId}
              endpointId={endpointId}
              endpointName={endpointName}
              origin={origin}
              page={page}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Delivery activity</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-[#8A9990]">Webhook messages generated for this endpoint by matching events.</p>
            <span
              role="status"
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                realtimeStatus === "connected"
                  ? "bg-[#E7F1EA] text-[#23613F]"
                  : realtimeStatus === "reconnecting"
                    ? "bg-[#FBF1E4] text-[#8A5D14]"
                    : "bg-[#F2F4F3] text-[#607267]"
              }`}
            >
              {realtimeStatus === "connected" ? "Connected" : realtimeStatus === "reconnecting" ? "Reconnecting" : "Disconnected"}
            </span>
          </div>
        </div>

        {meta && meta.total_count > 0 && (
          <p className="text-xs font-medium text-[#8A9990]">
            {meta.total_count} {meta.total_count === 1 ? "message" : "messages"}
          </p>
        )}
      </div>

      {heldMessageCount > 0 && (
        <div className="mt-4 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 text-sm font-medium text-[#8A5D14]">
          {formatCount(heldMessageCount)}{" "}
          {heldMessageCount === 1 ? "delivery is" : "deliveries are"} waiting while{" "}
          {circuitState === "disabled" ? "delivery is disabled" : "circuit protection is active"}.
        </div>
      )}

      <div className="mt-4">{body}</div>

      {!error && meta && meta.total_count > 0 && (
        <div className="mt-4">
          <Pagination
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalCount={meta.total_count}
            pageSize={meta.page_size}
            disabled={loading || isClamping}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
}

export default DeliveryActivityPanel;
