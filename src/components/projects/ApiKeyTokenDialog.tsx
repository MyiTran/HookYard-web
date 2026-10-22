import { useState } from "react";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import Modal from "../ui/Modal";

type ApiKeyTokenDialogProps = {
  token: string;
  keyName: string;
  onClose: () => void;
};

function ApiKeyTokenDialog({ token, keyName, onClose }: ApiKeyTokenDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Modal title="Save your API key" onClose={onClose} dismissible={false}>
      <div className="flex items-start gap-3 rounded-xl bg-[#FBF1E4] px-4 py-3">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6B1F]" />

        <p className="text-sm font-medium text-[#9A6B1F]">
          Copy this API key now. This key will not be shown again.
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-[#1F2A24]">{keyName}</p>

      <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#D8E3DB] bg-[#F7FAF8] p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-sm text-[#1F2A24]">{token}</code>

        <CopyButton value={token} label="Copy key" copiedLabel="Copied" ariaLabel="Copy API key" />
      </div>

      <p className="mt-3 text-xs font-medium text-[#8A9990]">
        Use this project API key from your source system to publish Events into HookYard. It is different from an
        endpoint signing secret, which verifies deliveries sent to your webhook receiver.
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#D8E3DB] px-4 py-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#214E35]"
        />

        <span className="text-sm font-medium text-[#1F2A24]">{"I've saved this API key"}</span>
      </label>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" disabled={!confirmed} onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

export default ApiKeyTokenDialog;
