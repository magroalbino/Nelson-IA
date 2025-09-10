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
            data-ai-hint={loginBg.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.3]"
            fill
            priority
          />
        )}
         <div className="absolute top-8 left-8 text-white flex items-center gap-3 bg-black/30 p-4 rounded-lg backdrop-blur-sm">
          <Logo className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider">Previdenciarista AI</h1>
            <p className="text-sm text-white/80">O futuro do direito previdenciário.</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 text-white max-w-md bg-black/30 p-4 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold">Decisões mais rápidas e inteligentes.</h2>
            <p className="mt-2 text-white/80">Nossa plataforma de IA analisa documentos, identifica oportunidades e gera petições, otimizando seu tempo e aumentando sua eficiência.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8 p-6">
          <div className="grid gap-3 text-center">
            <h1 className="text-3xl font-bold text-primary">Acesse sua Plataforma</h1>
            <p className="text-balance text-muted-foreground">
              Insira suas credenciais para começar a revolucionar sua advocacia previdenciária.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
