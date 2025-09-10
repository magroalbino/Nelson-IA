"use client";

import { useFormState, useFormStatus } from "react-dom";
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
import { CheckCircle2, FileClock, HeartPulse, HelpCircle, Loader2, ServerCrash, ShieldCheck, Tractor, XCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando Elegibilidade...
        </>
      ) : (
        "Analisar Elegibilidade"
      )}
    </Button>
  );
}

const EligibilityCard = ({ title, icon, result }: { title: string, icon: React.ReactNode, result: { isEligible: boolean; details: string; supportingDocuments: string[]; } }) => (
    <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2">{icon} {title}</CardTitle>
            </div>
            <Badge variant={result.isEligible ? 'default' : 'destructive'} className="flex gap-1 items-center">
                 {result.isEligible ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                {result.isEligible ? 'Elegível' : 'Não Elegível'}
            </Badge>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{result.details}</p>
            {result.supportingDocuments.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Documentos Chave</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                    {result.supportingDocuments.map((doc, i) => (
                       <Badge key={i} variant="secondary">{doc}</Badge>
                    ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
)

export default function RetirementAnalyzerPage() {
  const [state, formAction] = useFormState(analyzeRetirementAction, initialState);

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
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Analisador de Elegibilidade de Aposentadoria</CardTitle>
          <CardDescription>
            Consolide os dados do CNIS, PAP e PPP em um único campo para uma análise completa sobre a elegibilidade de aposentadoria do segurado.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="collectedData">Dados Consolidados do Segurado</Label>
              <Textarea
                id="collectedData"
                name="collectedData"
                placeholder="Cole aqui o resumo do CNIS, os vínculos do PAP e a análise do PPP..."
                className="min-h-[300px]"
              />
              {state.errors?.collectedData && (
                <p className="text-sm text-destructive">{state.errors.collectedData[0]}</p>
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
                <CardTitle>Resultado da Análise de Elegibilidade</CardTitle>
                <CardDescription>Com base nos dados fornecidos, este é o panorama previdenciário do segurado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Resumo da Situação Previdenciária</AlertTitle>
                    <AlertDescription>
                        {state.data.geralSummary}
                    </AlertDescription>
                </Alert>

                <Separator />
                
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                  <EligibilityCard title="Aposentadoria por Idade" icon={<Tractor size={20} />} result={state.data.retirementByAge} />
                  <EligibilityCard title="Aposentadoria por Tempo de Contribuição" icon={<FileClock size={20} />} result={state.data.retirementByContributionTime} />
                  <EligibilityCard title="Aposentadoria Especial" icon={<HeartPulse size={20} />} result={state.data.specialRetirement} />
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
