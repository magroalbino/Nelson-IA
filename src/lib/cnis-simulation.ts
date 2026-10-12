import type { CnisMetrics } from "@/lib/cnis-metrics";

type SimulationMetrics = Pick<CnisMetrics, "carenciaPotencial" | "carenciaConfirmada" | "consolidatedPeriods" | "invalidPeriods" | "gaps" | "overlaps" | "competenciesOutsidePeriods">;

export type ProgrammedRetirementSimulation = {
  rule: "aposentadoria_programada";
  normativeSource: string;
  status: "requisito_potencialmente_atendido" | "nao_atingido" | "conferencia_necessaria" | "insuficiente";
  requirement: number;
  potentialMonths: number;
  confirmedMonths: number;
  remainingPotentialMonths: number;
  consideredPeriods: string[];
  excludedOrUncertainPeriods: string[];
  missingData: string[];
  calculationMemory: string[];
  limitation: string;
};

const NORMATIVE_SOURCE = "INSS — Aposentadoria programada, atualização de 28/07/2025: https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadorias/aposentadoria-programada";

export function simulateProgrammedRetirement(metrics: SimulationMetrics): ProgrammedRetirementSimulation {
  const requirement = 180;
  const potentialMonths = Math.max(0, metrics.carenciaPotencial);
  const confirmedMonths = Math.max(0, metrics.carenciaConfirmada);
  const consideredPeriods = metrics.consolidatedPeriods.map((period) => `${period.start}–${period.end}`);
  const excludedOrUncertainPeriods = [
    ...metrics.invalidPeriods.map((period) => `${period.start}–${period.end} (período inválido)`),
    ...metrics.gaps.map((gap) => `${gap.start}–${gap.end} (lacuna)`),
    ...metrics.overlaps.map((overlap) => `${overlap.start}–${overlap.end} (sobreposição)`),
    ...metrics.competenciesOutsidePeriods.map((competency) => `${competency} (fora de período)`),
  ];
  const missingData = [
    "idade na data do requerimento",
    "sexo informado para a regra de idade mínima",
    "data de filiação ao RGPS e eventual regra de transição",
    "validação individual de cada competência para carência",
  ];

  let status: ProgrammedRetirementSimulation["status"] = "insuficiente";
  if (potentialMonths > 0 && potentialMonths < requirement) status = "nao_atingido";
  if (potentialMonths >= requirement) status = excludedOrUncertainPeriods.length ? "conferencia_necessaria" : "requisito_potencialmente_atendido";

  return {
    rule: "aposentadoria_programada",
    normativeSource: NORMATIVE_SOURCE,
    status,
    requirement,
    potentialMonths,
    confirmedMonths,
    remainingPotentialMonths: Math.max(0, requirement - potentialMonths),
    consideredPeriods,
    excludedOrUncertainPeriods,
    missingData,
    calculationMemory: [
      `${potentialMonths} competência(s) única(s) foram identificadas no documento.`,
      `Requisito isolado comparado: ${requirement} meses de carência.`,
      `${confirmedMonths} competência(s) foram confirmadas automaticamente; o restante permanece potencial.`,
    ],
    limitation: "Esta é uma verificação isolada de carência potencial. Não confirma elegibilidade, idade mínima, tempo de contribuição, regra de transição ou direito ao benefício.",
  };
}
