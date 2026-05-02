"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { calculateRmiAction } from "@/app/actions";
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
import { Calculator, Loader2, ServerCrash, UploadCloud, Calendar, User, Lightbulb, FileSpreadsheet, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


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
          Calculando...
        </>
      ) : (
        <>
          <Calculator className="mr-2 h-4 w-4" />
          Calcular RMI
        </>
      )}
    </Button>
  );
}

export default function RmiCalculatorPage() {
  const [state, formAction] = useActionState(calculateRmiAction, initialState);
  const [cnisDocumentUri, setCnisDocumentUri] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();

  const isSubmitDisabled = !cnisDocumentUri || !birthDate;

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors || !state.data ? "Erro" : "Sucesso!",
        description: state.message,
        variant: state.errors || !state.data ? "destructive" : "default",
      });
    }
  }, [state]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Renda Mensal Inicial (RMI)</CardTitle>
          <CardDescription>
            Faça o upload do CNIS, preencha os dados do segurado e a IA irá extrair os salários, aplicar as regras e estimar o valor do benefício.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <input type="hidden" name="cnisDocumentUri" value={cnisDocumentUri} />
            <input type="hidden" name="birthDate" value={birthDate ? format(birthDate, "dd/MM/yyyy") : ""} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4"/> CNIS (.pdf, .jpg, .png)</Label>
                    <FileUploadCard onFileSelect={(_, dataUri) => setCnisDocumentUri(dataUri)} acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]} />
                    {state.errors?.cnisDocumentUri && <p className="text-sm text-destructive">{state.errors.cnisDocumentUri[0]}</p>}
                </div>
                <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !birthDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                mode="single"
                                selected={birthDate}
                                onSelect={setBirthDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {state.errors?.birthDate && <p className="text-sm text-destructive">{state.errors.birthDate[0]}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Gênero</Label>
                        <RadioGroup name="gender" className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Masculino</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Feminino</Label>
                            </div>
                        </RadioGroup>
                         {state.errors?.gender && <p className="text-sm text-destructive">{state.errors.gender[0]}</p>}
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={isSubmitDisabled} />
          </CardFooter>
        </form>
      </Card>

       {state.message && (state.errors || !state.data) && (
         <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Falha no Cálculo</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      {state.data && (
        <>
          {/* Resultado Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">RMI Estimada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">{formatCurrency(state.data.rmiValue)}</p>
                <p className="text-xs text-gray-600 mt-2">Renda Mensal Inicial</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Média Salarial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(state.data.averageSalary)}</p>
                <p className="text-xs text-gray-600 mt-2">Últimos 80% maiores salários</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tempo de Contribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{state.data.contributionTime}</p>
                <p className="text-xs text-gray-600 mt-2">Total acumulado</p>
              </CardContent>
            </Card>
          </div>

          {/* Elegibilidade */}
          <Card className={state.data.retirementEligibility.isEligible ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {state.data.retirementEligibility.isEligible ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-yellow-600" />}
                Elegibilidade para Aposentadoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={state.data.retirementEligibility.isEligible ? 'default' : 'secondary'} className="mt-1">
                    {state.data.retirementEligibility.isEligible ? 'Elegível' : 'Não Elegível'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Aposentadoria</p>
                  <p className="text-sm font-semibold mt-1">{state.data.retirementEligibility.retirementType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Restante</p>
                  <p className="text-sm font-semibold mt-1">
                    {state.data.retirementEligibility.yearsUntilRetirement === 0 
                      ? 'Pronto para se aposentar' 
                      : `${state.data.retirementEligibility.yearsUntilRetirement} ano(s)`}
                  </p>
                </div>
              </div>

              {state.data.retirementEligibility.missingRequirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Requisitos Faltantes</p>
                  <ul className="space-y-1">
                    {state.data.retirementEligibility.missingRequirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-700">• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Abas com Detalhes */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
              <CardDescription>Cenários, cálculos e recomendações</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="cenarios">Cenários</TabsTrigger>
                  <TabsTrigger value="calculo">Cálculo</TabsTrigger>
                  <TabsTrigger value="contribuicoes">Contribuições</TabsTrigger>
                  <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
                </TabsList>

                {/* Aba Resumo */}
                <TabsContent value="resumo" className="space-y-4">
                  <Alert variant="default" className="bg-muted/50">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Resumo e Observações da IA</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{state.data.summary}</p>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Aba Cenários */}
                <TabsContent value="cenarios" className="space-y-4">
                  <div className="space-y-3">
                    {state.data.scenarios.map((scenario, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> {scenario.name}
                          </CardTitle>
                          <CardDescription>{scenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">RMI Estimada</p>
                              <p className="text-xl font-bold text-blue-600">{formatCurrency(scenario.estimatedRmi)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Tempo até Aposentadoria</p>
                              <p className="text-xl font-bold">{scenario.yearsToRetirement} ano(s)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Aba Cálculo */}
                <TabsContent value="calculo" className="space-y-4">
                  <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Detalhes do Cálculo</AlertTitle>
                    <AlertDescription className="mt-2 text-blue-800 space-y-2">
                      <div>
                        <p className="font-semibold">Fórmula Aplicada:</p>
                        <p className="text-sm">{state.data.calculationFactors.calculationFormula}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Divisor (meses):</p>
                        <p className="text-sm">{state.data.calculationFactors.divisor}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Fator Previdenciário:</p>
                        <p className="text-sm">{state.data.calculationFactors.contributionFactor.toFixed(4)}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Aba Contribuições */}
                <TabsContent value="contribuicoes" className="space-y-4">
                  <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                          <TableHead>Competência</TableHead>
                          <TableHead className="text-right">Salário de Contribuição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.data.contributions.map((c, index) => (
                          <TableRow key={index}>
                            <TableCell>{c.competence}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(c.salary)}</TableCell>
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
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900">Recomendação {index + 1}</AlertTitle>
                        <AlertDescription className="text-blue-800">
                          {rec}
                        </AlertDescription>
                      </Alert>
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
