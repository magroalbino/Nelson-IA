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
  Gavel,
  LayoutDashboard,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";

const mainMenuItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
];

const analysisTools = [
  { href: "/dashboard/cnis-analyzer", label: "Análise de CNIS", icon: FileScan },
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
        <SidebarMenu className="flex-1 mt-4">
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  data-active={pathname === item.href}
                  tooltip={item.label}
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
            <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Análise Previdenciária</SidebarGroupLabel>
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
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center">Documentos</SidebarGroupLabel>
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
