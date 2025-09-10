"use client";

import { useFormState, useFormStatus } from "react-dom";
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
import { FileText, Loader2, ServerCrash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando...
        </>
      ) : (
        "Analisar PAP"
      )}
    </Button>
  );
}

export default function PapAnalyzerPage() {
  const [state, formAction] = useFormState(analyzePapAction, initialState);
  const [papDataUri, setPapDataUri] = useState("");

  const handleFileSelect = (file: File | null, dataUri: string) => {
    setPapDataUri(dataUri);
  };

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Erro" : "Sucesso!",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Analisador de PAP</CardTitle>
          <CardDescription>
            Faça upload do seu Perfil de Atividade Profissional (PAP) em formato PDF ou CSV para validar vínculos e períodos de atividade.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <input type="hidden" name="papDataUri" value={papDataUri} />
            <FileUploadCard onFileSelect={handleFileSelect} />
            {state.errors?.papDataUri && (
                <p className="text-sm text-destructive mt-2">{state.errors.papDataUri[0]}</p>
              )}
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={!papDataUri} />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText /> Vínculos Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Empregador</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead className="text-right">Salário</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {state.data.vínculos.map((vinculo, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{vinculo.empregador}</TableCell>
                            <TableCell>{vinculo.funcao}</TableCell>
                            <TableCell>{vinculo.dataInicio}</TableCell>
                            <TableCell>{vinculo.dataFim}</TableCell>
                            <TableCell className="text-right">{vinculo.salario}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {state.message && (state.errors || !state.data) && (
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
