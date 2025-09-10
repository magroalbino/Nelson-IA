"use client";

import { useFormState, useFormStatus } from "react-dom";
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
import { ShieldAlert, Loader2, ServerCrash, FileScan, User, Building, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analisando Documento...
        </>
      ) : (
        <>
         <FileScan className="mr-2"/>
         Analisar PPP
        </>
      )}
    </Button>
  );
}

export default function PppAnalyzerPage() {
  const [state, formAction] = useFormState(analyzePppAction, initialState);
  const [pppDocumentUri, setPppDocumentUri] = useState("");

  const handleFileSelect = (file: File | null, dataUri: string) => {
    setPppDocumentUri(dataUri);
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
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ShieldAlert className="w-8 h-8" />
            Analisador de Perfil Profissiográfico Previdenciário (PPP)
          </CardTitle>
          <CardDescription className="text-lg">
            Faça o upload do documento PPP para extrair automaticamente os dados de exposição a agentes nocivos e obter um relatório detalhado.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <input type="hidden" name="pppDocumentUri" value={pppDocumentUri} />
            <FileUploadCard 
              onFileSelect={handleFileSelect} 
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileScan /> Resultado da Análise do PPP
            </CardTitle>
            <CardDescription>Relatório gerado a partir do documento enviado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid md:grid-cols-2 gap-4">
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertTitle>Trabalhador</AlertTitle>
                  <AlertDescription>{state.data.nomeTrabalhador}</AlertDescription>
                </Alert>
                 <Alert>
                  <Building className="h-4 w-4" />
                  <AlertTitle>Empregador</AlertTitle>
                  <AlertDescription>{state.data.empregador}</AlertDescription>
                </Alert>
            </div>
            
            <Alert variant="default" className="bg-muted/50">
              <ClipboardList className="h-4 w-4" />
              <AlertTitle>Resumo Geral da Exposição</AlertTitle>
              <AlertDescription>
                <p className="leading-relaxed">{state.data.resumoGeral}</p>
              </AlertDescription>
            </Alert>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Registros de Exposição a Agentes Nocivos</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Fator de Risco</TableHead>
                          <TableHead>Intensidade</TableHead>
                          <TableHead>Técnica Utilizada</TableHead>
                          <TableHead>EPC Eficaz</TableHead>
                          <TableHead>EPI Eficaz</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {state.data.registrosExposicao.map((registro, index) => (
                          <TableRow key={index}>
                              <TableCell className="font-medium">{registro.periodo}</TableCell>
                              <TableCell>{registro.fatorDeRisco}</TableCell>
                              <TableCell>{registro.intensidade}</TableCell>
                              <TableCell>{registro.tecnicaUtilizada}</TableCell>
                              <TableCell>
                                <Badge variant={registro.epcEficaz === 'Sim' ? 'default' : 'destructive'}>{registro.epcEficaz}</Badge>
                              </TableCell>
                               <TableCell>
                                <Badge variant={registro.epiEficaz === 'Sim' ? 'default' : 'destructive'}>{registro.epiEficaz}</Badge>
                              </TableCell>
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
