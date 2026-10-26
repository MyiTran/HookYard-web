import { useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/apiRequest";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type ApiKeyFormModalProps = {
  title: string;
  submitLabel: string;
  initialName: string;
  description?: string;
  cancelLabel?: string;
  onSubmit: (name: string) => Promise<ApiResult<unknown>>;
  onCreated?: () => void;
  onClose: () => void;
};

function ApiKeyFormModal({
  title,
  submitLabel,
  initialName,
  description,
  cancelLabel = "Cancel",
  onSubmit,
  onCreated,
  onClose,
}: ApiKeyFormModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await onSubmit(name.trim());

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onCreated?.();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {description && <p className="text-sm leading-6 text-[#53665A]">{description}</p>}

        <div>
          <label htmlFor="apiKeyName" className="mb-2 block text-sm font-semibold">
            API key name
          </label>

          <input
            id="apiKeyName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            placeholder="e.g. Default integration"
            className="h-12 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
          />

          <p className="mt-2 text-xs font-medium text-[#8A9990]">
            Use a name that identifies the system publishing events with this key.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-[#FBEEEE] px-4 py-3">
            <p className="text-sm font-medium text-[#B42318]">{error}</p>
            <p className="mt-1 text-xs font-medium text-[#B42318]">
              Try again, or open the project to create a key from the API keys section.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            {cancelLabel}
          </Button>

          <Button type="submit" variant="primary" size="lg" disabled={submitting || name.trim() === ""}>
            {submitting ? "Creating..." : error ? "Try again" : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ApiKeyFormModal;
