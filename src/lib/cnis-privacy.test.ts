import { describe, expect, it } from "vitest";
import { sanitizeAnalysis, sanitizeFileName, sanitizeSensitiveText, safeErrorMessage } from "./cnis-privacy";

describe("privacidade do fluxo CNIS", () => {
  it("remove CPF, nome rotulado, identificadores longos e base64", () => {
    const text = "Nome do segurado: Maria da Silva\nCPF: 123.456.789-09\nNIT: 12345678901\ndata:application/pdf;base64,AAAA";
    const sanitized = sanitizeSensitiveText(text);
    expect(sanitized).not.toContain("Maria da Silva");
    expect(sanitized).not.toContain("123.456.789-09");
    expect(sanitized).not.toContain("12345678901");
    expect(sanitized).not.toContain("base64");
  });

  it("não persiste o nome original do arquivo e tokeniza empregadores", () => {
    const sanitized = sanitizeAnalysis({
      structured: {
        employments: [
          { employer: "Empresa Maria da Silva", source: { excerpt: "CPF: 12345678909" } },
          { employer: "Empresa Maria da Silva", source: { excerpt: "Nome: Maria da Silva" } },
        ],
      },
    });
    const serialized = JSON.stringify(sanitized);
    expect(serialized).not.toContain("Maria da Silva");
    expect(serialized).not.toContain("12345678909");
    expect(serialized).toContain("EMPREGADOR_001");
    expect(sanitizeFileName("Maria-12345678909-CNIS.pdf")).toMatch(/^CNIS-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it("limita e sanitiza mensagens de erro", () => {
    const message = safeErrorMessage(new Error("CPF: 123.456.789-09; " + "x".repeat(500)));
    expect(message).not.toContain("123.456.789-09");
    expect(message.length).toBeLessThanOrEqual(280);
  });
});
