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
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ThemeToggle } from "../theme-toggle";

export function AppHeader() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const userEmail = user?.email || "carregando...";
  const userImage = user?.photoURL;
  const avatarFallback = userEmail ? userEmail.charAt(0).toUpperCase() : <UserIcon />;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden"/>
        <Link href="/dashboard" className="hidden items-center gap-2 font-semibold md:flex" aria-label="Home">
            <span className="text-lg font-bold">Nelson IA</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
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
