
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Loader2, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Você precisa estar logado para acessar esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const avatarFallback = user.email
    ? user.email.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || ""} alt="Foto de Perfil" />
                <AvatarFallback className="text-3xl">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background/80 group-hover:bg-background"
                onClick={() => alert("Funcionalidade de upload de imagem a ser implementada.")}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Alterar foto</span>
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading">{user.displayName || "Advogado(a)"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <form className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                defaultValue={user.displayName || ""}
              />
               <p className="text-sm text-muted-foreground">
                Este será o nome exibido na plataforma.
              </p>
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email || ""} disabled />
            </div>

            <Button onClick={() => alert("Funcionalidade de atualização a ser implementada.")}>
                Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
