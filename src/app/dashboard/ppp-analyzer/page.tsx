"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { analyzePppAction } from "@/app/actions";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUploadCard } from "@/components/file-upload-card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { FileText, Loader2, ServerCrash, AlertTriangle, CheckCircle2, Target, User, Building2, Zap } from "lucide-react";

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
          <FileText className="mr-2 h-4 w-4" />
          Analisar PPP
        </>
      )}
    </Button>
  );
}

function getRiskColor(level: string) {
  switch(level?.toLowerCase()) {
    case 'baixo': return 'bg-green-100 text-green-800 border-green-300';
    case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'alto': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function PppAnalyzerPage() {
  const [state, formAction] = useActionState(analyzePppAction, initialState);
  const [pppDocumentUri, setPppDocumentUri] = useState("");

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
          <CardTitle>Analisador de PPP</CardTitle>
          <CardDescription>
            Faça o upload do documento PPP (Perfil Profissiográfico Previdenciário) para análise de exposição a agentes nocivos e elegibilidade para aposentadoria especial.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <input type="hidden" name="pppDocumentUri" value={pppDocumentUri} />
            <FileUploadCard 
              onFileSelect={(_, dataUri) => setPppDocumentUri(dataUri)}
              acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
            />
            {state.errors?.pppDocumentUri && (
              <p className="text-sm text-destructive mt-2">{state.errors.pppDocumentUri[0]}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton disabled={!pppDocumentUri} />
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
          {/* Informações do Trabalhador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertTitle>Trabalhador</AlertTitle>
              <AlertDescription>{state.data.nomeTrabalhador}</AlertDescription>
            </Alert>
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertTitle>Empregador</AlertTitle>
              <AlertDescription>{state.data.empregador}</AlertDescription>
            </Alert>
          </div>

          {/* Elegibilidade para Aposentadoria Especial */}
          <Card className={`border-2 ${getRiskColor(state.data.elegibilidadeEspecial.isElegivel ? 'baixo' : 'alto')}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap /> Elegibilidade para Aposentadoria Especial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={state.data.elegibilidadeEspecial.isElegivel ? 'default' : 'destructive'} className="mt-1">
                    {state.data.elegibilidadeEspecial.isElegivel ? 'Elegível' : 'Não Elegível'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Especial Estimado</p>
                  <p className="text-lg font-semibold mt-1">{state.data.elegibilidadeEspecial.tempoEspecialEstimado}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Percentual de Conversão</p>
                  <p className="text-lg font-semibold mt-1">{(state.data.elegibilidadeEspecial.percentualConversao * 100).toFixed(0)}%</p>
                </div>
              </div>
              
              {state.data.elegibilidadeEspecial.agentesNocivos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Agentes Nocivos Identificados</p>
                  <div className="flex flex-wrap gap-2">
                    {state.data.elegibilidadeEspecial.agentesNocivos.map((agente, index) => (
                      <Badge key={index} variant="secondary">{agente}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avaliação de Risco */}
          <Card className={`border-2 ${getRiskColor(state.data.riskAssessment.riskLevel)}`}>
            <CardHeader>
              <CardTitle>Avaliação de Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nível de Risco</p>
                  <Badge variant="outline" className={`mt-1 ${getRiskColor(state.data.riskAssessment.riskLevel)}`}>
                    {state.data.riskAssessment.riskLevel?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Efetividade de Proteção</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{width: `${state.data.riskAssessment.protectionEffectiveness}%`}}
                      />
                    </div>
                    <span className="text-sm font-semibold">{state.data.riskAssessment.protectionEffectiveness}%</span>
                  </div>
                </div>
              </div>

              {state.data.riskAssessment.mainHazards.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Principais Riscos</p>
                  <div className="flex flex-wrap gap-2">
                    {state.data.riskAssessment.mainHazards.map((hazard, index) => (
                      <Badge key={index} variant="destructive">{hazard}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conteúdo Principal em Abas */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada do PPP</CardTitle>
              <CardDescription>Registros de exposição e recomendações</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="exposicao">Exposição</TabsTrigger>
                  <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                </TabsList>

                {/* Aba Resumo */}
                <TabsContent value="resumo" className="space-y-4">
                  <Alert variant="default" className="bg-muted/50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Resumo Geral</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{state.data.resumoGeral}</p>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Aba Exposição */}
                <TabsContent value="exposicao" className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Fator de Risco</TableHead>
                          <TableHead>Intensidade</TableHead>
                          <TableHead>Técnica</TableHead>
                          <TableHead>EPC</TableHead>
                          <TableHead>EPI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.data.registrosExposicao.map((registro, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm">{registro.periodo}</TableCell>
                            <TableCell className="font-medium">{registro.fatorDeRisco}</TableCell>
                            <TableCell className="text-sm">{registro.intensidade}</TableCell>
                            <TableCell className="text-sm">{registro.tecnicaUtilizada}</TableCell>
                            <TableCell>
                              <Badge variant={registro.epcEficaz === 'Sim' ? 'default' : 'destructive'}>
                                {registro.epcEficaz}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={registro.epiEficaz === 'Sim' ? 'default' : 'destructive'}>
                                {registro.epiEficaz}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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

                {/* Aba Detalhes */}
                <TabsContent value="detalhes" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Elegibilidade para Aposentadoria Especial</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {state.data.elegibilidadeEspecial.isElegivel 
                          ? 'Este trabalhador é elegível para aposentadoria especial com base na exposição comprovada a agentes nocivos.'
                          : 'Este trabalhador não atende aos critérios para aposentadoria especial com base nos registros do PPP.'}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Avaliação de Proteção</h4>
                      <p className="text-sm text-gray-600">
                        A efetividade geral das medidas de proteção (EPC/EPI) foi de {state.data.riskAssessment.protectionEffectiveness}%, 
                        indicando que as medidas de proteção foram {state.data.riskAssessment.protectionEffectiveness >= 80 ? 'adequadas' : 'insuficientes'} 
                        durante o período de exposição.
                      </p>
                    </div>
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
