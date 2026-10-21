import { useState } from "react";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import CopyIcon from "../icons/CopyIcon";

type PayloadBlockProps = {
  label: string;
  value: unknown;
  isHeaders?: boolean;
};

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatBody(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return value;
  }
}

function formatHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}`)
    .join("\n");
}

function formatValue(value: unknown, isHeaders: boolean): string {
  if (value === null || value === undefined) return "";

  if (isHeaders && typeof value === "object") {
    return formatHeaders(value as Record<string, string>);
  }

  if (typeof value === "string") return formatBody(value);

  return prettyJson(value);
}

function PayloadBlock({ label, value, isHeaders = false }: PayloadBlockProps) {
  const [copied, setCopied] = useState(false);
  const text = formatValue(value, isHeaders);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">{label}</p>

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#405348] transition hover:bg-[#EFF5F1]"
          >
            {copied ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {text ? (
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3 font-mono text-xs leading-relaxed text-[#405348]">
          {text}
        </pre>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-[#D8E3DB] px-4 py-3 text-xs font-medium text-[#8A9990]">
          Not captured
        </p>
      )}
    </div>
  );
}

export default PayloadBlock;
