import Image from 'next/image';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';
import { AnimatedFeatureText } from '@/components/auth/animated-feature-text';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8 p-4">
           <div className="flex flex-col items-center text-center gap-4 mb-4">
              <Logo width={100} height={100} />
              <div>
                <h1 className="text-4xl font-bold font-heading text-primary tracking-tighter">
                  Eustáquio IA
                </h1>
                <p className="text-balance text-muted-foreground mt-1">
                  Seu assistente previdenciário.
                </p>
              </div>
          </div>
          <LoginForm />
        </div>
      </div>
       <div className="hidden lg:flex items-center justify-center bg-muted p-10 relative">
          <Image
            src="/assets/logo-eustaquio-3.png"
            alt="Eustáquio IA - Logomarca de fundo"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
           <div className="relative z-10 text-white max-w-2xl w-full h-full flex flex-col justify-end">
             <div className="bg-gradient-to-t from-black/60 via-black/30 to-transparent p-8 rounded-b-lg">
                <AnimatedFeatureText />
              </div>
          </div>
      </div>
    </div>
  );
}
