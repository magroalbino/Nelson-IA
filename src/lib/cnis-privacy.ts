const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const LONG_IDENTIFIER_RE = /\b\d{10,14}\b/g;
const LABELLED_NAME_RE = /((?:nome(?: completo)?|nome do segurado|nome da mãe|mãe|titular)\s*:\s*)([^\n;|]+)/gi;
const SENSITIVE_LABEL_RE = /((?:cpf|nit|nis|pis|pasep|rg|endereço|endereco|telefone|celular|e-?mail|n[uú]mero do benef[ií]cio|protocolo|processo)\s*[:#-]?\s*)([^\n;|]+)/gi;
const BASE64_RE = /data:[^;]+;base64,[a-z0-9+/=\s]+/gi;

export function sanitizeSensitiveText(value: string): string {
  return value
    .replace(BASE64_RE, "[CONTEÚDO REMOVIDO]")
    .replace(SENSITIVE_LABEL_RE, "$1[REMOVIDO]")
    .replace(LABELLED_NAME_RE, "$1[REMOVIDO]")
    .replace(CPF_RE, "[CPF REMOVIDO]")
    .replace(LONG_IDENTIFIER_RE, "[IDENTIFICADOR REMOVIDO]");
}

export function sanitizeFileName(fileName: string): string {
  const extension = fileName.toLowerCase().endsWith(".pdf") ? ".pdf" : ".bin";
  return `CNIS-${new Date().toISOString().slice(0, 10)}${extension}`;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeSensitiveText(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)]));
  }
  return value;
}

export function sanitizeAnalysis(value: unknown): Record<string, unknown> {
  const sanitized = sanitizeValue(value);
  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) return {};

  const output = sanitized as Record<string, unknown>;
  const structured = output.structured;
  if (structured && typeof structured === "object" && !Array.isArray(structured)) {
    const structuredRecord = structured as Record<string, unknown>;
    const employerTokens = new Map<string, string>();
    const employments = structuredRecord.employments;
    if (Array.isArray(employments)) {
      structuredRecord.employments = employments.map((employment) => {
        if (!employment || typeof employment !== "object") return employment;
        const item = { ...(employment as Record<string, unknown>) };
        if (typeof item.employer === "string" && item.employer.trim()) {
          const key = item.employer.trim().toLowerCase();
          const token = employerTokens.get(key) ?? `EMPREGADOR_${String(employerTokens.size + 1).padStart(3, "0")}`;
          employerTokens.set(key, token);
          item.employer = token;
        }
        return item;
      });
    }
  }
  return output;
}

export function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Falha inesperada no processamento.";
  return sanitizeSensitiveText(raw).replace(/\s+/g, " ").slice(0, 280);
}
