"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { analyzeRetirementAction } from "@/app/actions";
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
import { Calculator, Clock, FileClock, Loader2, ServerCrash, User, Calendar, ListChecks, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateContributionPeriod, sumContributionPeriods, type ContributionTime } from "@/lib/calculation-engine";
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
          Analisando e Calculando...
        </>
      ) : (
        <>
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Tempo de Contribuição
        </>
      )}
    </Button>
  );
}

function TimeDisplay({ time }: { time: ContributionTime }) {
    return (
        <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">{time.years}</span>
            <span className="text-lg text-muted-foreground">anos,</span>
            <span className="text-4xl font-bold text-primary">{time.months}</span>
            <span className="text-lg text-muted-foreground">meses e</span>
            <span className="text-4xl font-bold text-primary">{time.days}</span>
            <span className="text-lg text-muted-foreground">dias</span>
        </div>
    )
}


export default function CalculatorPage() {
  const [state, formAction] = useActionState(analyzeRetirementAction, initialState);
  const [cnisUri, setCnisUri] = useState("");
  const [papUri, setPapUri] = useState("");
  const [pppUri, setPppUri] = useState("");

  const isSubmitDisabled = !cnisUri && !papUri && !pppUri;


  const totalContributionTime = useMemo<ContributionTime | null>(() => {
    if (!state.data?.vinculos) return null;

    const periods = state.data.vinculos.map(v => {
        // Here you could apply multipliers for special periods (e.g., 1.4 for men)
        const factor = v.type === 'especial' ? 1.0 : 1.0; // Placeholder for special time factor
        const periodTime = calculateContributionPeriod(v.startDate, v.endDate);
        return {
            years: periodTime.years * factor,
            months: periodTime.months * factor,
            days: periodTime.days * factor,
        };
    });

    return sumContributionPeriods(periods);
  }, [state.data]);

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
          <CardTitle>Calculadora Previdenciária Completa</CardTitle>
          <CardDescription>
            Faça o upload dos documentos do segurado (CNIS, PAP, PPP). A IA irá extrair os vínculos e o sistema calculará o tempo total de contribuição.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
             <input type="hidden" name="cnisDocumentUri" value={cnisUri} />
             <input type="hidden" name="papDocumentUri" value={papUri} />
             <input type="hidden" name="pppDocumentUri" value={pppUri} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4"/> CNIS (.pdf, .jpg, .png)</Label>
                    <FileUploadCard onFileSelect={(_, dataUri) => setCnisUri(dataUri)} acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4"/> PAP (.pdf, .jpg, .png)</Label>
                    <FileUploadCard onFileSelect={(_, dataUri) => setPapUri(dataUri)} acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4"/> PPP (.pdf, .jpg, .png)</Label>
                    <FileUploadCard onFileSelect={(_, dataUri) => setPppUri(dataUri)} acceptedFileTypes={["application/pdf", "image/jpeg", "image/png"]} />
                </div>
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="additionalData">Informações Adicionais (Opcional)</Label>
              <Textarea
                id="additionalData"
                name="additionalData"
                placeholder="Se houver alguma informação extra que não está nos documentos, descreva aqui..."
                className="min-h-[100px]"
              />
            </div>
             {state.errors?.cnisDocumentUri && (
                <p className="text-sm text-destructive">{state.errors.cnisDocumentUri[0]}</p>
              )}
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={isSubmitDisabled} />
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

      {state.data && totalContributionTime && (
        <Card>
            <CardHeader>
                <CardTitle>Resultado do Cálculo</CardTitle>
                <CardDescription>Com base nos dados analisados, este é o tempo de contribuição calculado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                           <Clock className="w-5 h-5 text-primary" /> Tempo Total de Contribuição
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TimeDisplay time={totalContributionTime} />
                    </CardContent>
                 </Card>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileClock /> Vínculos Utilizados no Cálculo
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data de Início</TableHead>
                                    <TableHead>Data de Fim</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fator de Risco</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.data.vinculos.map((vinculo, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{vinculo.startDate}</TableCell>
                                        <TableCell>{vinculo.endDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={vinculo.type === 'especial' ? 'destructive' : 'secondary'}>
                                                {vinculo.type === 'especial' ? 'Especial' : 'Comum'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{vinculo.fatorRisco || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Alert variant="default">
                    <ListChecks className="h-4 w-4" />
                    <AlertTitle>Observações Importantes para o Processo</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="leading-relaxed whitespace-pre-wrap">{state.data.observacoes}</p>
                    </AlertDescription>
                </Alert>

            </CardContent>
        </Card>
      )}
    </div>
  );
}
