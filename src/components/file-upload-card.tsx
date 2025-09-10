"use client";

import { useState, useRef, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadCardProps {
  onFileSelect: (file: File, dataUri: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

export function FileUploadCard({
  onFileSelect,
  acceptedFileTypes = ["application/pdf", "text/csv"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((selectedFile: File) => {
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: `Por favor, selecione um arquivo ${acceptedFileTypes.join(", ")}.`,
      });
      return;
    }

    if (selectedFile.size > maxFileSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `O tamanho máximo do arquivo é ${maxFileSize / (1024 * 1024)}MB.`,
      });
      return;
    }

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        setProgress(percentage);
      }
    };
    reader.onload = (e) => {
      setProgress(100);
      onFileSelect(selectedFile, e.target?.result as string);
    };
    reader.onerror = () => {
       toast({
        variant: "destructive",
        title: "Erro de Leitura",
        description: "Não foi possível ler o arquivo.",
      });
      setFile(null);
    }
    reader.readAsDataURL(selectedFile);
  }, [acceptedFileTypes, maxFileSize, onFileSelect, toast]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    if (inputRef.current) {
        inputRef.current.value = "";
    }
    onFileSelect(null!, "");
  };
  
  return (
    <Card 
      className={`border-2 border-dashed ${isDragging ? "border-primary bg-accent" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 text-center">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept={acceptedFileTypes.join(",")}
        />
        {!file ? (
          <>
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              Arraste e solte o arquivo aqui
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ou
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              Selecione o Arquivo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              PDF ou CSV, até 5MB
            </p>
          </>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between rounded-md border p-3 text-left">
                <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="truncate">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile}>
                    <X className="h-5 w-5" />
                </Button>
             </div>
             <Progress value={progress} className="w-full" />
             {progress === 100 && <p className="text-sm text-green-600">Arquivo pronto para análise!</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
