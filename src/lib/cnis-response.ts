export function normalizeEstimate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const preferred = candidate.text ?? candidate.summary ?? candidate.message ?? candidate.value ?? candidate.result;
    if (typeof preferred === "string") return preferred;
    return Object.entries(candidate).map(([key, item]) => `${key}: ${String(item)}`).join("; ");
  }
  return "Não foi possível determinar uma estimativa com os dados disponíveis.";
}
