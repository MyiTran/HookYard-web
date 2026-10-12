import { useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/projectApi";
import Modal from "./Modal";

type InviteCollaboratorModalProps = {
  onSubmit: (email: string) => Promise<ApiResult<unknown>>;
  onClose: () => void;
};

function InviteCollaboratorModal({ onSubmit, onClose }: InviteCollaboratorModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await onSubmit(email.trim());

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onClose();
  }

  return (
    <Modal title="Invite collaborator" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="inviteEmail" className="mb-2 block text-sm font-semibold">
            Email
          </label>

          <input
            id="inviteEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
            placeholder="teammate@example.com"
            className="h-12 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
          />

          <p className="mt-2 text-xs font-medium text-[#718078]">
            They will be invited as a Maintainer.
          </p>
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
            disabled={submitting || email.trim() === ""}
            className="inline-flex h-11 items-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Inviting..." : "Send invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default InviteCollaboratorModal;
