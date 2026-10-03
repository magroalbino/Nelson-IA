"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/icons";
import { LoginForm } from "@/components/auth/login-form";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Voltar para o início</Link>
        <div className="rounded-3xl border bg-white p-7 shadow-xl sm:p-9">
          <div className="mb-7 flex flex-col items-center gap-3 text-center"><Logo className="w-16" /><h1 className="text-3xl font-black text-slate-900">Sua conta Nelson IA</h1><p className="text-muted-foreground">Entre para salvar análises e acessar configurações pessoais. O analisador continua disponível sem cadastro.</p></div>
          <LoginForm />
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Seus dados de acesso são tratados pelo Firebase Authentication.</div>
        </div>
      </div>
    </main>
  );
}
