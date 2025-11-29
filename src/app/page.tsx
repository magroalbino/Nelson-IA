
import Image from 'next/image';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';
import { AnimatedFeatureText } from '@/components/auth/animated-feature-text';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const currentYear = new Date().getFullYear();
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-bg');

  return (
    <div className="fixed inset-0 w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[380px] gap-8 p-4">
           <div className="flex flex-col items-center text-center gap-4 mb-4">
              <Logo className="w-24 h-auto" />
              <div>
                <h1 className="text-4xl font-bold font-heading text-black dark:text-white tracking-tighter">
                  Nelson IA
                </h1>
                <p className="text-balance text-muted-foreground mt-1">
                  Seu assistente previdenciário.
                </p>
              </div>
          </div>
          <LoginForm />
        </div>
      </div>
       <div className="hidden lg:flex items-end justify-center bg-background relative pb-20">
          {loginBg && (
            <Image
              src={loginBg.imageUrl}
              alt={loginBg.description}
              fill
              className="object-cover"
              sizes="50vw"
              priority
              data-ai-hint={loginBg.imageHint}
            />
          )}
           <div className="relative z-10 text-foreground max-w-2xl w-full p-10">
             <div className="bg-gradient-to-t from-background/80 via-background/50 to-transparent p-8 rounded-lg">
                <AnimatedFeatureText />
              </div>
          </div>
          <div className="absolute bottom-4 right-4 z-10 p-4 text-right">
            <p className="text-xs text-white/70">
              © {currentYear} Nelson IA. Todos os direitos reservados.
            </p>
          </div>
      </div>
    </div>
  );
}
