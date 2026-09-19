import { describe, expect, it } from "vitest";
import { structureCnis } from "./cnis-structured";

describe("modelo estruturado do CNIS", () => {
  it("extrai vínculo com empregador, categoria, período e fonte", () => {
    const result = structureCnis(["Empregador: EMPRESA FICTÍCIA ALFA\nCategoria: Empregado\nPeríodo: 01/2018 a 12/2020"]);
    expect(result.employments).toEqual([
      expect.objectContaining({
        employer: "EMPRESA FICTÍCIA ALFA",
        category: "Empregado",
        start: "01/2018",
        end: "12/2020",
        source: expect.objectContaining({ page: 1 }),
      }),
    ]);
  });

  it("expande intervalos de competências e preserva indicador", () => {
    const result = structureCnis(["Competências: 01/2019 a 03/2019 — indicador PEXT"]);
    expect(result.contributions.map((item) => item.competency)).toEqual(["01/2019", "02/2019", "03/2019"]);
    expect(result.contributions.every((item) => item.indicator === "PEXT")).toBe(true);
    expect(result.indicators[0]).toEqual(expect.objectContaining({ code: "PEXT", periods: ["01/2019", "03/2019"] }));
  });

  it("captura benefício com datas e origem", () => {
    const result = structureCnis(["Benefício: auxílio fictício — período 04/2020 a 06/2020"]);
    expect(result.benefits[0]).toEqual(expect.objectContaining({ kind: "auxílio fictício", start: "04/2020", end: "06/2020" }));
    expect(result.benefits[0].source.page).toBe(1);
  });

  it("não inventa vínculo ou benefício quando só há competência", () => {
    const result = structureCnis(["Competência: 07/2022"]);
    expect(result.contributions[0].competency).toBe("07/2022");
    expect(result.employments).toHaveLength(0);
    expect(result.benefits).toHaveLength(0);
  });
});
