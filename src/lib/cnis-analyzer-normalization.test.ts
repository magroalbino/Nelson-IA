import { describe, expect, it } from "vitest";
import { normalizeEstimate } from "./cnis-response";

describe("normalização de respostas da análise do CNIS", () => {
  it("mantém estimativa textual", () => {
    expect(normalizeEstimate("Ainda não é possível determinar")).toBe("Ainda não é possível determinar");
  });

  it("converte objeto com texto preferencial em string", () => {
    expect(normalizeEstimate({ summary: "Faltam dados de nascimento" })).toBe("Faltam dados de nascimento");
  });

  it("não falha com objeto inesperado", () => {
    expect(normalizeEstimate({ prazo: 12, unidade: "meses" })).toContain("prazo: 12");
  });
});
