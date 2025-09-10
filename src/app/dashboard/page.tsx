import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  FileScan,
  FileText,
  Gavel,
  ShieldAlert,
  Tractor,
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Analisador de CNIS",
    description: "Análise rápida de períodos de contribuição e inconsistências.",
    href: "/dashboard/cnis-analyzer",
    icon: <FileScan className="w-8 h-8 text-primary" />,
  },
  {
    title: "Analisador de PAP",
    description: "Verifique vínculos, períodos de atividade e segurados especiais.",
    href: "/dashboard/pap-analyzer",
    icon: <FileText className="w-8 h-8 text-primary" />,
  },
  {
    title: "Analisador de PPP",
    description: "Interprete e identifique exposição a agentes nocivos.",
    href: "/dashboard/ppp-analyzer",
    icon: <ShieldAlert className="w-8 h-8 text-primary" />,
  },
  {
    title: "Analisador de Aposentadoria",
    description: "Elegibilidade e cálculo para aposentadorias rurais ou híbridas.",
    href: "/dashboard/retirement-analyzer",
    icon: <Tractor className="w-8 h-8 text-primary" />,
  },
  {
    title: "Gerador de Petições",
    description: "Crie petições e peças processuais com base nos dados analisados.",
    href: "/dashboard/document-generator",
    icon: <Gavel className="w-8 h-8 text-primary" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu assistente de IA para direito previdenciário.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.href} className="hover:shadow-lg transition-shadow">
            <Link href={tool.href} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                </div>
                {tool.icon}
              </CardHeader>
              <CardContent className="flex-grow flex justify-end items-end">
                  <div className="text-sm font-medium text-primary flex items-center">
                    Acessar Ferramenta <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
