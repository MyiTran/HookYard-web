import { useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/apiRequest";
import Button from "../ui/Button";
import Modal from "./Modal";

type ProjectFormModalProps = {
  title: string;
  submitLabel: string;
  initialName: string;
  onSubmit: (name: string) => Promise<ApiResult<unknown>>;
  onClose: () => void;
};

function ProjectFormModal({ title, submitLabel, initialName, onSubmit, onClose }: ProjectFormModalProps) {
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

    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="projectName" className="mb-2 block text-sm font-semibold">
            Project name
          </label>

          <input
            id="projectName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            placeholder="e.g. Billing webhooks"
            className="h-12 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
          />
        </div>

        {error && <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="lg" disabled={submitting || name.trim() === ""}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProjectFormModal;
