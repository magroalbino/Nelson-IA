"use client";

import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileScan, Loader2, ServerCrash, Lightbulb, CheckCircle2, Target, Info, ArrowDownCircle, Clock, Calendar, Gavel, TrendingUp, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    <Button type="submit" disabled={pending || disabled} size="lg" className="h-16 px-8 text-xl font-bold shadow-lg">
      {pending ? (
        <>
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          Analisando seu CNIS...
        </>
      ) : (
        <>
          <FileScan className="mr-3 h-6 w-6"/>
          Analisar Agora
        </>
      )}
    </Button>
  );
}

function getRiskColor(level: string) {
  const l = level.toLowerCase();
  if (l.includes('baixo')) return 'bg-green-50 text-green-700 border-green-200';
  if (l.includes('médio')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (l.includes('alto')) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-50 text-gray-700';
}

function getSeverityBadge(severity: string) {
  const s = severity.toLowerCase();
  if (s.includes('baixa')) return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Leve</Badge>;
  if (s.includes('média')) return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Atenção</Badge>;
  if (s.includes('alta')) return <Badge variant="destructive" className="font-bold">Urgente</Badge>;
  return <Badge variant="outline">{severity}</Badge>;
}

export default function CnisAnalyzerPage() {
  const [state, setState] = useState<any>(initialState);
  const [cnisDocument, setCnisDocument] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setCnisDocument(file);
    setState(initialState);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cnisDocument || pending) return;
    setPending(true);
    setState(initialState);
    try {
      const formData = new FormData();
      formData.append("cnisDocument", cnisDocument, cnisDocument.name);
      const response = await fetch("/api/analyze-cnis", { method: "POST", body: formData });
      const result = await response.json();
      setState({ message: result.message, data: response.ok ? result.data : null, errors: response.ok ? {} : { cnisDocument: [result.message] } });
    } catch {
      setState({ message: "Não foi possível conectar ao servidor de análise.", data: null, errors: { cnisDocument: ["Erro de conexão"] } });
    } finally {
      setPending(false);
    }
  };
  
  useEffect(() => {
    if (state.message) {
      const hasErrors = Boolean(state.errors && Object.keys(state.errors).length > 0);
      toast({
        title: hasErrors || !state.data ? "Ops!" : "Sucesso!",
        description: state.message,
        variant: hasErrors || !state.data ? "destructive" : "default",
      });
    }
  }, [state]);

  const downloadReport = () => {
    if (!state.data) return;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 17;
    let y = 20;
    const blue = [37, 99, 235] as [number, number, number];
    const navy = [15, 23, 42] as [number, number, number];
    const slate = [71, 85, 105] as [number, number, number];
    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - 18) { pdf.addPage(); y = 20; }
    };
    const sectionTitle = (title: string) => {
      ensureSpace(14);
      pdf.setFillColor(...blue); pdf.roundedRect(margin, y - 5, 3, 8, 1, 1, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.setTextColor(...navy);
      pdf.text(title, margin + 8, y + 1); y += 12;
    };
    const paragraph = (text: string, size = 10.5) => {
      const lines = pdf.splitTextToSize(text || "Não informado.", pageWidth - margin * 2);
      ensureSpace(lines.length * 5 + 4);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(size); pdf.setTextColor(...slate);
      pdf.text(lines, margin, y); y += lines.length * 5 + 5;
    };
    const card = (x: number, top: number, width: number, label: string, value: string, color: [number, number, number]) => {
      pdf.setFillColor(248, 250, 252); pdf.setDrawColor(226, 232, 240); pdf.roundedRect(x, top, width, 28, 3, 3, "FD");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...slate); pdf.text(label.toUpperCase(), x + 5, top + 8);
      pdf.setFontSize(11); pdf.setTextColor(...color); pdf.text(pdf.splitTextToSize(value, width - 10).slice(0, 2), x + 5, top + 17);
    };

    pdf.setFillColor(...navy); pdf.rect(0, 0, pageWidth, 52, "F");
    pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(22); pdf.text("Nelson IA", margin, 20);
    pdf.setFontSize(16); pdf.text("Relatório de análise do CNIS", margin, 33);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(191, 219, 254); pdf.text("Análise informativa e estimativa previdenciária", margin, 43);
    y = 68;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(...navy); pdf.text("Resumo rápido", margin, y); y += 8;
    const gap = 4; const cardWidth = (pageWidth - margin * 2 - gap * 3) / 4;
    card(margin, y, cardWidth, "Tempo total", state.data.tempoContribuicaoTotal || "Não identificado", blue);
    card(margin + cardWidth + gap, y, cardWidth, "Competências identificadas", `${state.data.competenciasIdentificadas ?? state.data.carenciaTotal ?? 0} meses`, [14, 116, 144]);
    card(margin + (cardWidth + gap) * 2, y, cardWidth, "Risco", state.data.riskLevel || "Não identificado", [217, 119, 6]);
    card(margin + (cardWidth + gap) * 3, y, cardWidth, "Qualidade", `${state.data.qualityScore ?? "—"}%`, [5, 150, 105]);
    y += 40;
    sectionTitle("Progresso para aposentadoria");
    paragraph(state.data.estimativaAposentadoria || "Estimativa não identificada.");
    const progress = Math.max(0, Math.min(100, Number(state.data.progressoAposentadoria) || 0));
    pdf.setFillColor(226, 232, 240); pdf.roundedRect(margin, y, pageWidth - margin * 2, 7, 3, 3, "F");
    pdf.setFillColor(...blue); pdf.roundedRect(margin, y, (pageWidth - margin * 2) * progress / 100, 7, 3, 3, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...blue); pdf.text(`${progress}% concluído`, margin, y + 14); y += 24;
    sectionTitle("Resumo da análise"); paragraph(state.data.summary);
    sectionTitle("Pendências identificadas");
    if (state.data.pendencies?.length) state.data.pendencies.forEach((p: any) => { paragraph(`[${p.indicator || "Atenção"}] ${p.description}`, 10.5); paragraph(`Ação recomendada: ${p.recommendedAction}`, 9.5); });
    else paragraph("Nenhuma pendência relevante foi identificada no documento.");
    sectionTitle("Recomendações"); (state.data.recommendations || []).forEach((item: string, index: number) => paragraph(`${index + 1}. ${item}`));
    sectionTitle("Próximos passos"); (state.data.nextSteps || []).forEach((item: string, index: number) => paragraph(`${index + 1}. ${item}`));
    ensureSpace(18); pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(...slate);
    pdf.text("Aviso: esta análise é uma estimativa informativa e não substitui a avaliação de um profissional previdenciário.", margin, y);
    pdf.save("relatorio-cnis-nelson-ia.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {!state.data && (
        <>
      <header className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-primary">Análise do seu CNIS</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Envie o PDF do seu CNIS e o Nelson calculará seu tempo de contribuição e identificará pendências.
        </p>
      </header>

      <Card className="border-2 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-4 border-b text-center flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary/80 uppercase tracking-wider">Passo Único</span>
        </div>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-8">
             <FileUploadCard 
                name="cnisDocument"
                onFileSelect={handleFileSelect}
                acceptedFileTypes={["application/pdf"]}
                maxSizeMB={25}
             />
              {state.errors?.cnisDocument && (
                <p className="text-lg text-destructive font-bold text-center mt-4">{state.errors.cnisDocument[0]}</p>
              )}
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <SubmitButton disabled={!cnisDocument} pending={pending} />
          </CardFooter>
        </form>
      </Card>
        </>
      )}

      {state.message && !state.data && state.errors && Object.keys(state.errors).length > 0 && (
         <Alert variant="destructive" className="border-2">
          <ServerCrash className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Não conseguimos analisar</AlertTitle>
          <AlertDescription className="text-base">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Análise concluída</p>
              <h1 className="text-3xl md:text-4xl font-black text-primary">Relatório do seu CNIS</h1>
              <p className="text-muted-foreground mt-1">Confira os resultados estimados e salve uma cópia se desejar.</p>
            </div>
            <Button type="button" onClick={downloadReport} size="lg" className="font-bold shadow-md">
              <Download className="mr-2 h-5 w-5" /> Baixar análise
            </Button>
          </div>
          
          {/* Dashboard de Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 shadow-sm bg-primary/5 border-primary/10">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-xs font-bold uppercase opacity-60 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Tempo Total
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-black text-primary leading-tight">{state.data.tempoContribuicaoTotal || "Não identificado"}</p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm bg-blue-50 border-blue-100">
              <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs font-bold uppercase text-blue-700 opacity-60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Competências identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-black text-blue-700">{state.data.competenciasIdentificadas ?? state.data.carenciaTotal ?? 0} meses</p>
                <p className="mt-1 text-xs text-blue-700/70">Contagem preliminar no texto</p>
              </CardContent>
            </Card>

            <Card className={`border-2 shadow-sm ${getRiskColor(state.data.riskLevel)}`}>
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-xs font-bold uppercase opacity-60 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Nível de Risco
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-black capitalize">{state.data.riskLevel}</p>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm bg-orange-50 border-orange-100">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-xs font-bold uppercase text-orange-700 opacity-60 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-black text-orange-700">{state.data.qualityScore}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Card de Progresso da Aposentadoria */}
          <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-black flex items-center gap-2">
                            <Target className="w-6 h-6 text-primary" /> Seu Progresso
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            {state.data.estimativaAposentadoria}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-primary">{state.data.progressoAposentadoria}%</span>
                        <p className="text-xs font-bold uppercase opacity-60">Concluído</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full h-6 bg-primary/10 rounded-full overflow-hidden border-2 border-primary/5 p-1">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                        style={{width: `${state.data.progressoAposentadoria}%`}}
                    />
                </div>
            </CardContent>
          </Card>

          {/* Relatório Detalhado */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <Tabs defaultValue="resumo" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-none border-b">
                <TabsTrigger value="resumo" className="py-4 text-base font-bold">O Resumo</TabsTrigger>
                <TabsTrigger value="pendencias" className="py-4 text-base font-bold">Problemas ({state.data.pendencies.length})</TabsTrigger>
                <TabsTrigger value="recomendacoes" className="py-4 text-base font-bold">Dicas</TabsTrigger>
                <TabsTrigger value="proximos" className="py-4 text-base font-bold">O que fazer?</TabsTrigger>
              </TabsList>

              <div className="p-6 md:p-8">
                  {/* Aba Resumo */}
                  <TabsContent value="resumo" className="mt-0 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border-2 border-primary/10 shadow-sm">
                      <h3 className="text-2xl font-black flex items-center gap-3 mb-6 text-primary">
                          <Lightbulb className="w-8 h-8" /> Entenda sua situação:
                      </h3>
                      <p className="text-xl leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium">
                        {state.data.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-5 bg-yellow-50 rounded-2xl border-2 border-yellow-100 text-yellow-800">
                      <Info className="w-6 h-6 flex-shrink-0" />
                      <p className="text-lg font-bold italic leading-tight">Status Atual: <span className="underline decoration-yellow-400">{state.data.contributionStatus}</span></p>
                    </div>
                  </TabsContent>

                  {/* Aba Pendências */}
                  <TabsContent value="pendencias" className="mt-0 space-y-6">
                    {state.data.pendencies.length > 0 ? (
                      <div className="space-y-4">
                        {state.data.pendencies.map((p: any, index: number) => (
                          <div key={index} className="border-2 rounded-2xl p-6 hover:border-primary/30 transition-all bg-white shadow-sm group">
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                  <div className="flex items-center gap-2">
                                      <Badge className="text-sm px-3 py-1 font-bold">{p.indicator}</Badge>
                                      {getSeverityBadge(p.severity)}
                                  </div>
                                  <span className="text-sm text-muted-foreground font-bold flex items-center gap-1">
                                      <Calendar className="w-4 h-4" /> {p.relatedPeriods.join(', ')}
                                  </span>
                              </div>
                              <h4 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">{p.description}</h4>
                              <div className="bg-muted/30 p-5 rounded-2xl mt-4 border-l-8 border-primary">
                                  <p className="text-sm font-black text-primary uppercase tracking-wider mb-2">Ação Recomendada:</p>
                                  <p className="text-lg font-medium leading-snug">{p.recommendedAction}</p>
                              </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-green-50 rounded-[3rem] border-4 border-dashed border-green-200">
                        <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
                        <h3 className="text-3xl font-black text-green-800 mb-2">Tudo em ordem!</h3>
                        <p className="text-xl text-green-700 max-w-md mx-auto font-medium">
                          Não encontramos problemas graves no seu CNIS. Suas contribuições parecem estar corretas.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Aba Recomendações */}
                  <TabsContent value="recomendacoes" className="mt-0 space-y-4">
                    {state.data.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex gap-5 p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-100 items-start">
                        <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xl shadow-md">
                          {index + 1}
                        </div>
                        <p className="text-xl text-blue-900 leading-snug font-bold">{rec}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Aba Próximos Passos */}
                  <TabsContent value="proximos" className="mt-0 space-y-6">
                    <div className="grid gap-4">
                      {state.data.nextSteps.map((step: string, index: number) => (
                        <div key={index} className="flex items-center gap-6 p-6 border-2 rounded-2xl bg-white hover:bg-primary/5 hover:border-primary/30 transition-all group cursor-default">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Target className="w-8 h-8" />
                          </div>
                          <p className="text-xl font-black text-foreground/90">{step}</p>
                        </div>
                      ))}
                    </div>
                    <Alert className="mt-10 bg-primary/5 border-primary/20 p-8 rounded-3xl">
                      <Gavel className="w-8 h-8 text-primary" />
                      <div className="ml-4">
                        <AlertTitle className="text-xl font-black mb-3 text-primary">Dica Profissional</AlertTitle>
                        <AlertDescription className="text-lg font-medium leading-relaxed">
                          Para advogados: Utilize o <strong>Gerador de Petições</strong> no menu lateral para criar um requerimento de acerto de CNIS fundamentado com base nestas pendências.
                        </AlertDescription>
                      </div>
                    </Alert>
                  </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}
