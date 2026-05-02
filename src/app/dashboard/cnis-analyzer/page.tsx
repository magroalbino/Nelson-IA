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
import { FileScan, Loader2, ServerCrash, Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, Target } from "lucide-react";
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
    <Button type="submit" disabled={pending || disabled} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando...
        </>
      ) : (
        <>
          <FileScan className="mr-2 h-4 w-4"/>
          Analisar CNIS
        </>
      )}
    </Button>
  );
}

function getRiskColor(level: string) {
  switch(level) {
    case 'baixo': return 'bg-green-100 text-green-800 border-green-300';
    case 'médio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'alto': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getSeverityColor(severity: string) {
  switch(severity) {
    case 'baixa': return 'default';
    case 'média': return 'secondary';
    case 'alta': return 'destructive';
    default: return 'default';
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
            Faça o upload do documento CNIS (em formato PDF ou imagem). A IA irá identificar pendências, sugerir ações e fornecer um resumo estratégico completo.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
             <input type="hidden" name="cnisDocumentUri" value={cnisDocumentUri} />
             <FileUploadCard 
                onFileSelect={handleFileSelect}
                acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
             />
              {state.errors?.cnisDocumentUri && (
                <p className="text-sm text-destructive mt-2">{state.errors.cnisDocumentUri[0]}</p>
              )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton disabled={!cnisDocumentUri} />
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
        <>
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`border-2 ${getRiskColor(state.data.riskLevel)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Nível de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">{state.data.riskLevel}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Score de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{state.data.qualityScore}%</p>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{width: `${state.data.qualityScore}%`}}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={state.data.riskLevel === 'baixo' ? 'default' : 'secondary'}>
                  {state.data.contributionStatus}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{state.data.pendencies.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal em Abas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileScan /> Relatório de Análise do CNIS
              </CardTitle>
              <CardDescription>Análise detalhada com recomendações estratégicas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="pendencias">Pendências</TabsTrigger>
                  <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
                  <TabsTrigger value="proximos">Próximos Passos</TabsTrigger>
                </TabsList>

                {/* Aba Resumo */}
                <TabsContent value="resumo" className="space-y-4">
                  <Alert variant="default" className="bg-muted/50">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Resumo Estratégico da IA</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{state.data.summary}</p>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Aba Pendências */}
                <TabsContent value="pendencias" className="space-y-4">
                  {state.data.pendencies.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Indicador</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Ação Recomendada</TableHead>
                            <TableHead className="w-[80px]">Severidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {state.data.pendencies.map((p, index) => (
                            <TableRow key={index}>
                              <TableCell><Badge variant="outline">{p.indicator}</Badge></TableCell>
                              <TableCell className="text-sm">{p.description}</TableCell>
                              <TableCell className="text-sm font-medium">{p.recommendedAction}</TableCell>
                              <TableCell>
                                <Badge variant={getSeverityColor(p.severity)}>
                                  {p.severity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Nenhuma Pendência Encontrada</AlertTitle>
                      <AlertDescription>
                        A análise não identificou nenhum indicador de pendência no CNIS fornecido. O extrato parece estar regular.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Aba Recomendações */}
                <TabsContent value="recomendacoes" className="space-y-4">
                  <div className="space-y-3">
                    {state.data.recommendations.map((rec, index) => (
                      <Alert key={index} className="border-blue-200 bg-blue-50">
                        <Target className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900">Recomendação {index + 1}</AlertTitle>
                        <AlertDescription className="text-blue-800">
                          {rec}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </TabsContent>

                {/* Aba Próximos Passos */}
                <TabsContent value="proximos" className="space-y-4">
                  <div className="space-y-3">
                    {state.data.nextSteps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
