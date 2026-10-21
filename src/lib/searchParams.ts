export function readPageParam(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;

  const page = Number(value);

  return page >= 1 ? page : 1;
}

export function setSearchParam(params: URLSearchParams, key: string, value: string): void {
  if (value) params.set(key, value);
  else params.delete(key);
}
