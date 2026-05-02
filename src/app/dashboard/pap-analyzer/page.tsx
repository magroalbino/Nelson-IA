"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { analyzePapAction } from "@/app/actions";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { FileBriefcase, Loader2, ServerCrash, AlertTriangle, TrendingUp, CheckCircle2, Target, DollarSign, Calendar } from "lucide-react";

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
          <FileBriefcase className="mr-2 h-4 w-4" />
          Analisar PAP
        </>
      )}
    </Button>
  );
}

function getAlertVariant(type: string) {
  switch(type) {
    case 'error': return 'destructive';
    case 'warning': return 'default';
    case 'info': return 'default';
    default: return 'default';
  }
}

export default function PapAnalyzerPage() {
  const [state, formAction] = useActionState(analyzePapAction, initialState);
  const [papUri, setPapUri] = useState("");

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
          <CardTitle>Analisador de PAP</CardTitle>
          <CardDescription>
            Faça o upload do documento PAP (Perfil de Atividade Profissional) para análise estratégica do histórico de vínculos.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <input type="hidden" name="papDataUri" value={papUri} />
            <FileUploadCard 
              onFileSelect={(_, dataUri) => setPapUri(dataUri)}
              acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]}
            />
            {state.errors?.papDataUri && (
              <p className="text-sm text-destructive mt-2">{state.errors.papDataUri[0]}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton disabled={!papUri} />
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Período Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{state.data.totalPeriods}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Empregadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{state.data.totalEmployers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{state.data.averageSalary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{state.data.qualityIndicators}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {state.data.alerts && state.data.alerts.length > 0 && (
            <div className="space-y-2">
              {state.data.alerts.map((alert, index) => (
                <Alert key={index} variant={getAlertVariant(alert.type)}>
                  {alert.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {alert.type === 'info' && <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{alert.type === 'error' ? 'Erro' : alert.type === 'warning' ? 'Aviso' : 'Informação'}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Conteúdo Principal em Abas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBriefcase /> Análise Detalhada do PAP
              </CardTitle>
              <CardDescription>Histórico profissional e recomendações estratégicas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="vinculos">Vínculos</TabsTrigger>
                  <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                </TabsList>

                {/* Aba Resumo */}
                <TabsContent value="resumo" className="space-y-4">
                  <Alert variant="default" className="bg-muted/50">
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Resumo Estratégico</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{state.data.strategicSummary}</p>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Aba Vínculos */}
                <TabsContent value="vinculos" className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empregador</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead className="text-right">Salário</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.data.vínculos.map((vinculo, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{vinculo.empregador}</TableCell>
                            <TableCell>{vinculo.funcao}</TableCell>
                            <TableCell className="text-sm">
                              {vinculo.dataInicio} a {vinculo.dataFim}
                            </TableCell>
                            <TableCell className="text-sm">{vinculo.duration}</TableCell>
                            <TableCell className="text-right font-mono">{vinculo.salario}</TableCell>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Período Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{state.data.totalPeriods}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Salário Médio
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{state.data.averageSalary}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Indicadores de Qualidade</h4>
                    <p className="text-sm text-gray-600">{state.data.qualityIndicators}</p>
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
