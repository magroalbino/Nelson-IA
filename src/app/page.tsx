"use client";

import Image from 'next/image';
import { Logo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';
import { AnimatedFeatureText } from '@/components/auth/animated-feature-text';
import { useTheme } from "next-themes";
import { useEffect } from 'react';

export default function Home() {
  const currentYear = new Date().getFullYear();
  const { setTheme } = useTheme();

  // Força o modo claro na tela de login conforme solicitado
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="fixed inset-0 w-full lg:grid lg:grid-cols-2 bg-white">
      {/* Lado Esquerdo: Formulário */}
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="mx-auto grid w-[380px] gap-8 p-4">
           <div className="flex flex-col items-center text-center gap-4 mb-4">
              <Logo className="w-20 h-auto" />
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                  Nelson IA
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  Seu assistente previdenciário inteligente.
                </p>
              </div>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Lado Direito: Visual e Texto Animado */}
       <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Imagem de fundo com overlay para garantir leitura */}
            <div className="absolute inset-0 z-0">
                <Image
                src="/assets/logo-nelson-3.png"
                alt="Logo Nelson IA"
                fill
                className="object-cover opacity-40 scale-110"
                priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900/90" />
            </div>

           <div className="relative z-10 w-full max-w-xl px-12 py-20">
             <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl">
                <AnimatedFeatureText />
              </div>
          </div>

          <div className="absolute bottom-8 left-12 z-10">
            <p className="text-sm font-medium text-white/50">
              © {currentYear} Nelson IA. Inteligência Artificial aplicada ao Direito.
            </p>
          </div>
      </div>
    </div>
  );
}
