import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Lexend_Deca } from 'next/font/google';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Túlio IA – Seu Assistente Previdenciário',
  description: 'Análise de documentos, geração de petições e planejamento previdenciário com IA.',
};

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-heading',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
