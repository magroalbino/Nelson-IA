"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  FileScan,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldAlert,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  User,
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

  const CollapseIcon = state === 'expanded' ? ChevronsLeft : ChevronsRight;

  return (
    <Sidebar 
      collapsible="icon" 
      variant="inset"
      className="bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60"
    >
      <SidebarContent className="flex-1 p-2">
        <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" aria-label="Home">
              <Logo className="w-8 h-auto" />
              <span className="text-lg font-bold">Nelson IA</span>
          </Link>
        </div>
        <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
            <Link href="/dashboard" aria-label="Home">
                <Logo className="w-8 h-auto" />
            </Link>
        </div>

        <SidebarMenu className="flex-1 mt-4">
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  data-active={pathname === item.href}
                  tooltip={item.label}
                  size="lg"
                  className="relative"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarSeparator className="my-3"/>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Análises</SidebarGroupLabel>
              {analysisTools.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      data-active={pathname === item.href}
                      tooltip={item.label}
                      className="relative"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarGroup>

          <SidebarSeparator className="my-3"/>

          <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Geração</SidebarGroupLabel>
              {generationTools.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      data-active={pathname === item.href}
                      tooltip={item.label}
                       className="relative"
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
      <SidebarFooter className="p-2 border-t">
         <SidebarMenuButton onClick={toggleSidebar} tooltip={state === 'expanded' ? "Recolher" : "Expandir"}>
            <CollapseIcon />
            <span className="group-data-[collapsible=icon]:hidden">{state === 'expanded' ? "Recolher Menu" : "Expandir Menu"}</span>
          </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
