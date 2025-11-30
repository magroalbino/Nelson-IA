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
import { Calculator, Loader2, ServerCrash, UploadCloud, Calendar, User, Lightbulb, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <Card>
            <CardHeader>
                <CardTitle>Resultado do Cálculo de RMI</CardTitle>
                <CardDescription>A análise foi concluída. Abaixo estão os resultados detalhados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">RMI Estimada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(state.data.rmiValue)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Média Salarial</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{formatCurrency(state.data.averageSalary)}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tempo de Contribuição</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-xl font-semibold">{state.data.contributionTime}</p>
                        </CardContent>
                    </Card>
                 </div>
                
                 <Alert variant="default" className="bg-muted/50">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Resumo e Observações da IA</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="leading-relaxed whitespace-pre-wrap">{state.data.summary}</p>
                        <div className="mt-4 text-xs space-y-1">
                            <p><strong>Fórmula:</strong> {state.data.calculationFactors.calculationFormula}</p>
                            <p><strong>Divisor:</strong> {state.data.calculationFactors.divisor} meses</p>
                            <p><strong>Fator Previdenciário:</strong> {state.data.calculationFactors.contributionFactor}</p>
                        </div>
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileSpreadsheet /> Salários de Contribuição Utilizados
                    </h3>
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
                </div>

            </CardContent>
        </Card>
      )}
    </div>
  );
}
