export type DateRangeEdge = "start" | "end";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function readDateParam(value: string | null): string {
  return value && DATE_ONLY_PATTERN.test(value) ? value : "";
}

export function toUtcRangeBound(value: string, edge: DateRangeEdge): string {
  const time = edge === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z";
  const date = new Date(`${value}${time}`);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
