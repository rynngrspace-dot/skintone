"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userDisplayName = session?.user?.name || session?.user?.email || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const navLinks = [
    { href: "/", label: "Beranda & Katalog" },
    { href: "/deteksi", label: "Deteksi Kulit" },
    { href: "/riwayat", label: "Riwayat" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#FFD2D7]/60 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-pink to-[#FF6B81] flex items-center justify-center text-white shadow-md shadow-primary-pink/20 font-serif text-lg font-bold group-hover:shadow-lg group-hover:shadow-primary-pink/30 transition-shadow">G</div>
            <span className="text-xl font-serif font-bold tracking-tight text-[#2C2527] group-hover:text-primary-pink transition-colors">
              GlowTone <span className="text-primary-pink">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? "text-primary-pink bg-primary-pink/8"
                      : "text-[#7A6B6E] hover:text-[#2C2527] hover:bg-[#FFF0F2]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-pink rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Button + Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2.5">
                <div className="hidden sm:flex items-center space-x-2 bg-[#FFF0F2] border border-[#FFD2D7]/60 px-3 py-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary-pink/20 flex items-center justify-center text-primary-pink text-[10px] font-bold">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#2C2527] font-semibold max-w-[120px] truncate">
                     {userDisplayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2C2527] text-white hover:bg-black transition-all shadow-sm cursor-pointer hover:shadow-md"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary-pink text-white hover:bg-[#FF6B81] hover:shadow-lg hover:shadow-primary-pink/20 transition-all shadow-md"
              >
                Masuk
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[#FFF0F2] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2C2527]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#FFD2D7]/40 animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? "text-primary-pink bg-primary-pink/8"
                      : "text-[#7A6B6E] hover:text-[#2C2527] hover:bg-[#FFF0F2]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
