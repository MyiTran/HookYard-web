const EVENT_REQUEST_EXAMPLE = `POST /api/v1/events
Authorization: Bearer hky_...
Content-Type: application/json

{
  "event_type": "order.created",
  "idempotency_key": "order-123-created",
  "payload": {
    "order_id": "ord_123"
  }
}`;

function EventIngestionHelp() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium leading-6 text-[#405348]">
        Send an event from your server using a Project API key. Each request sends one event. Replace the example
        values below with information from your own system.
      </p>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
          Example request — replace the example values
        </p>

        <div className="mt-2 overflow-hidden rounded-xl border border-[#2A3A31] bg-[#17211B]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-white/50">API request</p>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#B6CEBC]">
              POST
            </span>
          </div>

          <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-6 text-[#D8E3DB]">
            {EVENT_REQUEST_EXAMPLE}
          </pre>
        </div>
      </div>

      <dl className="divide-y divide-[#E4EBE6] rounded-xl border border-[#E4EBE6] bg-white">
        <div className="px-3 py-2.5 sm:grid sm:grid-cols-[10.5rem,1fr] sm:gap-3">
          <dt className="text-xs font-semibold text-[#1F2A24]">
            Event name <code className="font-mono text-[11px] text-[#53665A]">event_type</code>
          </dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267] sm:mt-0">
            A label that describes what happened, for example <code>order.created</code>,{" "}
            <code>payment.completed</code>, or <code>user.created</code>. Replace it with the event type from your
            system.
          </dd>
        </div>

        <div className="px-3 py-2.5 sm:grid sm:grid-cols-[10.5rem,1fr] sm:gap-3">
          <dt className="text-xs font-semibold text-[#1F2A24]">
            Unique event ID <code className="font-mono text-[11px] text-[#53665A]">idempotency_key</code>
          </dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267] sm:mt-0">
            Required. Replace the example value with a unique value for this specific event. If your system sends the
            same event again, HookYard can use it to avoid creating a duplicate.
          </dd>
        </div>

        <div className="px-3 py-2.5 sm:grid sm:grid-cols-[10.5rem,1fr] sm:gap-3">
          <dt className="text-xs font-semibold text-[#1F2A24]">
            Event data <code className="font-mono text-[11px] text-[#53665A]">payload</code>
          </dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-[#607267] sm:mt-0">
            The details you want to send as a JSON object. Its fields are flexible and depend on your system. Replace
            the example values with your own event data.
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-[#D8E3DB] bg-white px-4 py-3">
        <p className="text-xs font-semibold text-[#1F2A24]">What to change</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs font-medium leading-5 text-[#607267]">
          <li>
            Replace <code>hky_...</code> with the API key you created.
          </li>
          <li>
            Replace <code>order.created</code> with the type of event from your system.
          </li>
          <li>Use a new unique idempotency key for each event.</li>
          <li>
            Put your own event details inside <code>payload</code>.
          </li>
        </ol>
      </div>

      <p className="text-[11px] font-medium text-[#8A9990]">
        Send requests from your server. Never expose your API key in browser or mobile-app code.
      </p>
    </div>
  );
}

export default EventIngestionHelp;
