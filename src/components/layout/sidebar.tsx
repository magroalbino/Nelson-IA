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
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  FileScan,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldAlert,
  Calculator,
  ChevronsRight,
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
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Home">
            <Logo className="w-8 h-auto transition-transform duration-300 group-data-[collapsible=icon]:-rotate-180" />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Nelson IA</span>
          </Link>
        </SidebarHeader>

        <SidebarMenu className="flex-1 p-2">
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
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
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Análises</SidebarGroupLabel>
              {analysisTools.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
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
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Geração</SidebarGroupLabel>
              {generationTools.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
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
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenuButton onClick={toggleSidebar} tooltip={state === 'expanded' ? "Recolher" : "Expandir"}>
            <ChevronsRight className="transition-transform duration-300 group-data-[state=expanded]:rotate-180" />
            <span className="group-data-[collapsible=icon]:hidden">{state === 'expanded' ? "Recolher Menu" : "Expandir Menu"}</span>
          </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
