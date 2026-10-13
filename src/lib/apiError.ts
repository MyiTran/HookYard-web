function extractMessage(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }

  return "";
}

function collectMessages(value: unknown, messages: string[]): void {
  if (value == null) return;

  if (typeof value === "string") {
    if (value.trim()) messages.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectMessages(item, messages);
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = extractMessage(record);

    if (direct) {
      messages.push(direct);
      return;
    }

    for (const nested of Object.values(record)) collectMessages(nested, messages);
  }
}

export function formatApiError(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data;

  const messages: string[] = [];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    collectMessages(record.errors, messages);

    if (messages.length === 0) collectMessages(record.error, messages);
    if (messages.length === 0) collectMessages(record.message, messages);
  }

  const unique = [...new Set(messages.map((message) => message.trim()).filter(Boolean))];

  return unique.length > 0 ? unique.join(", ") : fallback;
}
