import { access, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { withTemporaryDirectory } from "./cnis-temp";

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe("diretórios temporários do CNIS", () => {
  it("remove o diretório depois do processamento bem-sucedido", async () => {
    let directory = "";
    const result = await withTemporaryDirectory("nelson-test-success-", async (current) => {
      directory = current;
      await writeFile(`${current}/document.pdf`, "%PDF-test");
      return "ok";
    });

    expect(result).toBe("ok");
    expect(await exists(directory)).toBe(false);
  });

  it("remove o diretório depois de uma falha de processamento", async () => {
    let directory = "";
    await expect(withTemporaryDirectory("nelson-test-error-", async (current) => {
      directory = current;
      await writeFile(`${current}/document.pdf`, "%PDF-test");
      throw new Error("falha simulada de OCR");
    })).rejects.toThrow("falha simulada de OCR");

    expect(await exists(directory)).toBe(false);
  });
});
