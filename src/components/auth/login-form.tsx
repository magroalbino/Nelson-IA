"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.133H12.48z" fill="currentColor"/>
    </svg>
);


const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (isRegisterMode) {
        // Handle Registration
        try {
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            toast({
                title: "Conta criada com sucesso!",
                description: "Redirecionando para o seu dashboard...",
            });
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Firebase Register Error:", error);
            let errorMessage = "Ocorreu um erro ao criar a conta.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este endereço de e-mail já está em uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca. Tente uma mais forte.';
            }
            toast({
                title: "Erro de Registro",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    } else {
        // Handle Login
        try {
          await signInWithEmailAndPassword(auth, values.email, values.password);
          toast({
            title: "Login bem-sucedido!",
            description: "Redirecionando para o seu dashboard...",
          });
          router.push('/dashboard');
        } catch (error: any) {
          console.error("Firebase Auth Error:", error);
          let errorMessage = "Ocorreu um erro ao fazer login.";
          switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = 'Email ou senha inválidos.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'O formato do email é inválido.';
              break;
            default:
              errorMessage = 'Falha na autenticação. Tente novamente mais tarde.';
              break;
          }
          toast({
            title: "Erro de Login",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Login com Google bem-sucedido!",
        description: "Redirecionando para o seu dashboard...",
      });
      router.push('/dashboard');
    } catch (error: any) {
       console.error("Google Auth Error:", error);
       let title = "Erro de Login com Google";
       let description = "Não foi possível iniciar o login com o Google. Tente novamente.";
       
       switch (error.code) {
          case 'auth/popup-blocked':
            description = "O pop-up de login foi bloqueado pelo navegador. Por favor, habilite os pop-ups para este site e tente novamente.";
            break;
          case 'auth/popup-closed-by-user':
            description = "A janela de login foi fechada antes da conclusão. Tente novamente.";
            break;
          case 'auth/unauthorized-domain':
            title = "Domínio não Autorizado";
            description = "Este domínio não está autorizado para fazer login. Contate o administrador.";
            break;
       }

       toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    } finally {
       setIsGoogleLoading(false);
    }
  }
  
  async function handlePasswordReset() {
    const email = form.getValues("email");
    const emailValidation = z.string().email().safeParse(email);

    if (!emailValidation.success) {
      form.setError("email", { type: "manual", message: "Por favor, insira um e-mail válido para redefinir a senha." });
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido no campo de e-mail antes de solicitar a redefinição de senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail de redefinição enviado!",
        description: "Verifique sua caixa de entrada (e a pasta de spam) para o link de redefinição de senha.",
      });
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      let errorMessage = "Ocorreu um erro ao enviar o e-mail de redefinição.";
       if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhuma conta encontrada com este endereço de e-mail.';
      }
      toast({
        title: "Falha ao Redefinir Senha",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="grid gap-6">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Senha</FormLabel>
                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="ml-auto inline-block text-sm text-primary/80 underline-offset-4 hover:text-primary hover:underline focus:outline-none"
                    >
                      Esqueceu sua senha?
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="password" placeholder="Sua senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full group" size="lg" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <>
                <LogIn className="animate-pulse mr-2" />
                <span>{isRegisterMode ? 'Registrando...' : 'Entrando...'}</span>
              </>
            ) : (
                isRegisterMode ? (
                <>
                    <UserPlus />
                    <span>Criar Conta</span>
                </>
                ) : (
                <>
                    <span>Entrar na Plataforma</span>
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
                )
            )}
          </Button>
        </form>
      </Form>

        <div className="text-center text-sm">
            {isRegisterMode ? "Já tem uma conta? " : "Não tem uma conta? "}
            <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="font-semibold text-primary underline-offset-4 hover:underline"
                disabled={isLoading || isGoogleLoading}
            >
                {isRegisterMode ? "Faça login" : "Registre-se aqui"}
            </button>
        </div>

       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>
      </div>
      
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
        {isGoogleLoading ? (
            <LogIn className="animate-pulse mr-2" />
        ) : (
            <GoogleIcon className="mr-2 h-4 w-4"/>
        )}
        Entrar com Google
      </Button>
    </div>
  );
}
