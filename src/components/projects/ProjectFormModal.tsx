import { useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/projectApi";
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
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-[#C9DACE] px-5 text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || name.trim() === ""}
            className="inline-flex h-11 items-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProjectFormModal;
