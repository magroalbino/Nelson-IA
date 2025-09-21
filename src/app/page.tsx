import Image from 'next/image';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';

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
            priority
          />
      </div>
    </div>
  );
}
