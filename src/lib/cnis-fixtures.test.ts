import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const fixturesDir = join(process.cwd(), "tests", "fixtures", "cnis");
const metadataFiles = readdirSync(fixturesDir).filter((file) => file.endsWith(".json")).sort();

describe("corpus sintético de referência do CNIS", () => {
  it("contém seis casos com documentação e PDF correspondente", () => {
    expect(metadataFiles).toHaveLength(6);
    for (const metadataFile of metadataFiles) {
      const metadata = JSON.parse(readFileSync(join(fixturesDir, metadataFile), "utf8"));
      const pdf = readFileSync(join(fixturesDir, metadata.pdf));
      expect(pdf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
      expect(metadata.id).toBe(metadataFile.replace(/\.json$/, ""));
      expect(metadata.expected).toBeDefined();
      expect(metadata.expected.competencies_include).toBeInstanceOf(Array);
    }
  });

  it("cobre os cenários mínimos do roadmap", () => {
    const purposes = metadataFiles.map((file) => JSON.parse(readFileSync(join(fixturesDir, file), "utf8")).purpose).join(" ");
    expect(purposes).toContain("lacuna");
    expect(purposes).toContain("sobreposição");
    expect(purposes).toContain("indicadores");
    expect(purposes).toContain("OCR");
    expect(purposes).toContain("insuficiência");
  });
});
