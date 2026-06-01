"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "../../components/LoginForm";

import Link from "next/link";
import { useSession } from "next-auth/react";

function LoginFormContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  // Get redirect target (defaults to '/deteksi')
  const redirectTo = searchParams.get("redirect") || "/deteksi";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, router, redirectTo]);

  const handleLoginSuccess = () => {
    router.replace(redirectTo);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
        </div>
      </div>
    );
  }

  return <LoginForm onSuccess={handleLoginSuccess} />;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-[#7A6B6E] hover:text-primary-pink transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Kembali ke Beranda</span>
          </Link>
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
              </div>
            </div>
          }>
            <LoginFormContainer />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
