"use client";

import React, { useActionState, useEffect, useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileScan, Loader2, ServerCrash, Lightbulb, AlertTriangle, CheckCircle2, Target, Info, ArrowDownCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
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
  switch(level) {
    case 'baixo': return 'bg-green-50 text-green-700 border-green-200';
    case 'médio': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'alto': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-700';
  }
}

function getSeverityBadge(severity: string) {
  switch(severity) {
    case 'baixa': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Leve</Badge>;
    case 'média': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Atenção</Badge>;
    case 'alta': return <Badge variant="destructive" className="font-bold">Urgente</Badge>;
    default: return <Badge variant="outline">{severity}</Badge>;
  }
}

export default function CnisAnalyzerPage() {
  const [state, formAction] = useActionState(analyzeCnisAction, initialState);
  const [cnisDocumentUri, setCnisDocumentUri] = useState("");

  const handleFileSelect = (file: File | null, dataUri: string) => {
    setCnisDocumentUri(dataUri);
  };
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors || !state.data ? "Ops!" : "Sucesso!",
        description: state.message,
        variant: state.errors || !state.data ? "destructive" : "default",
      });
    }
  }, [state]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-primary">Análise do seu CNIS</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Envie o PDF do seu CNIS (extrato de contribuições) e nós explicaremos tudo de forma simples.
        </p>
      </header>

      <Card className="border-2 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-4 border-b text-center flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary/80 uppercase tracking-wider">Passo Único</span>
        </div>
        <form action={formAction}>
          <CardContent className="pt-8">
             <input type="hidden" name="cnisDocumentUri" value={cnisDocumentUri} />
             <FileUploadCard 
                onFileSelect={handleFileSelect}
                acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
             />
              {state.errors?.cnisDocumentUri && (
                <p className="text-lg text-destructive font-bold text-center mt-4">{state.errors.cnisDocumentUri[0]}</p>
              )}
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <SubmitButton disabled={!cnisDocumentUri} />
          </CardFooter>
        </form>
      </Card>

      {state.message && (state.errors || !state.data) && (
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
          <div className="flex items-center gap-3 text-2xl font-bold text-primary px-2">
            <ArrowDownCircle className="animate-bounce" />
            Veja o que encontramos:
          </div>

          {/* Resumo Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`border-2 shadow-sm ${getRiskColor(state.data.riskLevel)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold uppercase opacity-70">Risco de Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black capitalize">{state.data.riskLevel}</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 shadow-sm bg-blue-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold uppercase text-blue-700 opacity-70">Qualidade dos Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-black text-blue-700">{state.data.qualityScore}%</p>
                  <div className="flex-1 h-3 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{width: `${state.data.qualityScore}%`}}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm bg-purple-50 border-purple-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold uppercase text-purple-700 opacity-70">Pendências</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-purple-700">{state.data.pendencies.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Relatório Principal */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <FileScan className="w-7 h-7 text-primary" /> Relatório Simplificado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-none">
                  <TabsTrigger value="resumo" className="py-4 text-base font-bold">O Resumo</TabsTrigger>
                  <TabsTrigger value="pendencias" className="py-4 text-base font-bold">Problemas ({state.data.pendencies.length})</TabsTrigger>
                  <TabsTrigger value="recomendacoes" className="py-4 text-base font-bold">Dicas</TabsTrigger>
                  <TabsTrigger value="proximos" className="py-4 text-base font-bold">O que fazer?</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
                    {/* Aba Resumo */}
                    <TabsContent value="resumo" className="mt-0 space-y-6">
                      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/10">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary">
                            <Lightbulb className="w-6 h-6" /> Entenda sua situação:
                        </h3>
                        <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
                          {state.data.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Status Atual: <strong>{state.data.contributionStatus}</strong></p>
                      </div>
                    </TabsContent>

                    {/* Aba Pendências */}
                    <TabsContent value="pendencias" className="mt-0 space-y-6">
                      {state.data.pendencies.length > 0 ? (
                        <div className="space-y-4">
                          {state.data.pendencies.map((p, index) => (
                            <div key={index} className="border-2 rounded-2xl p-6 hover:border-primary/30 transition-colors bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="text-sm px-3 py-1">{p.indicator}</Badge>
                                        {getSeverityBadge(p.severity)}
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium italic">
                                        {p.relatedPeriods.join(', ')}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold mb-2">{p.description}</h4>
                                <div className="bg-muted/30 p-4 rounded-xl mt-4 border-l-4 border-primary">
                                    <p className="text-base font-semibold text-primary mb-1">Ação Recomendada:</p>
                                    <p className="text-base">{p.recommendedAction}</p>
                                </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-green-50 rounded-3xl border-2 border-green-100">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-green-800">Tudo em ordem!</h3>
                          <p className="text-lg text-green-700 max-w-md mx-auto">
                            Não encontramos problemas graves no seu CNIS. Suas contribuições parecem estar corretas.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Aba Recomendações */}
                    <TabsContent value="recomendacoes" className="mt-0 space-y-4">
                      {state.data.recommendations.map((rec, index) => (
                        <div key={index} className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-100">
                          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                            {index + 1}
                          </div>
                          <p className="text-lg text-blue-900 leading-snug font-medium">{rec}</p>
                        </div>
                      ))}
                    </TabsContent>

                    {/* Aba Próximos Passos */}
                    <TabsContent value="proximos" className="mt-0 space-y-4">
                      <div className="grid gap-4">
                        {state.data.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-5 p-6 border-2 rounded-2xl bg-white hover:bg-muted/20 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Target className="w-6 h-6" />
                            </div>
                            <p className="text-lg font-bold text-foreground/90">{step}</p>
                          </div>
                        ))}
                      </div>
                      <Alert className="mt-8 bg-primary/5 border-primary/20 p-6 rounded-2xl">
                        <Gavel className="w-6 h-6 text-primary" />
                        <AlertTitle className="text-lg font-bold mb-2">Dica para Advogados</AlertTitle>
                        <AlertDescription className="text-base">
                          Utilize o <strong>Gerador de Petições</strong> no menu lateral para criar um requerimento de acerto de CNIS fundamentado com base nestas pendências.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
