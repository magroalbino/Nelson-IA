"use client";

import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { deleteSavedCnisAnalysis, listSavedCnisAnalyses, type SavedCnisAnalysis } from "@/lib/cnis-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, RefreshCw, ShieldAlert, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function HistoryPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [items, setItems] = useState<SavedCnisAnalysis[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedCnisAnalysis | null>(null);

  const loadItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    setError("");
    try {
      setItems(await listSavedCnisAnalyses(user));
    } catch (loadError) {
      console.error("[CNIS] Falha ao carregar histórico:", loadError);
      setError("Não foi possível carregar seu histórico. Verifique as regras do Firestore e tente novamente.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async (item: SavedCnisAnalysis) => {
    if (!user || deletingId) return;
    const confirmed = window.confirm(`Excluir a análise ${item.fileName}? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setDeletingId(item.id);
    setError("");
    try {
      await deleteSavedCnisAnalysis(user, item.id);
      setItems((current) => current.filter((analysis) => analysis.id !== item.id));
    } catch (deleteError) {
      console.error("[CNIS] Falha ao excluir análise:", deleteError instanceof Error ? deleteError.name : "erro operacional");
      setError("Não foi possível excluir esta análise. Verifique as regras do Firestore e tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadSavedPdf = (item: SavedCnisAnalysis) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 17;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20;
    const analysis = item.analysis as any;
    const structured = analysis.structured || {};
    const findings = Array.isArray(analysis.auditFindings) ? analysis.auditFindings : [];
    const timeline = Array.isArray(analysis.timeline) ? analysis.timeline : [];
    const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
    const nextSteps = Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [];

    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - margin) {
        pdf.addPage();
        y = 20;
      }
    };
    const write = (text: string, size = 10, bold = false) => {
      const lines = pdf.splitTextToSize(String(text || ""), pageWidth - margin * 2);
      ensureSpace(lines.length * (size * 0.48) + 5);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(35, 45, 65);
      pdf.text(lines, margin, y);
      y += lines.length * (size * 0.48) + 5;
    };
    const heading = (text: string) => { ensureSpace(14); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.setTextColor(20, 87, 170); pdf.text(text, margin, y); y += 8; };

    pdf.setFillColor(20, 87, 170);
    pdf.rect(0, 0, pageWidth, 12, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("NELSON IA · ANÁLISE SALVA", margin, 8);
    y = 24;
    write("Relatório de análise do CNIS", 20, true);
    write(`${item.fileName} · ${item.createdAt ? item.createdAt.toLocaleString("pt-BR") : "Data não identificada"}`, 9);
    heading("Resumo");
    write(item.summary, 10);
    heading("Indicadores principais");
    write(`Tempo identificado: ${item.tempoContribuicaoTotal}`);
    write(`Carência potencial: ${item.carenciaTotal} competências`);
    write(`Qualidade da leitura: ${item.qualityScore}%`);
    write(`Vínculos: ${Array.isArray(structured.employments) ? structured.employments.length : 0} · Contribuições: ${Array.isArray(structured.contributions) ? structured.contributions.length : 0} · Benefícios: ${Array.isArray(structured.benefits) ? structured.benefits.length : 0}`);
    if (findings.length) { heading("Pontos para conferir"); findings.forEach((finding: any, index: number) => write(`${index + 1}. ${finding.title || finding.description || "Ponto identificado"}`)); }
    if (timeline.length) { heading("Linha do tempo"); timeline.forEach((event: any) => write(`${event.title || "Evento"} — ${event.period || "Período não identificado"}. ${event.detail || ""}`)); }
    if (recommendations.length) { heading("Recomendações"); recommendations.forEach((value: string, index: number) => write(`${index + 1}. ${value}`)); }
    if (nextSteps.length) { heading("Próximos passos"); nextSteps.forEach((value: string, index: number) => write(`${index + 1}. ${value}`)); }
    ensureSpace(18);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(90, 100, 115);
    pdf.text("Relatório informativo. O PDF original do CNIS não é armazenado nesta análise.", margin, pageHeight - 12);
    pdf.save(`relatorio-cnis-${item.createdAt ? item.createdAt.toISOString().slice(0, 10) : "salvo"}.pdf`);
  };

  useEffect(() => {
    if (!loading && !user) router.replace("/account");
    if (user) void loadItems();
  }, [loading, user, router]);

  if (loading || (!user && !error)) {
    return <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /> Carregando sua conta...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <header className="space-y-3">
        <Badge variant="secondary" className="gap-2"><ShieldAlert className="h-3.5 w-3.5" /> Apenas dados estruturados</Badge>
        <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">Minhas análises salvas</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">As análises ficam associadas à sua conta. O PDF original não é enviado nem armazenado nesta etapa.</p>
      </header>

      {error && <Card className="border-destructive/40"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 text-destructive"><span>{error}</span><Button variant="outline" onClick={() => void loadItems()}><RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente</Button></CardContent></Card>}

      {!error && loadingItems && <div className="flex items-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Buscando análises...</div>}

      {!error && !loadingItems && !items.length && <Card><CardContent className="flex flex-col items-center gap-4 p-10 text-center"><FileText className="h-12 w-12 text-primary/50" /><h2 className="text-xl font-bold">Nenhuma análise salva ainda</h2><p className="max-w-md text-muted-foreground">Faça uma análise enquanto estiver conectado à sua conta para encontrá-la aqui.</p><Button asChild><Link href="/dashboard/cnis-analyzer">Analisar um CNIS</Link></Button></CardContent></Card>}

      {!error && !loadingItems && items.length > 0 && <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "análise salva" : "análises salvas"}. Selecione uma para visualizar os detalhes.</p>}

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="border-2 shadow-sm transition-shadow hover:shadow-lg">
            <CardHeader className="space-y-2"><div className="flex items-start justify-between gap-4"><CardTitle className="flex min-w-0 items-center gap-2 text-lg"><FileText className="h-5 w-5 shrink-0 text-primary" /><span className="truncate">{item.fileName}</span></CardTitle><Badge variant="outline">{item.qualityScore}% leitura</Badge></div><p className="text-sm text-muted-foreground">{item.createdAt ? item.createdAt.toLocaleString("pt-BR") : "Data em processamento"}</p></CardHeader>
            <CardContent className="space-y-3"><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Tempo identificado</p><p className="font-bold">{item.tempoContribuicaoTotal}</p></div><div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Carência potencial</p><p className="font-bold">{item.carenciaTotal} competências</p></div></div><p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Button type="button" variant="outline" onClick={() => setSelectedItem(item)}><Eye className="mr-2 h-4 w-4" />Visualizar</Button><Button type="button" variant="outline" onClick={() => downloadSavedPdf(item)}><Download className="mr-2 h-4 w-4" />Baixar PDF</Button><Button type="button" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={deletingId === item.id} onClick={() => void handleDelete(item)}><Trash2 className="mr-2 h-4 w-4" />{deletingId === item.id ? "Excluindo…" : "Excluir"}</Button></div></CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedItem && (() => {
            const analysis = selectedItem.analysis as any;
            const structured = analysis.structured || {};
            const findings = Array.isArray(analysis.auditFindings) ? analysis.auditFindings : [];
            const timeline = Array.isArray(analysis.timeline) ? analysis.timeline : [];
            return <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">Análise salva</DialogTitle>
                <DialogDescription>{selectedItem.fileName} · {selectedItem.createdAt ? selectedItem.createdAt.toLocaleString("pt-BR") : "Data em processamento"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Tempo</p><p className="mt-1 font-bold">{selectedItem.tempoContribuicaoTotal}</p></div>
                  <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Carência potencial</p><p className="mt-1 font-bold">{selectedItem.carenciaTotal} competências</p></div>
                  <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Qualidade</p><p className="mt-1 font-bold">{selectedItem.qualityScore}%</p></div>
                </div>
                <section className="space-y-2"><h3 className="font-bold">Resumo</h3><p className="text-sm leading-relaxed text-muted-foreground">{selectedItem.summary}</p></section>
                <Button type="button" onClick={() => downloadSavedPdf(selectedItem)} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" />Baixar relatório em PDF</Button>
                <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Vínculos</p><p className="text-2xl font-black">{Array.isArray(structured.employments) ? structured.employments.length : 0}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Contribuições</p><p className="text-2xl font-black">{Array.isArray(structured.contributions) ? structured.contributions.length : 0}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Benefícios</p><p className="text-2xl font-black">{Array.isArray(structured.benefits) ? structured.benefits.length : 0}</p></div></section>
                {findings.length > 0 && <section className="space-y-2"><h3 className="font-bold">Pontos para conferir</h3><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{findings.map((finding: any, index: number) => <li key={`${finding.title || "ponto"}-${index}`}>{finding.title || finding.description || "Ponto identificado"}</li>)}</ul></section>}
                {timeline.length > 0 && <section className="space-y-2"><h3 className="font-bold">Linha do tempo</h3><div className="space-y-2">{timeline.map((event: any, index: number) => <div key={`${event.title || "evento"}-${index}`} className="rounded-lg border p-3"><p className="font-semibold">{event.title || "Evento identificado"}</p><p className="text-sm text-muted-foreground">{event.period || "Período não identificado"} · {event.detail || ""}</p></div>)}</div></section>}
                <p className="text-xs text-muted-foreground">O PDF original não é armazenado. Esta visualização usa somente os dados estruturados salvos na sua conta.</p>
              </div>
            </>;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
