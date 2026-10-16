import { useId, useState, type KeyboardEvent } from "react";
import CloseIcon from "../icons/CloseIcon";
import Button from "../ui/Button";

const WILDCARD_EVENT_TYPE = "*";
const EVENT_TYPE_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;
const INVALID_EVENT_TYPE_MESSAGE = 'Use letters, numbers, ".", "_" or "-". Do not start/end with ".".';
const DUPLICATE_EVENT_TYPE_MESSAGE = "This event type has already been added.";

type EventTypesEditorProps = {
  eventTypes: string[];
  onChange: (eventTypes: string[]) => void;
};

function EventTypesEditor({ eventTypes, onChange }: EventTypesEditorProps) {
  const subscriptionName = useId();
  const [eventTypeDraft, setEventTypeDraft] = useState("");
  const [eventTypeError, setEventTypeError] = useState("");

  const subscribesToAll = eventTypes.includes(WILDCARD_EVENT_TYPE);
  const specificEventTypes = eventTypes.filter((eventType) => eventType !== WILDCARD_EVENT_TYPE);

  function selectAllEvents() {
    if (!subscribesToAll) onChange([WILDCARD_EVENT_TYPE]);
  }

  function selectSpecificEvents() {
    if (subscribesToAll) onChange([]);
  }

  function addEventType() {
    const candidate = eventTypeDraft.trim();

    if (!candidate || !EVENT_TYPE_PATTERN.test(candidate)) {
      setEventTypeError(INVALID_EVENT_TYPE_MESSAGE);
      return;
    }

    if (eventTypes.includes(candidate)) {
      setEventTypeError(DUPLICATE_EVENT_TYPE_MESSAGE);
      return;
    }

    onChange([...eventTypes, candidate]);
    setEventTypeDraft("");
    setEventTypeError("");
  }

  function handleEventTypeChange(value: string) {
    setEventTypeDraft(value);

    if (eventTypeError) setEventTypeError("");
  }

  function removeEventType(eventType: string) {
    onChange(eventTypes.filter((value) => value !== eventType));
  }

  function handleEventTypeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (event.nativeEvent.isComposing) return;

    addEventType();
  }

  return (
    <>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={subscriptionName}
            checked={subscribesToAll}
            onChange={selectAllEvents}
            className="h-4 w-4 cursor-pointer accent-[#214E35]"
          />

          <span className="text-sm font-medium">All events</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={subscriptionName}
            checked={!subscribesToAll}
            onChange={selectSpecificEvents}
            className="h-4 w-4 cursor-pointer accent-[#214E35]"
          />

          <span className="text-sm font-medium">Specific events</span>
        </label>
      </div>

      {!subscribesToAll && (
        <div className="mt-3">
          {specificEventTypes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {specificEventTypes.map((eventType) => (
                <span
                  key={eventType}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#2563A8]"
                >
                  {eventType}

                  <button
                    type="button"
                    aria-label={`Remove ${eventType}`}
                    onClick={() => removeEventType(eventType)}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-[#2563A8] transition hover:bg-[#D7E6F6] hover:text-[#1D5FA8]"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={eventTypeDraft}
              onChange={(event) => handleEventTypeChange(event.target.value)}
              onKeyDown={handleEventTypeKeyDown}
              placeholder="e.g. order.created"
              className="h-11 min-w-0 flex-1 rounded-xl border border-[#C9DACE] bg-white px-4 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
            />

            <Button type="button" variant="secondary" size="md" className="shrink-0" onClick={addEventType}>
              Add
            </Button>
          </div>

          {eventTypeError ? (
            <p className="mt-2 text-xs font-medium text-[#B42318]">{eventTypeError}</p>
          ) : (
            <p className="mt-2 text-xs font-medium text-[#8A9990]">
              Add at least one event type. Examples: order.created, order.updated.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default EventTypesEditor;
