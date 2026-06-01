import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/70 backdrop-blur-md border-t border-[#FFD2D7]/40 py-12 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Logo & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-pink to-[#FF6B81] flex items-center justify-center text-white shadow-sm font-serif text-base font-bold">G</div>
              <span className="text-lg font-serif font-bold tracking-tight text-[#2C2527]">
                GlowTone <span className="text-primary-pink">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#7A6B6E] leading-relaxed max-w-sm font-medium">
              GlowTone AI menggunakan teknologi Computer Vision YOLOv5 untuk mendeteksi kecocokan warna kulit wajah alami dan menyajikan rekomendasi shade kosmetik terbaik secara akurat dan personal.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-7 space-y-4">
            <h4 className="text-[10px] font-bold text-[#2C2527] uppercase tracking-widest">Navigasi Fitur</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/" className="text-[#7A6B6E] hover:text-primary-pink transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary-pink/40"></span>
                  Beranda & Katalog
                </Link>
              </li>
              <li>
                <Link href="/deteksi" className="text-[#7A6B6E] hover:text-primary-pink transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary-pink/40"></span>
                  Deteksi Skin Tone
                </Link>
              </li>
              <li>
                <Link href="/riwayat" className="text-[#7A6B6E] hover:text-primary-pink transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary-pink/40"></span>
                  Riwayat Pemindaian
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform info */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold text-[#2C2527] uppercase tracking-widest">Tentang Platform</h4>
            <p className="text-xs text-[#7A6B6E] leading-relaxed font-medium">
              Platform analisis warna kulit berbasis AI yang membantu Anda menemukan shade kosmetik paling cocok secara personal dan akurat.
            </p>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-primary-pink/8 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#A8989A] font-semibold">
          <p>© 2026 GlowTone AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
