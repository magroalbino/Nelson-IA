
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
  FileText,
  Gavel,
  ShieldAlert,
  Calculator,
  List,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const featuredTools = [
  {
    title: "Analisador Estratégico de CNIS",
    description: "Cole o texto do CNIS para uma análise completa. Identifique pendências, indicadores (PEXT, AEXT-VI), lacunas e receba um parecer com ações recomendadas.",
    href: "/dashboard/cnis-analyzer",
    icon: <FileScan className="w-8 h-8 text-primary" />,
    cta: "Analisar CNIS",
  },
  {
    title: "Gerador Inteligente de Petições",
    description: "Com base nos dados analisados, gere petições robustas e fundamentadas. A IA utiliza a legislação e jurisprudência para construir os melhores argumentos.",
    href: "/dashboard/document-generator",
    icon: <Gavel className="w-8 h-8 text-primary" />,
    cta: "Gerar Petição",
  },
];

const quickAccessTools = [
  {
    title: "Analisador de PPP",
    description: "Extraia dados de agentes nocivos do Perfil Profissiográfico.",
    href: "/dashboard/ppp-analyzer",
    icon: <ShieldAlert className="w-5 h-5 text-muted-foreground" />,
  },
  {
    title: "Analisador de PAP",
    description: "Valide vínculos e períodos de atividade profissional.",
    href: "/dashboard/pap-analyzer",
    icon: <FileText className="w-5 h-5 text-muted-foreground" />,
  },
  {
    title: "Calculadora Previdenciária",
    description: "Calcule o tempo total de contribuição a partir dos documentos.",
    href: "/dashboard/calculator",
    icon: <Calculator className="w-5 h-5 text-muted-foreground" />,
  },
  {
    title: "Estruturador para Cálculo",
    description: "Compile e organize todos os dados para o cálculo de tempo.",
    href: "/dashboard/retirement-analyzer",
    icon: <FileText className="w-5 h-5 text-muted-foreground" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          Bem-vindo ao Nelson IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Sua plataforma inteligente para direito previdenciário. Comece selecionando uma de nossas ferramentas de análise abaixo.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTools.map((tool) => (
            <Card key={tool.href} className="flex flex-col group bg-card/50 hover:bg-card/90 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        {tool.icon}
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription className="leading-relaxed">
                        {tool.description}
                    </CardDescription>
                </CardContent>
                <CardContent>
                    <Link href={tool.href}>
                        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {tool.cta} <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <List className="w-5 h-5" />
                  Acesso Rápido
                </CardTitle>
                 <CardDescription>
                    Outras ferramentas para agilizar seu dia a dia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {quickAccessTools.map((tool, index) => (
                    <li key={tool.href}>
                      <Link href={tool.href}>
                        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-background transition-colors cursor-pointer group">
                          <div className="mt-1">{tool.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{tool.title}</p>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                        </div>
                      </Link>
                      {index < quickAccessTools.length - 1 && <Separator className="my-1" />}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
        </aside>
      </main>
    </div>
  );
}
