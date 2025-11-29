
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
import { User as UserIcon, Loader2, Camera, Shield, Briefcase } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full max-w-sm" />
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
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais, profissionais e de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Informações Pessoais */}
          <div className="space-y-6">
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

            <form className="space-y-4">
              <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="displayName">Nome de Exibição</Label>
                <Input
                  id="displayName"
                  defaultValue={user.displayName || ""}
                />
                <p className="text-sm text-muted-foreground">
                  Este será o nome exibido na plataforma.
                </p>
              </div>
              
              <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ""} disabled />
              </div>

               <Button onClick={(e) => {e.preventDefault(); alert("Funcionalidade de atualização a ser implementada.")}}>
                  Salvar Alterações Pessoais
              </Button>
            </form>
          </div>

          <Separator />

          {/* Informações Profissionais */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium flex items-center gap-2"><Briefcase className="w-5 h-5" /> Informações Profissionais</h3>
            <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                    <div className="col-span-2 grid gap-1.5">
                        <Label htmlFor="oabNumber">Número da OAB</Label>
                        <Input id="oabNumber" placeholder="Ex: 123456" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="oabState">UF</Label>
                        <Select name="oabState">
                            <SelectTrigger id="oabState"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="AC">AC</SelectItem>
                               <SelectItem value="AL">AL</SelectItem>
                               <SelectItem value="AP">AP</SelectItem>
                               <SelectItem value="AM">AM</SelectItem>
                               <SelectItem value="BA">BA</SelectItem>
                               <SelectItem value="CE">CE</SelectItem>
                               <SelectItem value="DF">DF</SelectItem>
                               <SelectItem value="ES">ES</SelectItem>
                               <SelectItem value="GO">GO</SelectItem>
                               <SelectItem value="MA">MA</SelectItem>
                               <SelectItem value="MT">MT</SelectItem>
                               <SelectItem value="MS">MS</SelectItem>
                               <SelectItem value="MG">MG</SelectItem>
                               <SelectItem value="PA">PA</SelectItem>
                               <SelectItem value="PB">PB</SelectItem>
                               <SelectItem value="PR">PR</SelectItem>
                               <SelectItem value="PE">PE</SelectItem>
                               <SelectItem value="PI">PI</SelectItem>
                               <SelectItem value="RJ">RJ</SelectItem>
                               <SelectItem value="RN">RN</SelectItem>
                               <SelectItem value="RS">RS</SelectItem>
                               <SelectItem value="RO">RO</SelectItem>
                               <SelectItem value="RR">RR</SelectItem>
                               <SelectItem value="SC">SC</SelectItem>
                               <SelectItem value="SP">SP</SelectItem>
                               <SelectItem value="SE">SE</SelectItem>
                               <SelectItem value="TO">TO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid w-full max-w-md items-center gap-1.5">
                    <Label htmlFor="officeName">Nome do Escritório</Label>
                    <Input id="officeName" placeholder="Ex: Advocacia & Associados" />
                </div>
                <div className="grid w-full max-w-md items-center gap-1.5">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" placeholder="(00) 90000-0000" />
                </div>
                <Button onClick={(e) => {e.preventDefault(); alert("Funcionalidade de atualização a ser implementada.")}}>Salvar Informações Profissionais</Button>
            </form>
          </div>

          <Separator />
          
          {/* Segurança */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium flex items-center gap-2"><Shield className="w-5 h-5" /> Segurança</h3>
            <form className="space-y-4 max-w-md">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                </div>
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="secondary" onClick={(e) => {e.preventDefault(); alert("Funcionalidade de alteração de senha a ser implementada.")}}>Alterar Senha</Button>
            </form>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
