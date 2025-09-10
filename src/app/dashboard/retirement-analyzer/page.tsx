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

export default function RetirementAnalyzerPage() {
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
            Esta ferramenta ainda está em construção. A lógica de análise para aposentadoria rural/híbrida será implementada em breve.
          </AlertDescription>
        </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Analisador de Aposentadoria Rural ou Híbrida</CardTitle>
          <CardDescription>
            Faça upload dos seus documentos (CNIS, PAP, DAP) para identificar elegibilidade e calcular o benefício de aposentadorias rurais ou híbridas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadCard onFileSelect={handleFileSelect} />
        </CardContent>
        <CardFooter>
          <Button disabled={!fileDataUri}>Analisar (Indisponível)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
