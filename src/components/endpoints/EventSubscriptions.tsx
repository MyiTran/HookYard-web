import { useState } from "react";
import Badge from "../ui/Badge";

const WILDCARD_EVENT_TYPE = "*";
const DEFAULT_VISIBLE_COUNT = 8;

type EventSubscriptionsProps = {
  eventTypes: string[];
  visibleCount?: number;
};

const CHIP_CLASS =
  "inline-flex items-center rounded-full bg-[#E8F1FB] px-3 py-1 text-xs font-semibold text-[#2563A8]";
const TOGGLE_CLASS =
  "inline-flex cursor-pointer items-center rounded-full border border-[#CBDCF2] px-3 py-1 text-xs font-semibold text-[#2563A8] transition hover:bg-[#E8F1FB]";

function EventSubscriptions({ eventTypes, visibleCount = DEFAULT_VISIBLE_COUNT }: EventSubscriptionsProps) {
  const [expanded, setExpanded] = useState(false);

  if (eventTypes.includes(WILDCARD_EVENT_TYPE)) {
    return <Badge tone="blue">All events</Badge>;
  }

  const specific = eventTypes.filter((eventType) => eventType !== WILDCARD_EVENT_TYPE);

  if (specific.length === 0) {
    return <p className="text-sm font-medium text-[#8A9990]">No events subscribed</p>;
  }

  const visible = expanded ? specific : specific.slice(0, visibleCount);
  const remaining = specific.length - visible.length;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((eventType) => (
        <span key={eventType} className={CHIP_CLASS}>
          {eventType}
        </span>
      ))}

      {remaining > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className={TOGGLE_CLASS}>
          +{remaining} more
        </button>
      )}

      {expanded && specific.length > visibleCount && (
        <button type="button" onClick={() => setExpanded(false)} className={TOGGLE_CLASS}>
          Show less
        </button>
      )}
    </div>
  );
}

export default EventSubscriptions;
