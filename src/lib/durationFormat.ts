export function formatDuration(milliseconds: number | null): string {
  if (milliseconds === null) return "—";
  if (milliseconds < 1000) return `${milliseconds} ms`;

  return `${(milliseconds / 1000).toFixed(1)} s`;
}
