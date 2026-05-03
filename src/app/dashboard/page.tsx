import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileScan,
  Gavel,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

const featuredTools = [
  {
    title: "Analisador de CNIS",
    description: "Faça o upload do seu extrato CNIS para uma análise completa e simplificada. Identificamos períodos com problemas, falta de contribuições e sugerimos exatamente o que fazer para regularizar sua aposentadoria.",
    href: "/dashboard/cnis-analyzer",
    icon: <FileScan className="w-10 h-10 text-primary" />,
    cta: "Começar Análise do CNIS",
  },
  {
    title: "Gerador de Petições",
    description: "Crie petições fundamentadas para o INSS ou Justiça com base nos dados do segurado. Ideal para advogados que buscam agilidade e precisão técnica.",
    href: "/dashboard/document-generator",
    icon: <Gavel className="w-10 h-10 text-primary" />,
    cta: "Gerar Nova Petição",
  },
];

const helpCards = [
  {
    title: "O que é o CNIS?",
    description: "É o Cadastro Nacional de Informações Sociais, o documento que lista todos os seus trabalhos e contribuições ao INSS.",
    icon: <HelpCircle className="w-5 h-5 text-blue-500" />
  },
  {
    title: "Como funciona?",
    description: "Você envia o PDF do CNIS e nossa inteligência analisa cada linha em busca de erros ou falta de pagamentos.",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
  },
  {
    title: "Por que analisar?",
    description: "Muitas vezes o INSS não registra períodos corretamente. Identificar isso cedo garante uma aposentadoria maior e mais rápida.",
    icon: <AlertCircle className="w-5 h-5 text-orange-500" />
  }
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-4">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Nelson IA
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Análise inteligente de CNIS para garantir seus direitos previdenciários de forma simples e clara.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredTools.map((tool) => (
          <Card key={tool.href} className="flex flex-col group border-2 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex-col items-center text-center gap-4">
                  <div className="bg-primary/10 p-5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                      {tool.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow text-center px-8">
                  <CardDescription className="text-base leading-relaxed">
                      {tool.description}
                  </CardDescription>
              </CardContent>
              <CardContent className="pt-0">
                  <Link href={tool.href}>
                      <Button size="lg" className="w-full text-lg font-semibold h-14 group-hover:scale-[1.02] transition-transform">
                          {tool.cta} <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                  </Link>
              </CardContent>
          </Card>
          ))}
      </main>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {helpCards.map((card, i) => (
          <Card key={i} className="bg-muted/30 border-none">
            <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
              {card.icon}
              <CardTitle className="text-base font-bold">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
