import { useId, useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/apiRequest";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import EventTypesEditor from "./EventTypesEditor";

type EventSubscriptionsModalProps = {
  endpointName: string;
  initialEventTypes: string[];
  onSubmit: (eventTypes: string[]) => Promise<ApiResult<unknown>>;
  onClose: () => void;
};

function EventSubscriptionsModal({
  endpointName,
  initialEventTypes,
  onSubmit,
  onClose,
}: EventSubscriptionsModalProps) {
  const formId = useId();
  const [eventTypes, setEventTypes] = useState(initialEventTypes);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !submitting && eventTypes.length > 0;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await onSubmit(eventTypes);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onClose();
  }

  return (
    <Modal
      title="Event subscriptions"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" form={formId} variant="primary" size="lg" disabled={!canSubmit}>
            {submitting ? "Saving..." : "Save subscriptions"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm font-medium text-[#53665A]">
          Choose which events <span className="font-semibold text-[#1F2A24]">{endpointName}</span> receives.
        </p>

        <EventTypesEditor eventTypes={eventTypes} onChange={setEventTypes} />

        {error && <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{error}</p>}
      </form>
    </Modal>
  );
}

export default EventSubscriptionsModal;
