import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';

export default function Home() {
  const loginBg = PlaceHolderImages.find(img => img.id === 'login-bg');
  
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            width={1200}
            height={800}
            data-ai-hint={loginBg.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
         <div className="absolute top-8 left-8 text-white flex items-center gap-2">
          <Logo className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold tracking-wider">Previdenciarista AI</h1>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Acesse sua conta para utilizar as ferramentas de IA.
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <a href="#" className="underline">
              Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
