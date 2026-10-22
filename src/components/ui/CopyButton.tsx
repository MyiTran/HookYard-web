import { useState } from "react";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import CopyIcon from "../icons/CopyIcon";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel: string;
  className?: string;
};

function CopyButton({ value, label = "Copy", copiedLabel = "Copied", ariaLabel, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#405348] transition hover:bg-[#EFF5F1] ${className}`}
    >
      {copied ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </button>
  );
}

export default CopyButton;
