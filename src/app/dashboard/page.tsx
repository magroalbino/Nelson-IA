import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileScan,
  Gavel,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const featuredTools = [
  {
    title: "Analisador de CNIS",
    eyebrow: "Mais utilizado",
    description: "Transforme o extrato do INSS em um panorama claro de carência, tempo de contribuição, pendências e próximos passos.",
    href: "/dashboard/cnis-analyzer",
    icon: FileScan,
    cta: "Analisar meu CNIS",
    tone: "from-blue-600 to-indigo-700",
  },
  {
    title: "Gerador de Petições",
    eyebrow: "Para profissionais",
    description: "Crie uma primeira versão de requerimentos administrativos e peças previdenciárias com mais agilidade.",
    href: "/dashboard/document-generator",
    icon: Gavel,
    cta: "Gerar petição",
    tone: "from-slate-800 to-slate-950",
  },
];

const helpCards = [
  {
    title: "Privacidade em primeiro lugar",
    description: "Seus documentos são enviados apenas para processamento da análise e não ficam expostos na interface.",
    icon: ShieldCheck,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Leitura simplificada",
    description: "Informações técnicas são organizadas em indicadores que ajudam você a entender o seu histórico.",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "Ainda tem dúvidas?",
    description: "A análise é informativa. Para decisões importantes, confirme os períodos com um especialista previdenciário.",
    icon: HelpCircle,
    color: "text-violet-600 bg-violet-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10 lg:px-14">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Seu painel previdenciário
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Decisões mais claras para o seu futuro.</h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Organize seus documentos, encontre pontos de atenção e avance com mais segurança na sua jornada previdenciária.
              </p>
            </div>
            <Link href="/dashboard/cnis-analyzer">
              <Button size="lg" className="h-12 bg-white px-5 font-bold text-slate-950 shadow-lg hover:bg-blue-50">
                Começar pelo CNIS <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="hidden shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:flex lg:mr-8">
            <Image src="/assets/logo-nelson-transparent.png" alt="Nelson IA" width={150} height={118} className="h-auto w-32 object-contain opacity-95" priority />
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Ferramentas</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Por onde você quer começar?</h2>
        </div>
        <p className="text-sm text-muted-foreground">Escolha uma ferramenta para continuar.</p>
      </div>

      <main className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {featuredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.href} className="group relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.tone}`} />
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-3 sm:p-8 sm:pb-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.tone} text-white shadow-lg`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500">{tool.eyebrow}</span>
              </CardHeader>
              <CardContent className="p-6 pt-2 sm:p-8 sm:pt-2">
                <CardTitle className="text-2xl font-black text-slate-900">{tool.title}</CardTitle>
                <CardDescription className="mt-3 min-h-[3.5rem] text-base leading-relaxed text-slate-600">{tool.description}</CardDescription>
                <Link href={tool.href} className="mt-6 block">
                  <Button className="h-12 w-full justify-between px-5 font-bold sm:w-auto sm:min-w-52">
                    {tool.cta} <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </main>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {helpCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-0 bg-white/70 shadow-sm ring-1 ring-slate-200/70">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-5 pb-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}><Icon className="h-5 w-5" /></div>
                <CardTitle className="text-base font-extrabold text-slate-800">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2"><p className="text-sm leading-relaxed text-slate-600">{card.description}</p></CardContent>
            </Card>
          );
        })}
      </section>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span>Informações organizadas para ajudar você a entender seus próximos passos.</span>
      </div>
    </div>
  );
}
