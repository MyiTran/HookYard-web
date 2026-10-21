import { useId, useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/apiRequest";
import type { EndpointInput } from "../../types/endpoint";
import type { Project } from "../../types/project";
import FilterSelect from "../filters/FilterSelect";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import EventTypesEditor from "./EventTypesEditor";

export type EndpointFormValues = EndpointInput & {
  projectId: string;
};

type EndpointFormModalProps = {
  title: string;
  submitLabel: string;
  projects: Project[];
  initialValues: EndpointFormValues;
  lockProject: boolean;
  onSubmit: (values: EndpointFormValues) => Promise<ApiResult<unknown>>;
  onClose: () => void;
};

const INPUT_CLASS =
  "h-12 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

const LABEL_CLASS = "mb-2 block text-sm font-semibold";

function EndpointFormModal({
  title,
  submitLabel,
  projects,
  initialValues,
  lockProject,
  onSubmit,
  onClose,
}: EndpointFormModalProps) {
  const activeId = useId();
  const formId = useId();
  const [values, setValues] = useState<EndpointFormValues>(initialValues);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lockedProjectName = projects.find((project) => project.id === values.projectId)?.name ?? "";

  const canSubmit =
    !submitting &&
    values.projectId !== "" &&
    values.name.trim() !== "" &&
    values.url.trim() !== "" &&
    values.event_types.length > 0;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await onSubmit({
      ...values,
      name: values.name.trim(),
      url: values.url.trim(),
      description: values.description.trim(),
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onClose();
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" form={formId} variant="primary" size="lg" disabled={!canSubmit}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <div>
          {lockProject ? (
            <p className={LABEL_CLASS}>
              Project <span className="text-[#B42318]">*</span>
            </p>
          ) : (
            <label htmlFor="endpointProjectField" className={LABEL_CLASS}>
              Project <span className="text-[#B42318]">*</span>
            </label>
          )}

          {lockProject ? (
            <div className="flex h-12 items-center rounded-xl border border-[#E4EBE6] bg-[#F1F6F2] px-4 text-sm font-medium text-[#53665A]">
              {lockedProjectName || "—"}
            </div>
          ) : (
            <FilterSelect
              id="endpointProjectField"
              value={values.projectId}
              onChange={(value) => setValues({ ...values, projectId: value })}
              options={projects.map((project) => ({ value: project.id, label: project.name }))}
              ariaLabel="Endpoint project"
            />
          )}
        </div>

        <div>
          <label htmlFor="endpointName" className={LABEL_CLASS}>
            Name <span className="text-[#B42318]">*</span>
          </label>

          <input
            id="endpointName"
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            required
            autoFocus
            placeholder="e.g. Billing events"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="endpointUrl" className={LABEL_CLASS}>
            URL <span className="text-[#B42318]">*</span>
          </label>

          <input
            id="endpointUrl"
            type="url"
            value={values.url}
            onChange={(event) => setValues({ ...values, url: event.target.value })}
            required
            placeholder="https://example.com/webhooks"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="endpointDescription" className={LABEL_CLASS}>
            Description <span className="font-medium text-[#8A9990]">optional</span>
          </label>

          <textarea
            id="endpointDescription"
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            rows={3}
            placeholder="What does this endpoint receive?"
            className="w-full rounded-xl border border-[#C9DACE] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
          />
        </div>

        <div>
          <label htmlFor={activeId} className="flex cursor-pointer items-center gap-3">
            <input
              id={activeId}
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues({ ...values, active: event.target.checked })}
              className="h-4 w-4 cursor-pointer rounded border-[#C9DACE] accent-[#214E35]"
            />

            <span className="text-sm font-semibold">Active</span>
          </label>

          <p className="mt-2 text-xs font-medium text-[#8A9990]">
            Enable this endpoint to receive future webhook deliveries.
          </p>
        </div>

        <div>
          <p className={LABEL_CLASS}>Subscription</p>

          <EventTypesEditor
            eventTypes={values.event_types}
            onChange={(eventTypes) => setValues({ ...values, event_types: eventTypes })}
          />
        </div>

        {error && <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{error}</p>}
      </form>
    </Modal>
  );
}

export default EndpointFormModal;
