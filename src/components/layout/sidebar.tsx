"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  FileScan,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldAlert,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

const mainMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const analysisTools = [
  { href: "/dashboard/cnis-analyzer", label: "Análise de CNIS", icon: FileScan },
  { href: "/dashboard/pap-analyzer", label: "Análise de PAP", icon: FileText },
  { href: "/dashboard/ppp-analyzer", label: "Análise de PPP", icon: ShieldAlert },
  { href: "/dashboard/retirement-analyzer", label: "Análise de Elegibilidade", icon: Calculator },
];

const generationTools = [
    { href: "/dashboard/document-generator", label: "Gerador de Petições", icon: Gavel },
]

export function AppSidebar() {
  const pathname = usePathname();

  // Esta sidebar agora só aparece em mobile, controlada pelo SidebarProvider/Sheet
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 p-2" aria-label="Home">
           <Logo className="w-10 h-auto" />
           <span className="font-semibold text-lg">Nelson IA</span>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {mainMenuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas de Análise</SidebarGroupLabel>
            {analysisTools.map((item) => (
              <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
            <SidebarGroupLabel>Geração de Documentos</SidebarGroupLabel>
            {generationTools.map((item) => (
              <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarGroup>
      </SidebarMenu>
    </Sidebar>
  );
}
