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
import { FileClock, Loader2, ServerCrash, User, Calendar, ListChecks, FileText } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
          Analisando e Extraindo Dados...
        </>
      ) : (
        "Extrair Dados para Cálculo"
      )}
    </Button>
  );
}


export default function RetirementAnalyzerPage() {
  const [state, formAction] = useActionState(analyzeRetirementAction, initialState);

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
          <CardTitle className="flex items-center gap-2"><FileText /> Estruturador de Dados para Cálculo</CardTitle>
          <CardDescription>
            Esta ferramenta utiliza IA para analisar e consolidar os dados do CNIS, PAP e PPP em um formato estruturado. Use o resultado aqui como entrada para a "Calculadora" ou outros sistemas.
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
                <CardTitle>Dados Extraídos e Estruturados</CardTitle>
                <CardDescription>A IA analisou os documentos e estruturou os seguintes dados. Estes são os insumos prontos para a rotina de cálculo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-4">
                    <Alert>
                      <User className="h-4 w-4" />
                      <AlertTitle>Segurado</AlertTitle>
                      <AlertDescription>{state.data.nomeSegurado}</AlertDescription>
                    </Alert>
                     <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertTitle>Data de Nascimento</AlertTitle>
                      <AlertDescription>{state.data.dataNascimento}</AlertDescription>
                    </Alert>
                </div>
                
                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileClock /> Vínculos de Contribuição
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

                <Alert variant="default" className="bg-muted/50">
                    <ListChecks className="h-4 w-4" />
                    <AlertTitle>Observações Importantes para o Cálculo</AlertTitle>
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
