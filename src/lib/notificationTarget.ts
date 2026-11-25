const WHITESPACE_PATTERN = /\s/;

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code <= 0x1f || code === 0x7f) return true;
  }

  return false;
}

export function toSafeNotificationPath(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!trimmed) return null;
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\")) return null;
  if (WHITESPACE_PATTERN.test(trimmed)) return null;
  if (hasControlCharacter(trimmed)) return null;

  return trimmed;
}
