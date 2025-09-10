"use client";

import { useFormState, useFormStatus } from "react-dom";
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
import { FileScan, Loader2, ServerCrash, Terminal } from "lucide-react";
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
    <Button type="submit" disabled={pending}>
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
  const [state, formAction] = useFormState(analyzeCnisAction, initialState);

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: "Sucesso!",
        description: state.message,
      });
    } else if (state.message && state.errors) {
       toast({
        variant: "destructive",
        title: "Erro na Validação",
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Analisador Rápido de CNIS</CardTitle>
          <CardDescription>
            Copie e cole o conteúdo do seu CNIS (em formato de texto) abaixo
            para uma análise rápida de períodos, contribuições e
            inconsistências.
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
                className="min-h-[250px]"
              />
              {state.errors?.cnisData && (
                <p className="text-sm text-destructive">{state.errors.cnisData[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileScan /> Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Resumo da Análise</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap font-mono text-sm">
                 {state.data.summary}
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {state.message && state.errors && (
         <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Falha na Análise</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
