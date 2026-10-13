import { useState, type SubmitEvent } from "react";
import type { ApiResult } from "../../lib/apiRequest";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

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
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="lg" disabled={submitting || email.trim() === ""}>
            {submitting ? "Inviting..." : "Send invite"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default InviteCollaboratorModal;
