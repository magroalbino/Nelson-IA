"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploadCard } from "@/components/file-upload-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function PppAnalyzerPage() {
  const [fileDataUri, setFileDataUri] = useState("");

  const handleFileSelect = (file: File | null, dataUri: string) => {
    setFileDataUri(dataUri);
  };
  
  return (
    <div className="grid gap-6">
       <Alert>
          <Construction className="h-4 w-4" />
          <AlertTitle>Em Desenvolvimento</AlertTitle>
          <AlertDescription>
            Esta ferramenta ainda está em construção. A lógica de análise para o PPP será implementada em breve.
          </AlertDescription>
        </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Analisador de PPP</CardTitle>
          <CardDescription>
            Faça upload do seu Perfil Profissiográfico Previdenciário (PPP) para identificar exposição a agentes nocivos e verificar requisitos para aposentadoria especial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadCard onFileSelect={handleFileSelect} />
        </CardContent>
        <CardFooter>
          <Button disabled={!fileDataUri}>Analisar PPP (Indisponível)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
