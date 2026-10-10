"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { listSavedCnisAnalyses, type SavedCnisAnalysis } from "@/lib/cnis-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [items, setItems] = useState<SavedCnisAnalysis[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");

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

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="border-2 shadow-sm transition-shadow hover:shadow-lg">
            <CardHeader className="space-y-2"><div className="flex items-start justify-between gap-4"><CardTitle className="flex min-w-0 items-center gap-2 text-lg"><FileText className="h-5 w-5 shrink-0 text-primary" /><span className="truncate">{item.fileName}</span></CardTitle><Badge variant="outline">{item.qualityScore}% leitura</Badge></div><p className="text-sm text-muted-foreground">{item.createdAt ? item.createdAt.toLocaleString("pt-BR") : "Data em processamento"}</p></CardHeader>
            <CardContent className="space-y-3"><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Tempo identificado</p><p className="font-bold">{item.tempoContribuicaoTotal}</p></div><div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">Carência potencial</p><p className="font-bold">{item.carenciaTotal} competências</p></div></div><p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
