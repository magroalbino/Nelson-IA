"use client";

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadCardProps {
  onFileSelect: (file: File | null, dataUri: string) => void;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export function FileUploadCard({ 
  onFileSelect, 
  acceptedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  maxSizeMB = 10 
}: FileUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo no formato permitido (PDF ou Word).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo permitido é ${maxSizeMB}MB.`,
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setSelectedFile(file);
      onFileSelect(file, dataUri);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null, "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card 
      className={`relative border-2 border-dashed transition-all duration-200 ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      } ${selectedFile ? "bg-muted/30" : "bg-white"}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        accept={acceptedFileTypes.join(",")}
      />

      <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
        {selectedFile ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button variant="outline" size="sm" onClick={removeFile} className="mt-2 text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4 mr-2" /> Remover Arquivo
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-xl text-slate-900">Clique ou arraste o documento</p>
              <p className="text-slate-500 mt-1">Suporta PDF, DOC e DOCX (Máx. {maxSizeMB}MB)</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} type="button" size="lg" className="mt-2 font-bold">
              Selecionar Arquivo
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function FileCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}
