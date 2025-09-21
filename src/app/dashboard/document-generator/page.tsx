"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generatePetitionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gavel, Loader2, ServerCrash, FileText, Paperclip } from "lucide-react";
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
          Gerando...
        </>
      ) : (
        "Gerar Petição"
      )}
    </Button>
  );
}

export default function DocumentGeneratorPage() {
  const [state, formAction] = useFormState(generatePetitionAction, initialState);

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
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Gerador de Petições e Peças Processuais</CardTitle>
            <CardDescription>
              Insira os dados do segurado e selecione o tipo de petição para
              gerar o documento automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="seguradoData">
                Dados do Segurado (CNIS, PAP, PPP, etc.)
              </Label>
              <Textarea
                id="seguradoData"
                name="seguradoData"
                placeholder="Cole todos os dados relevantes do segurado aqui..."
                className="min-h-[200px]"
              />
              {state.errors?.seguradoData && (
                <p className="text-sm text-destructive">{state.errors.seguradoData[0]}</p>
              )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="tipoPetição">Tipo de Petição</Label>
              <Select name="tipoPetição">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="judicial">Judicial</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.tipoPetição && (
                 <p className="text-sm text-destructive">{state.errors.tipoPetição[0]}</p>
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
              <Gavel /> Documentos Gerados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><FileText size={16}/> Petição Gerada</h3>
              <Textarea
                readOnly
                value={state.data.peticao}
                className="min-h-[400px] bg-muted font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><Paperclip size={16}/> Documentos Anexos Sugeridos</h3>
              <Textarea
                readOnly
                value={state.data.documentosAnexos}
                className="min-h-[150px] bg-muted font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {state.message && (state.errors || !state.data) && (
         <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Falha na Geração</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
