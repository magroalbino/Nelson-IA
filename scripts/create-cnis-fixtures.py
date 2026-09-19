from pathlib import Path
import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests" / "fixtures" / "cnis"
OUT.mkdir(parents=True, exist_ok=True)

DISCLAIMER = "DOCUMENTO FICTÍCIO PARA TESTES — NÃO É CNIS OFICIAL"

CASES = [
    {
        "id": "01-simples-texto",
        "title": "CNIS sintético simples com vínculo contínuo",
        "type": "text_pdf",
        "purpose": "Fluxo textual básico com um vínculo sem lacuna aparente.",
        "pages": [
            [DISCLAIMER, "EXTRATO SINTÉTICO DE INFORMAÇÕES PREVIDENCIÁRIAS", "Segurado: PESSOA TESTE 001", "NIT: 999.99999.99-9", "", "VÍNCULOS", "Empregador: EMPRESA FICTÍCIA ALFA", "Categoria: Empregado", "Período: 01/2018 a 12/2020", "Indicadores: nenhum informado", "", "CONTRIBUIÇÕES", "Competências: 01/2018, 02/2018, 03/2018, 04/2018, 05/2018, 06/2018", "Competências: 07/2018, 08/2018, 09/2018, 10/2018, 11/2018, 12/2018", "Competências: 01/2019 a 12/2020", "", "Este documento contém dados inventados para testes automatizados."],
        ],
        "expected": {"text_min": 250, "ocr": False, "competencies_include": ["01/2018", "12/2020"], "indicators_include": [], "periods": [{"start": "01/2018", "end": "12/2020", "page": 1}], "expected_alerts": []},
    },
    {
        "id": "02-lacuna",
        "title": "CNIS sintético com lacuna entre vínculos",
        "type": "text_pdf",
        "purpose": "Detecção futura de intervalo sem vínculo entre períodos.",
        "pages": [
            [DISCLAIMER, "EXTRATO SINTÉTICO DE INFORMAÇÕES PREVIDENCIÁRIAS", "Segurado: PESSOA TESTE 002", "NIT: 999.99999.99-8", "", "VÍNCULOS", "Empregador: EMPRESA FICTÍCIA BETA", "Categoria: Empregado", "Período: 01/2015 a 06/2017", "", "Empregador: EMPRESA FICTÍCIA GAMA", "Categoria: Empregado", "Período: 09/2017 a 12/2019", "", "CONTRIBUIÇÕES", "Competências: 01/2015, 02/2015, 03/2015, 04/2015, 05/2015, 06/2015", "Competências: 06/2017, 09/2017, 10/2017, 11/2017, 12/2017", "Competências posteriores registradas até 12/2019", "", "A lacuna entre 07/2017 e 08/2017 é intencional neste fixture."],
        ],
        "expected": {"text_min": 250, "ocr": False, "competencies_include": ["01/2015", "06/2017", "09/2017", "12/2019"], "indicators_include": [], "periods": [{"start": "01/2015", "end": "06/2017", "page": 1}, {"start": "09/2017", "end": "12/2019", "page": 1}], "expected_alerts": ["LACUNA"]},
    },
    {
        "id": "03-sobreposicao",
        "title": "CNIS sintético com períodos sobrepostos",
        "type": "text_pdf",
        "purpose": "Detecção futura de sobreposição entre dois vínculos.",
        "pages": [
            [DISCLAIMER, "EXTRATO SINTÉTICO DE INFORMAÇÕES PREVIDENCIÁRIAS", "Segurado: PESSOA TESTE 003", "NIT: 999.99999.99-7", "", "VÍNCULOS", "Empregador: EMPRESA FICTÍCIA DELTA", "Categoria: Empregado", "Período: 01/2019 a 08/2020", "", "Empregador: EMPRESA FICTÍCIA ÉPSILON", "Categoria: Contribuinte individual", "Período: 06/2020 a 12/2021", "", "CONTRIBUIÇÕES", "Competências: 01/2019 a 12/2021", "", "A sobreposição de 06/2020 a 08/2020 é intencional neste fixture.", "Este documento contém dados inventados para testes."],
        ],
        "expected": {"text_min": 250, "ocr": False, "competencies_include": ["01/2019", "12/2021"], "indicators_include": [], "periods": [{"start": "01/2019", "end": "08/2020", "page": 1}, {"start": "06/2020", "end": "12/2021", "page": 1}], "expected_alerts": ["SOBREPOSICAO"]},
    },
    {
        "id": "04-indicadores",
        "title": "CNIS sintético com indicadores de atenção",
        "type": "text_pdf",
        "purpose": "Verificação de captura de indicadores e geração de alerta, sem afirmar impacto jurídico.",
        "pages": [
            [DISCLAIMER, "EXTRATO SINTÉTICO DE INFORMAÇÕES PREVIDENCIÁRIAS", "Segurado: PESSOA TESTE 004", "NIT: 999.99999.99-6", "", "VÍNCULOS", "Empregador: EMPRESA FICTÍCIA ZETA", "Categoria: Empregado", "Período: 03/2010 a 02/2012", "Indicadores: PEXT, AEXT-VI", "", "CONTRIBUIÇÕES", "Competência: 03/2010 — indicador PEXT", "Competência: 04/2010 — indicador AEXT-VI", "Competência: 05/2010 — indicador IREC-LC123", "Competências adicionais até 02/2012", "", "Os indicadores são fictícios e não representam interpretação oficial do INSS."],
        ],
        "expected": {"text_min": 250, "ocr": False, "competencies_include": ["03/2010", "04/2010", "05/2010", "02/2012"], "indicators_include": ["PEXT", "AEXT-VI", "IREC-LC123"], "periods": [{"start": "03/2010", "end": "02/2012", "page": 1}], "expected_alerts": ["INDICADOR"]},
    },
    {
        "id": "05-ocr",
        "title": "CNIS sintético escaneado para fallback OCR",
        "type": "image_pdf",
        "purpose": "Garantir que um PDF sem camada de texto acione o OCR.",
        "pages": [[DISCLAIMER, "EXTRATO SINTÉTICO ESCANEADO", "Segurado: PESSOA TESTE 005", "NIT: 999.99999.99-5", "Vínculo: EMPRESA FICTÍCIA ETA", "Período: 02/2021 a 01/2023", "Competências: 02/2021, 03/2021, 04/2021, 05/2021", "Indicador: PEXT", "OCR deve recuperar este texto."]],
        "expected": {"text_min": 80, "ocr": True, "competencies_include": ["02/2021", "05/2021"], "indicators_include": ["PEXT"], "periods": [{"start": "02/2021", "end": "01/2023", "page": 1}], "expected_alerts": ["INDICADOR"]},
    },
    {
        "id": "06-incompleto",
        "title": "CNIS sintético incompleto e insuficiente",
        "type": "text_pdf",
        "purpose": "Verificar que o sistema admite insuficiência em vez de inventar dados.",
        "pages": [[DISCLAIMER, "EXTRATO SINTÉTICO PARCIAL", "Segurado: PESSOA TESTE 006", "NIT: 999.99999.99-4", "Vínculo sem datas legíveis.", "Competência: 07/2022", "Documento truncado para teste de limitação."]],
        "expected": {"text_min": 80, "ocr": False, "competencies_include": ["07/2022"], "indicators_include": [], "periods": [], "expected_alerts": ["DADOS_INSUFICIENTES"]},
    },
]


def write_text_pdf(path: Path, pages: list[list[str]]) -> None:
    pdf = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    for page_lines in pages:
        y = height - 20 * mm
        pdf.setFont("Helvetica-Bold", 11)
        for line_index, line in enumerate(page_lines):
            if line_index == 1:
                pdf.setFont("Helvetica-Bold", 13)
            elif line_index > 1:
                pdf.setFont("Helvetica", 10)
            pdf.drawString(18 * mm, y, line[:125])
            y -= 6 * mm
            if y < 18 * mm:
                pdf.showPage()
                y = height - 20 * mm
        pdf.showPage()
    pdf.save()


def write_image_pdf(path: Path, pages: list[list[str]]) -> None:
    images = []
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except OSError:
        font = bold = ImageFont.load_default()
    for page_lines in pages:
        image = Image.new("RGB", (1654, 2339), "white")
        draw = ImageDraw.Draw(image)
        y = 90
        for index, line in enumerate(page_lines):
            draw.text((95, y), line[:72], fill="black", font=bold if index in (0, 1) else font)
            y += 72 if index in (0, 1) else 58
        images.append(image)
    images[0].save(path, "PDF", resolution=150.0, save_all=True, append_images=images[1:])


for case in CASES:
    pdf_path = OUT / f"{case['id']}.pdf"
    if case["type"] == "image_pdf":
        write_image_pdf(pdf_path, case["pages"])
    else:
        write_text_pdf(pdf_path, case["pages"])
    metadata = {key: value for key, value in case.items() if key != "pages"}
    metadata["pdf"] = pdf_path.name
    (OUT / f"{case['id']}.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

(OUT / "README.md").write_text("""# Fixtures sintéticas de CNIS\n\nTodos os documentos desta pasta são **fictícios e sintéticos**. Não contêm dados de segurados reais, não reproduzem um documento oficial do INSS e não devem ser usados para fundamentar decisões previdenciárias.\n\nCada caso possui um PDF e um JSON com propósito, tipo de documento e expectativas mínimas para os testes. Os casos cobrem texto selecionável, lacuna, sobreposição, indicadores, fallback de OCR e documento incompleto.\n\n## Casos\n\n| Caso | Tipo | Objetivo |\n|---|---|---|\n| `01-simples-texto` | PDF textual | Fluxo básico com vínculo contínuo |\n| `02-lacuna` | PDF textual | Intervalo intencional entre vínculos |\n| `03-sobreposicao` | PDF textual | Períodos intencionalmente sobrepostos |\n| `04-indicadores` | PDF textual | Captura de PEXT, AEXT-VI e IREC-LC123 |\n| `05-ocr` | PDF sem camada de texto | Acionamento do OCR |\n| `06-incompleto` | PDF textual | Insuficiência de dados e ausência de invenção |\n\nOs números de NIT e nomes usados nos documentos são marcadores inventados para testes.\n""", encoding="utf-8")
print(f"Generated {len(CASES)} fixture cases in {OUT}")
