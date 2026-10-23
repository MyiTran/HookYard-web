export type NavState = {
  from?: string;
  fromLabel?: string;
};

type NavStateKey = "from" | "fromLabel" | "endpointFrom" | "endpointFromLabel" | "section";

export function readNavValue(state: unknown, key: NavStateKey): string | undefined {
  if (!state || typeof state !== "object") return undefined;

  const value = (state as Record<string, unknown>)[key];

  return typeof value === "string" ? value : undefined;
}

export function readNavState(state: unknown): NavState {
  return {
    from: readNavValue(state, "from"),
    fromLabel: readNavValue(state, "fromLabel"),
  };
}
