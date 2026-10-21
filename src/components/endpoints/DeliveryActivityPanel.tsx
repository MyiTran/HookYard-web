import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { DELIVERIES_PAGE_SIZE, listEndpointMessages } from "../../lib/deliveryApi";
import type { NavState } from "../../lib/navState";
import type { DeliveryMessageSummary } from "../../types/delivery";
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
};

function readPage(value: string | null): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 1 ? parsed : 1;
}

function DeliveryActivityPanel({ projectId, endpointId, endpointName, origin }: DeliveryActivityPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams.get("deliveries_page"));

  const [messages, setMessages] = useState<DeliveryMessageSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await listEndpointMessages(projectId, endpointId, page, DELIVERIES_PAGE_SIZE);

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setMessages([]);
        setMeta(null);
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
          <p className="mt-1 text-xs font-medium text-[#8A9990]">
            Webhook messages generated for this endpoint by matching events.
          </p>
        </div>

        {meta && meta.total_count > 0 && (
          <p className="text-xs font-medium text-[#8A9990]">
            {meta.total_count} {meta.total_count === 1 ? "message" : "messages"}
          </p>
        )}
      </div>

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
