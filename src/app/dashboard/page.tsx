
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
  Tractor,
  List,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const featuredTools = [
  {
    title: "Analisador de CNIS",
    description: "Faça o upload ou cole o texto do CNIS para uma análise estratégica completa. Identifique pendências, indicadores (PEXT, AEXT-VI), lacunas de contribuição e receba um parecer detalhado com ações recomendadas.",
    href: "/dashboard/cnis-analyzer",
    icon: <FileScan className="w-10 h-10 text-primary" />,
    cta: "Iniciar Análise de CNIS",
  },
  {
    title: "Gerador de Petições",
    description: "Com base nos dados já analisados (CNIS, PPP, etc.), gere petições administrativas ou judiciais robustas e bem fundamentadas. A IA utiliza a legislação e jurisprudência para construir os melhores argumentos.",
    href: "/dashboard/document-generator",
    icon: <Gavel className="w-10 h-10 text-primary" />,
    cta: "Gerar uma Petição",
  },
];

const quickAccessTools = [
  {
    title: "Analisador de PPP",
    description: "Extraia dados de agentes nocivos.",
    href: "/dashboard/ppp-analyzer",
    icon: <ShieldAlert className="w-6 h-6 text-muted-foreground" />,
  },
  {
    title: "Analisador de PAP",
    description: "Verifique vínculos empregatícios.",
    href: "/dashboard/pap-analyzer",
    icon: <FileText className="w-6 h-6 text-muted-foreground" />,
  },
  {
    title: "Analisador de Aposentadoria",
    description: "Estruture dados para cálculo.",
    href: "/dashboard/retirement-analyzer",
    icon: <Tractor className="w-6 h-6 text-muted-foreground" />,
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
          Seu assistente inteligente para direito previdenciário. Comece selecionando uma de nossas ferramentas de análise abaixo.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {featuredTools.map((tool) => (
            <Card key={tool.href} className="flex flex-col h-full shadow-lg border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                            <CardTitle className="text-2xl">{tool.title}</CardTitle>
                            <CardDescription className="leading-relaxed">
                                {tool.description}
                            </CardDescription>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg">
                            {tool.icon}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Link href={tool.href}>
                        <Button size="lg" className="w-full sm:w-auto">
                            {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            ))}
        </div>

        <aside className="space-y-6">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <List className="w-6 h-6" />
                  Acesso Rápido
                </CardTitle>
                 <CardDescription>
                    Outras ferramentas para agilizar seu dia a dia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quickAccessTools.map((tool, index) => (
                    <li key={tool.href}>
                      <Link href={tool.href}>
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-background transition-colors cursor-pointer group">
                          {tool.icon}
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{tool.title}</p>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      {index < quickAccessTools.length - 1 && <Separator />}
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
