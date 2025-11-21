"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Logo } from "../icons";
import { cn } from "@/lib/utils";
import {
  FileScan,
  FileText,
  Gavel,
  LayoutDashboard,
  ShieldAlert,
  Calculator,
} from "lucide-react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cnis-analyzer", label: "Análise de CNIS", icon: FileScan },
  { href: "/dashboard/ppp-analyzer", label: "Análise de PPP", icon: ShieldAlert },
  { href: "/dashboard/pap-analyzer", label: "Análise de PAP", icon: FileText },
  { href: "/dashboard/retirement-analyzer", label: "Análise de Elegibilidade", icon: Calculator },
  { href: "/dashboard/document-generator", label: "Gerador de Petições", icon: Gavel },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const userEmail = user?.email || "carregando...";
  const userImage = user?.photoURL;
  const avatarFallback = userEmail ? userEmail.charAt(0).toUpperCase() : <UserIcon />;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
             <Link href="/dashboard" className="flex items-center gap-2 font-semibold" aria-label="Home">
               <Logo className="w-8 h-auto" />
               <span className="hidden sm:inline-block text-lg">Nelson IA</span>
            </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-4 lg:gap-5 text-sm">
            {navigationItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                >
                {item.label}
                </Link>
            ))}
        </nav>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        {loading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
        ) : (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                    {userImage && <AvatarImage src={userImage} alt="User avatar" />}
                    <AvatarFallback>
                    {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'Advogado(a)'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Editar Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
