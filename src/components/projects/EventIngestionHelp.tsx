import type { ReactNode } from "react";
import CopyButton from "../ui/CopyButton";

const EVENT_REQUEST_EXAMPLE = `{
  "event_type": "order.created",
  "idempotency_key": "order_123",
  "payload": { "order_id": "123" }
}`;

const CHIP = "inline-flex w-fit items-center rounded-md bg-[#EFF5F1] px-1.5 py-0.5 text-[10px] font-semibold text-[#53665A]";
const FIELD_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-3 py-2.5 sm:grid-cols-[minmax(0,1.1fr)_4.25rem_5.25rem_minmax(0,1.7fr)] sm:items-start";
const FIELD_HEADER =
  "hidden grid-cols-[minmax(0,1.1fr)_4.25rem_5.25rem_minmax(0,1.7fr)] gap-x-3 border-b border-[#E4EBE6] bg-[#F7FAF8] px-3 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] sm:grid";

type ReferenceFieldProps = {
  name: string;
  type: "string" | "object" | "header";
  description: ReactNode;
};

function ReferenceField({ name, type, description }: ReferenceFieldProps) {
  return (
    <div className={FIELD_GRID}>
      <dt className="min-w-0 break-words font-mono text-[11px] font-semibold text-[#1F2A24]">{name}</dt>

      <dd className="flex items-center gap-1 sm:contents">
        <span className={CHIP}>{type}</span>
        <span className={CHIP}>required</span>
      </dd>

      <dd className="col-span-2 break-words text-xs font-medium leading-5 text-[#607267] sm:col-span-1">
        {description}
      </dd>
    </div>
  );
}

function EventIngestionHelp() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-3 py-2">
        <span className="rounded-md bg-[#EAF5EE] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#23613F]">
          POST
        </span>
        <code className="min-w-0 break-all font-mono text-xs font-semibold text-[#1F2A24]">/api/v1/events</code>
      </div>

      <section>
        <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Authorization</h4>

        <dl className="mt-1.5 divide-y divide-[#E4EBE6] overflow-hidden rounded-xl border border-[#E4EBE6] bg-white">
          <ReferenceField
            name="Authorization"
            type="header"
            description={<code className="font-mono text-[11px]">{"Bearer <project-api-key>"}</code>}
          />
          <ReferenceField
            name="Content-Type"
            type="header"
            description={<code className="font-mono text-[11px]">application/json</code>}
          />
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Request body</h4>
          <span className={CHIP}>body</span>
        </div>

        <dl className="mt-1.5 overflow-hidden rounded-xl border border-[#E4EBE6] bg-white">
          <div className={FIELD_HEADER} aria-hidden="true">
            <span>Name</span>
            <span>Type</span>
            <span>Required</span>
            <span>Description</span>
          </div>

          <div className="divide-y divide-[#E4EBE6]">
            <ReferenceField
              name="event_type"
              type="string"
              description="Event name, e.g. order.created. Max 255 characters."
            />
            <ReferenceField
              name="idempotency_key"
              type="string"
              description="Unique key for this event. Max 255 characters."
            />
            <ReferenceField
              name="payload"
              type="object"
              description="Your application event data. Must be a JSON object."
            />
          </div>
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Example</h4>
          <CopyButton value={EVENT_REQUEST_EXAMPLE} label="Copy JSON" ariaLabel="Copy event request example" />
        </div>

        <pre className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-[#17211B] px-3 py-2.5 font-mono text-[11px] leading-5 text-[#D8E3DB]">
          {EVENT_REQUEST_EXAMPLE}
        </pre>
      </section>

      <section>
        <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Idempotency & responses</h4>

        <div className="mt-1.5 space-y-1.5 rounded-xl border border-[#E4EBE6] bg-white px-3 py-2.5">
          <p className="text-[11px] font-medium leading-4 text-[#607267]">
            Same key + same content returns the existing event without creating duplicate deliveries.
          </p>
          <p className="text-[11px] font-medium leading-4 text-[#607267]">
            202 new event · 200 duplicate · 401 invalid or revoked key · 422 invalid body or reused key with
            different content
          </p>
          <p className="text-[11px] font-medium leading-4 text-[#607267]">
            429 delivery queue at capacity · the Event was not accepted and no delivery was queued. Wait for
            the Retry-After value, then retry with the same idempotency_key.
          </p>
        </div>
      </section>
    </div>
  );
}

export default EventIngestionHelp;
