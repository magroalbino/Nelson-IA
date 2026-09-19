# Fixtures sintéticas de CNIS

Todos os documentos desta pasta são **fictícios e sintéticos**. Não contêm dados de segurados reais, não reproduzem um documento oficial do INSS e não devem ser usados para fundamentar decisões previdenciárias.

Cada caso possui um PDF e um JSON com propósito, tipo de documento e expectativas mínimas para os testes. Os casos cobrem texto selecionável, lacuna, sobreposição, indicadores, fallback de OCR e documento incompleto.

## Casos

| Caso | Tipo | Objetivo |
|---|---|---|
| `01-simples-texto` | PDF textual | Fluxo básico com vínculo contínuo |
| `02-lacuna` | PDF textual | Intervalo intencional entre vínculos |
| `03-sobreposicao` | PDF textual | Períodos intencionalmente sobrepostos |
| `04-indicadores` | PDF textual | Captura de PEXT, AEXT-VI e IREC-LC123 |
| `05-ocr` | PDF sem camada de texto | Acionamento do OCR |
| `06-incompleto` | PDF textual | Insuficiência de dados e ausência de invenção |

Os números de NIT e nomes usados nos documentos são marcadores inventados para testes.
