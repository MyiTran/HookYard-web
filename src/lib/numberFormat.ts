export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "—";

  if (value < 1024) return `${value} B`;

  const kilobytes = value / 1024;

  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`;

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}
