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
  UserCircle,
  LogOut,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const menuItems = [
    { 
        group: "Principal",
        items: [
            { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
        ]
    },
    {
        group: "Ferramentas",
        items: [
            { href: "/dashboard/cnis-analyzer", label: "Analisar CNIS", icon: FileScan },
            { href: "/dashboard/document-generator", label: "Gerador de Petições", icon: Gavel },
        ]
    },
    {
        group: "Conta",
        items: [
            { href: "/dashboard/profile", label: "Meu Perfil", icon: UserCircle },
            { href: "#", label: "Ajuda & Suporte", icon: HelpCircle },
        ]
    }
  ];

  const CollapseIcon = state === 'expanded' ? ChevronsLeft : ChevronsRight;

  return (
    <Sidebar 
      collapsible="icon" 
      variant="floating"
      className="border-r shadow-sm"
    >
      <SidebarContent className="p-4 space-y-6">
        {menuItems.map((group, idx) => (
            <SidebarGroup key={idx} className="p-0">
                <SidebarGroupLabel className="px-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {group.group}
                </SidebarGroupLabel>
                <SidebarMenu>
                    {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={item.label}
                                className={`h-11 px-3 rounded-xl transition-all duration-200 ${
                                    pathname === item.href 
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                                    : "hover:bg-muted"
                                }`}
                            >
                                <Link href={item.href} className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${pathname === item.href ? "text-white" : "text-slate-500"}`} />
                                    <span className="font-semibold text-sm">{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t bg-muted/20">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={handleLogout}
                    className="h-11 px-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">Sair da Conta</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem className="mt-2">
                <SidebarMenuButton 
                    onClick={toggleSidebar} 
                    className="h-10 px-3 rounded-xl hover:bg-muted"
                >
                    <CollapseIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Recolher Menu</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
