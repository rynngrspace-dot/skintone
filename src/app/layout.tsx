import type { Metadata } from "next";
import { Plus_Jakarta_Sans, League_Spartan } from "next/font/google";
import "./globals.css";

import SessionProviderWrapper from "../components/SessionProviderWrapper";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GlowTone AI - Analisis Warna Kulit & Rekomendasi Makeup",
  description: "Analisis warna kulit pintar menggunakan YOLOv5 untuk mendapatkan rekomendasi kosmetik yang paling cocok secara personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${leagueSpartan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased">
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
