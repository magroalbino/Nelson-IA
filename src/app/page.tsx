import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';

export default function Home() {
  const loginBg = PlaceHolderImages.find(img => img.id === 'login-bg');
  
  return (
    <div className="relative min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8 p-4">
           <div className="flex flex-col items-center text-center gap-2 mb-4">
              <Logo className="h-16 w-16 text-primary" />
              <h1 className="text-3xl font-bold font-heading text-primary tracking-tighter">
                Túlio IA
              </h1>
              <p className="text-balance text-muted-foreground">
                Seu assistente previdenciário.
              </p>
          </div>
          <LoginForm />
        </div>
      </div>
       <div className="hidden lg:block relative group">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            data-ai-hint={loginBg.imageHint}
            className="h-full w-full object-cover brightness-50 group-hover:brightness-75 transition-all duration-300"
            fill
            priority
          />
        )}
         <div className="absolute bottom-0 left-0 right-0 p-8 text-white bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <h2 className="text-2xl font-bold font-heading">Decisões mais rápidas e inteligentes.</h2>
            <p className="mt-2 text-lg text-white/80 max-w-xl">
              Eu analiso documentos, identifico oportunidades e gero petições, otimizando seu tempo e aumentando sua eficiência.
            </p>
        </div>
      </div>
    </div>
  );
}
