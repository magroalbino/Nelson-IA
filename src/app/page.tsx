import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileScan, Gavel, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Nelson IA - início"><Logo className="w-10" /><span className="text-xl font-black tracking-tight">Nelson IA</span></Link>
        <div className="flex items-center gap-3"><Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link href="/account">Entrar</Link></Button><Button asChild className="bg-white text-slate-900 hover:bg-blue-50"><Link href="/account"><UserPlus className="mr-2 h-4 w-4" /> Criar conta</Link></Button></div>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-20">
        <div className="space-y-8"><div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-200"><ShieldCheck className="h-4 w-4" /> Comece sem fazer login</div><div className="space-y-5"><h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">Entenda seu CNIS antes de tomar uma decisão previdenciária.</h1><p className="max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">Envie seu PDF e receba uma leitura organizada com linha do tempo, vínculos, contribuições, benefícios, alertas e próximos passos.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="h-14 bg-blue-600 px-7 text-base font-black shadow-lg shadow-blue-900/40 hover:bg-blue-500"><Link href="/dashboard/cnis-analyzer">Analisar meu CNIS <ArrowRight className="ml-2 h-5 w-5" /></Link></Button><Button asChild size="lg" variant="outline" className="h-14 border-white/20 bg-transparent px-7 text-base font-bold text-white hover:bg-white/10 hover:text-white"><Link href="/account">Quero salvar minhas análises</Link></Button></div><p className="text-sm text-slate-400">O uso inicial é livre. A conta é opcional e serve para recursos personalizados.</p></div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-blue-950/30"><div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-900"><Image src="/assets/logo-nelson-3.png" alt="Nelson IA" fill className="object-cover opacity-30" priority /><div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-slate-900/60 to-slate-950" /><div className="absolute inset-x-7 bottom-7 space-y-4"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Seu histórico em uma visão</p><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><FileScan className="mb-3 h-6 w-6 text-blue-200" /><p className="font-bold">CNIS</p><p className="mt-1 text-xs text-slate-300">Leitura do PDF</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><ShieldCheck className="mb-3 h-6 w-6 text-emerald-300" /><p className="font-bold">Histórico</p><p className="mt-1 text-xs text-slate-300">Linha do tempo</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><Gavel className="mb-3 h-6 w-6 text-amber-200" /><p className="font-bold">Ações</p><p className="mt-1 text-xs text-slate-300">Próximos passos</p></div></div></div></div></div>
      </section>
    </main>
  );
}
