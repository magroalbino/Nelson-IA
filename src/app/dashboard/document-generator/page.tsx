"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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
import { Gavel, Loader2, ServerCrash, FileText, Paperclip, UploadCloud, FileCheck, Copy, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FileUploadCard } from "@/components/file-upload-card";

const initialState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} size="lg" className="h-16 px-10 text-xl font-black shadow-xl hover:scale-[1.02] transition-transform">
      {pending ? (
        <>
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          Elaborando Petição Técnica...
        </>
      ) : (
        <>
          <Gavel className="mr-3 h-6 w-6" />
          Gerar Petição Agora
        </>
      )}
    </Button>
  );
}

export default function DocumentGeneratorPage() {
  const [state, formAction] = useActionState(generatePetitionAction, initialState);
  const [documentUri, setDocumentUri] = useState("");

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors || !state.data ? "Ops!" : "Sucesso!",
        description: state.message,
        variant: state.errors || !state.data ? "destructive" : "default",
      });
    }
  }, [state]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "O texto da petição foi copiado com sucesso.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-primary">Gerador de Petições Previdenciárias</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transforme documentos (CNIS, PPP, etc.) em peças jurídicas fundamentadas em segundos.
        </p>
      </header>

      <Card className="border-2 shadow-2xl overflow-hidden">
        <div className="bg-primary/5 p-4 border-b flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary/80 uppercase tracking-widest">Configuração da Peça</span>
        </div>
        <form action={formAction}>
          <CardContent className="space-y-10 pt-10 px-8">
            <input type="hidden" name="documentUri" value={documentUri} />

            <div className="space-y-4">
                <Label className="text-xl font-black flex items-center gap-2 text-slate-900">
                    <UploadCloud className="w-6 h-6 text-primary" /> 
                    1. Anexe o Documento Base
                </Label>
                 <p className="text-base text-slate-500 font-medium">
                    Envie o CNIS, PPP ou Laudo em formato PDF ou Word (.doc, .docx).
                </p>
                <FileUploadCard 
                    onFileSelect={(_, dataUri) => setDocumentUri(dataUri)} 
                    acceptedFileTypes={["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]} 
                />
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="tipoPetição" className="text-xl font-black flex items-center gap-2 text-slate-900">
                <FileCheck className="w-6 h-6 text-primary" />
                2. Escolha o Tipo de Peça
              </Label>
              <Select name="tipoPetição">
                <SelectTrigger className="h-14 text-lg font-semibold border-2 focus:ring-primary">
                  <SelectValue placeholder="Selecione o destino da petição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrativo" className="py-3 text-base">Requerimento Administrativo (INSS)</SelectItem>
                  <SelectItem value="judicial" className="py-3 text-base">Petição Inicial Judicial (Justiça Federal)</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.tipoPetição && (
                 <p className="text-sm text-destructive font-bold">{state.errors.tipoPetição[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center bg-slate-50 border-t py-10">
            <SubmitButton disabled={!documentUri} />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-3 text-2xl font-black text-primary px-2">
            <FileText className="w-8 h-8" />
            Petição Gerada com Sucesso:
          </div>

          <Card className="border-2 shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between p-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Texto da Petição</CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                  Pronto para copiar e colar no seu editor.
                </CardDescription>
              </div>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => copyToClipboard(state.data?.peticao || "")}
                className="font-black h-12 px-6 shadow-lg"
              >
                <Copy className="mr-2 h-5 w-5" /> Copiar Tudo
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                readOnly
                value={state.data.peticao}
                className="min-h-[800px] border-none rounded-none bg-white font-serif text-lg p-12 md:p-16 leading-relaxed focus-visible:ring-0 text-slate-800"
              />
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-primary font-black text-xl">
                <Paperclip className="w-6 h-6" /> Documentos Anexos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white rounded-2xl p-8 border-2 border-primary/10 shadow-sm">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                    {state.data.documentosAnexos}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {state.message && (state.errors || !state.data) && (
         <Alert variant="destructive" className="border-2 p-6 shadow-lg">
          <ServerCrash className="h-6 w-6" />
          <AlertTitle className="text-xl font-black mb-2">Erro na Geração</AlertTitle>
          <AlertDescription className="text-lg font-medium">
            {state.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
