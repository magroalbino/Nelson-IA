"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { analyzeCnisAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileScan, Loader2, ServerCrash, Lightbulb, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando...
        </>
      ) : (
        "Analisar CNIS"
      )}
    </Button>
  );
}

export default function CnisAnalyzerPage() {
  const [state, formAction] = useActionState(analyzeCnisAction, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors || !state.data ? "Erro" : "Sucesso!",
        description: state.message,
        variant: state.errors || !state.data ? "destructive" : "default",
      });
    }
  }, [state]);

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Analisador Estratégico de CNIS</CardTitle>
          <CardDescription>
            Copie e cole o conteúdo completo do CNIS (em formato de texto) abaixo. A IA irá identificar pendências, sugerir ações e fornecer um resumo estratégico completo.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="cnisData">Conteúdo do CNIS</Label>
              <Textarea
                id="cnisData"
                name="cnisData"
                placeholder="Cole o texto do seu CNIS aqui..."
                className="min-h-[300px] font-mono text-xs"
              />
              {state.errors?.cnisData && (
                <p className="text-sm text-destructive mt-2">{state.errors.cnisData[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.message && (state.errors || !state.data) && (
         <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Falha na Análise</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileScan /> Relatório de Análise do CNIS
            </CardTitle>
            <CardDescription>Abaixo estão os resultados detalhados e o resumo estratégico gerado pela IA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="text-destructive"/> Pendências e Indicadores Identificados</h3>
                {state.data.pendencies.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Indicador</TableHead>
                                    <TableHead>Descrição do Problema</TableHead>
                                    <TableHead>Ação Recomendada</TableHead>
                                    <TableHead>Períodos Afetados</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.data.pendencies.map((p, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Badge variant="destructive">{p.indicator}</Badge></TableCell>
                                        <TableCell className="text-sm">{p.description}</TableCell>
                                        <TableCell className="text-sm font-medium">{p.recommendedAction}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {p.relatedPeriods.map((period, i) => <Badge key={i} variant="secondary">{period}</Badge>)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
                        <AlertTitle>Nenhuma Pendência Encontrada</AlertTitle>
                        <AlertDescription>
                            A análise não identificou nenhum indicador de pendência no CNIS fornecido. O extrato parece estar regular.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
             
             <Alert variant="default" className="bg-muted/50">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Resumo Estratégico da IA</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="leading-relaxed whitespace-pre-wrap">{state.data.summary}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
