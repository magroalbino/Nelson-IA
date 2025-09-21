"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  FileScan,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldAlert,
  Tractor,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cnis-analyzer", label: "Analisador CNIS", icon: FileScan },
  { href: "/dashboard/pap-analyzer", label: "Analisador PAP", icon: FileText },
  { href: "/dashboard/ppp-analyzer", label: "Analisador PPP", icon: ShieldAlert },
  { href: "/dashboard/retirement-analyzer", label: "Aposentadoria Rural", icon: Tractor },
  { href: "/dashboard/document-generator", label: "Gerador de Petições", icon: Gavel },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           <Logo width={40} height={40} />
           <span className="font-semibold text-lg">Eustáquio IA</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        {/* Can add user info or settings here */}
      </SidebarFooter>
    </Sidebar>
  );
}
