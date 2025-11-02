

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
import { ArrowRight, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.113-11.28-7.561l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.688,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Changed initial state
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const action = isRegisterMode ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
    const successTitle = isRegisterMode ? "Conta criada com sucesso!" : "Login bem-sucedido!";
    const errorTitle = isRegisterMode ? "Erro de Registro" : "Erro de Login";
    
    try {
        await action(auth, values.email, values.password);
        toast({
            title: successTitle,
            description: "Redirecionando para o seu dashboard...",
        });
        // onAuthStateChanged will handle the redirect
    } catch (error: any) {
        console.error(`Firebase ${isRegisterMode ? 'Register' : 'Login'} Error:`, error);
        let errorMessage = "Ocorreu um erro. Tente novamente.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este endereço de e-mail já está em uso.';
                break;
            case 'auth/weak-password':
                errorMessage = 'A senha é muito fraca. Tente uma mais forte.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = 'Email ou senha inválidos.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'O formato do email é inválido.';
              break;
        }
        toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // On success, onAuthStateChanged will trigger and handle the redirect.
      toast({
        title: "Login com Google bem-sucedido!",
        description: "Redirecionando para o seu dashboard...",
      });
    } catch (error: any) {
       console.error("Google Auth Popup Error:", error);
       let title = "Erro de Login com Google";
       let description = "Não foi possível completar o login.";

       if (error.code === 'auth/popup-blocked') {
            title = "Pop-up Bloqueado";
            description = "Seu navegador bloqueou o pop-up de login do Google. Por favor, habilite pop-ups para este site e tente novamente.";
       } else if (error.code === 'auth/unauthorized-domain') {
            title = "AÇÃO NECESSÁRIA: Domínio Não Autorizado";
            description = "O domínio da sua aplicação não está autorizado no Firebase. Para corrigir, acesse seu Firebase Console > Authentication > Settings > Authorized domains e adicione o domínio. Este passo é crucial para a segurança.";
       }

       toast({
        title: title,
        description: description,
        variant: "destructive",
        duration: 9000,
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
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  const anyLoading = isLoading || isGoogleLoading || user;

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
                  <Input placeholder="Seu@email.com" {...field} disabled={anyLoading} />
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
                      className="ml-auto inline-block text-sm text-primary/80 underline-offset-4 hover:text-primary hover:underline focus:outline-none disabled:opacity-50"
                      disabled={anyLoading}
                    >
                      Esqueceu sua senha?
                    </button>
                  )}
                </div>
                <FormControl>
                  <Input type="password" placeholder="Sua senha" {...field} disabled={anyLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full group" size="lg" disabled={anyLoading}>
            {isLoading && isRegisterMode ? (
                <span>Registrando...</span>
            ) : isLoading ? (
                <span>Entrando...</span>
             ) : user ? (
                <span>Redirecionando...</span>
            ) : isRegisterMode ? (
                <>
                    <UserPlus />
                    <span>Criar Conta</span>
                </>
            ) : (
                <>
                    <span>Entrar na Plataforma</span>
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
            )}
          </Button>
        </form>
      </Form>

        <div className="text-center text-sm">
            {isRegisterMode ? "Já tem uma conta? " : "Não tem uma conta? "}
            <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
                disabled={anyLoading}
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
      
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={anyLoading}>
        {isGoogleLoading || user ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
        ) : (
            <GoogleIcon className="mr-2 h-4 w-4"/>
        )}
        Entrar com Google
      </Button>
    </div>
  );
}
