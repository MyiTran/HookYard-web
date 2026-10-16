import { useState } from "react";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import CopyIcon from "../icons/CopyIcon";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type SigningSecretDialogProps = {
  secret: string;
  onClose: () => void;
};

function SigningSecretDialog({ secret, onClose }: SigningSecretDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Modal title="Save your signing secret" onClose={onClose}>
      <div className="flex items-start gap-3 rounded-xl bg-[#FBF1E4] px-4 py-3">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6B1F]" />

        <p className="text-sm font-medium text-[#9A6B1F]">
          {"Copy this signing secret now. You won't be able to view it again."}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#D8E3DB] bg-[#F7FAF8] p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-sm text-[#1F2A24]">{secret}</code>

        <Button variant="secondary" size="md" className="shrink-0" onClick={handleCopy}>
          {copied ? <CheckCircleIcon className="h-4 w-4" /> : <CopyIcon />}
          {copied ? "Copied" : "Copy secret"}
        </Button>
      </div>

      <p className="mt-3 text-xs font-medium text-[#8A9990]">
        Update your webhook receiver to use this new secret. The previous secret is no longer used.
      </p>

      <p className="mt-1.5 text-xs font-medium text-[#8A9990]">
        If you lose it, rotate the signing secret to generate a new one.
      </p>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

export default SigningSecretDialog;
