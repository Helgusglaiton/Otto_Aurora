import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

import { getRevealedStatus } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const status = await getRevealedStatus();
    
    if (status === 'aurora') {
      return { title: "Bem-vinda, Aurora! 🩷", description: "Acompanhe a história da nossa pequena Aurora." };
    } else if (status === 'otto') {
      return { title: "Bem-vindo, Otto! 🩵", description: "Acompanhe a história do nosso pequeno Otto." };
    }
  } catch (e) {
    // Fallback se não tiver banco configurado
  }
  
  return {
    title: "Chá Revelação | Aurora ou Otto?",
    description: "Acompanhe a gestação e o nascimento do nosso bebê!",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${greatVibes.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
