import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, FileScan, HelpCircle, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "Qual documento devo enviar para analisar o CNIS?",
    answer: "Envie o PDF oficial do seu extrato CNIS. O arquivo pode conter texto selecionável ou ser um documento escaneado; o sistema tenta fazer OCR quando necessário. O limite atual é de 25 MB.",
  },
  {
    question: "Quanto tempo demora a análise?",
    answer: "Normalmente, o resultado aparece em alguns segundos. PDFs muito longos ou escaneados podem demorar mais porque precisam passar pela etapa de OCR.",
  },
  {
    question: "A análise substitui um profissional previdenciário?",
    answer: "Não. O relatório é informativo e apresenta estimativas. Períodos concomitantes, indicadores, regras de transição e documentos complementares devem ser conferidos por um especialista.",
  },
  {
    question: "O que fazer quando a análise falha?",
    answer: "Confira se o arquivo abre normalmente, se é realmente um PDF e se tem até 25 MB. Caso o problema persista, atualize a página, tente novamente e registre a mensagem exibida no suporte.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
            <HelpCircle className="h-3.5 w-3.5" /> Central de ajuda
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Como podemos ajudar?</h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">Encontre respostas rápidas para usar o Nelson IA com mais segurança e aproveite melhor suas análises.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-0 bg-blue-50 shadow-sm ring-1 ring-blue-100">
          <CardHeader><FileScan className="h-7 w-7 text-blue-600" /><CardTitle className="text-lg">Analisar CNIS</CardTitle></CardHeader>
          <CardContent><CardDescription className="mb-4 text-slate-600">Envie seu PDF e veja tempo, carência, pendências e recomendações.</CardDescription><Link href="/dashboard/cnis-analyzer"><Button className="font-bold">Abrir analisador <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></CardContent>
        </Card>
        <Card className="border-0 bg-emerald-50 shadow-sm ring-1 ring-emerald-100">
          <CardHeader><ShieldCheck className="h-7 w-7 text-emerald-600" /><CardTitle className="text-lg">Boas práticas</CardTitle></CardHeader>
          <CardContent><CardDescription className="text-slate-600">Use documentos oficiais, legíveis e confira as estimativas antes de tomar decisões.</CardDescription></CardContent>
        </Card>
        <Card className="border-0 bg-amber-50 shadow-sm ring-1 ring-amber-100">
          <CardHeader><MessageSquare className="h-7 w-7 text-amber-600" /><CardTitle className="text-lg">Relatar problema</CardTitle></CardHeader>
          <CardContent><CardDescription className="mb-4 text-slate-600">Registre erros técnicos, incluindo a mensagem e a etapa em que aconteceram.</CardDescription><a href="https://github.com/magroalbino/Nelson-IA/issues" target="_blank" rel="noreferrer"><Button variant="outline" className="border-amber-300 bg-white font-bold text-amber-800 hover:bg-amber-100">Abrir canal de suporte <ArrowRight className="ml-2 h-4 w-4" /></Button></a></CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader><CardTitle className="text-2xl font-black text-slate-900">Perguntas frequentes</CardTitle><CardDescription>Respostas para as dúvidas mais comuns.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 open:bg-white open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-800">{faq.question}<ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary>
                <p className="pt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit border-0 bg-slate-900 text-white shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><RefreshCw className="h-5 w-5 text-blue-300" /> Checklist rápido</CardTitle><CardDescription className="text-slate-300">Antes de pedir ajuda, confirme:</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {["O arquivo abre normalmente no seu dispositivo", "O documento está no formato PDF", "O tamanho é menor que 25 MB", "A mensagem de erro foi anotada", "Você tentou atualizar a página"].map((item) => <div key={item} className="flex items-start gap-3 text-sm text-slate-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</div>)}
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" /><p>Não compartilhe senhas ou dados pessoais desnecessários ao relatar um problema.</p></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
