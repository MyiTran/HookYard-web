import type { ReactNode } from "react";
import CopyButton from "../ui/CopyButton";

const WEBHOOK_PAYLOAD_EXAMPLE = `{
  "id": "event_id",
  "type": "order.created",
  "created_at": "2026-10-22T12:00:00Z",
  "data": { "order_id": "123" }
}`;

const CHIP = "inline-flex w-fit items-center rounded-md bg-[#EFF5F1] px-1.5 py-0.5 text-[10px] font-semibold text-[#53665A]";
const FIELD_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-3 py-2.5 sm:grid-cols-[minmax(0,1.1fr)_4.25rem_5.25rem_minmax(0,1.7fr)] sm:items-start";
const FIELD_HEADER =
  "hidden grid-cols-[minmax(0,1.1fr)_4.25rem_5.25rem_minmax(0,1.7fr)] gap-x-3 border-b border-[#E4EBE6] bg-[#F7FAF8] px-3 py-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] sm:grid";

type ReferenceFieldProps = {
  name: string;
  description: ReactNode;
};

function ReferenceField({ name, description }: ReferenceFieldProps) {
  return (
    <div className={FIELD_GRID}>
      <dt className="min-w-0 break-words font-mono text-[11px] font-semibold text-[#1F2A24]">{name}</dt>

      <dd className="flex items-center gap-1 sm:contents">
        <span className={CHIP}>string</span>
        <span className={CHIP}>required</span>
      </dd>

      <dd className="col-span-2 break-words text-xs font-medium leading-5 text-[#607267] sm:col-span-1">
        {description}
      </dd>
    </div>
  );
}

function SigningSecretHelp() {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium leading-5 text-[#607267]">
        HookYard sends a signed POST request to this endpoint for each matching event.
      </p>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Required headers</h4>
          <span className={CHIP}>header</span>
        </div>

        <dl className="mt-1.5 overflow-hidden rounded-xl border border-[#E4EBE6] bg-white">
          <div className={FIELD_HEADER} aria-hidden="true">
            <span>Name</span>
            <span>Type</span>
            <span>Required</span>
            <span>Description</span>
          </div>

          <div className="divide-y divide-[#E4EBE6]">
            <ReferenceField name="webhook-id" description="Unique delivery ID" />
            <ReferenceField name="webhook-timestamp" description="Unix time in seconds" />
            <ReferenceField
              name="webhook-signature"
              description={
                <code className="font-mono text-[11px]">{"v1,<standard Base64 HMAC-SHA256 digest>"}</code>
              }
            />
          </div>
        </dl>
      </section>

      <section>
        <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Verification</h4>

        <div className="mt-1.5 rounded-xl bg-[#17211B] px-3 py-2.5 font-mono text-[10px] leading-5 text-[#D8E3DB]">
          <code className="break-all">HMAC-SHA256(secret, webhook-id.timestamp.raw-body)</code>
        </div>

        <div className="mt-1.5 grid gap-1 rounded-xl border border-[#E4EBE6] bg-white px-3 py-2.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Signing key</p>
          <p className="text-xs font-medium leading-5 text-[#607267]">
            Remove <code className="font-mono text-[11px]">whsec_</code>, then standard-Base64 decode the
            remaining value before using it as the HMAC key.
          </p>
        </div>
      </section>

      <div className="space-y-1.5">
        <p className="flex gap-1.5 text-[11px] font-medium leading-4 text-[#607267]">
          <span aria-hidden="true">•</span>
          <span>Verify the exact raw request body bytes before parsing or re-serializing JSON.</span>
        </p>
        <p className="flex gap-1.5 text-[11px] font-medium leading-4 text-[#607267]">
          <span aria-hidden="true">•</span>
          <span>Reject invalid signatures and timestamps more than 5 minutes old or 5 minutes in the future.</span>
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Payload</h4>
          <CopyButton value={WEBHOOK_PAYLOAD_EXAMPLE} label="Copy JSON" ariaLabel="Copy webhook payload example" />
        </div>

        <pre className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-[#17211B] px-3 py-2.5 font-mono text-[11px] leading-5 text-[#D8E3DB]">
          {WEBHOOK_PAYLOAD_EXAMPLE}
        </pre>

        <div className="mt-2 space-y-1.5">
          <p className="flex gap-1.5 text-[11px] font-medium leading-4 text-[#607267]">
            <span aria-hidden="true">•</span>
            <span>
              <code className="font-mono text-[11px]">webhook-request-id</code> — optional tracing header; it is not
              signed.
            </span>
          </p>
          <p className="flex gap-1.5 text-[11px] font-medium leading-4 text-[#607267]">
            <span aria-hidden="true">•</span>
            <span>
              Secret rotation — new attempts use the new secret immediately; there is no grace period or fallback
              secret.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default SigningSecretHelp;
