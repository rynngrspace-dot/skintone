"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../actions/authActions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", token);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await resetPassword(null, formData);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccessMessage(res.message);
        setPassword("");
        setConfirmPassword("");
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#FFD2D7]/60 shadow-xl w-full max-w-md mx-auto text-center space-y-5 bg-white/70 backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl border border-red-100">
          ⚠️
        </div>
        <h2 className="text-xl font-serif font-bold text-[#2C2527]">Token Tidak Valid</h2>
        <p className="text-xs text-[#7A6B6E] leading-relaxed">
          Link reset kata sandi tidak lengkap atau tidak valid. Silakan minta link reset baru melalui halaman lupa kata sandi.
        </p>
        <Link href="/forgot-password" className="inline-block w-full py-3.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-primary-pink to-[#FF6B81] text-white transition-all shadow-md">
          Minta Link Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#FFD2D7]/60 shadow-xl w-full max-w-md mx-auto space-y-7 bg-white/70 backdrop-blur-md animate-scaleIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-pink/15 to-primary-pink/5 text-primary-pink flex items-center justify-center mx-auto text-2xl shadow-sm border border-primary-pink/10">
          🔄
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C2527]">Reset Kata Sandi</h2>
          <p className="text-xs text-[#7A6B6E] max-w-xs mx-auto mt-1 font-medium leading-relaxed">
            Ketikkan kata sandi baru untuk akun email: <br />
            <strong className="text-primary-pink">{email}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs py-2.5 px-4 rounded-xl text-center font-medium animate-slideDown flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs py-2.5 px-4 rounded-xl text-center font-medium animate-slideDown flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-bold">{successMessage}</p>
            <p className="text-[10px] mt-0.5 opacity-80">Mengalihkan ke halaman masuk...</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Kata Sandi Baru</label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8989A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              disabled={loading || !!successMessage}
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#FFD2D7] bg-white text-sm focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink/10 text-[#2C2527] placeholder:text-[#C8B8BA] transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8989A] hover:text-primary-pink transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8989A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
              disabled={loading || !!successMessage}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-[#FFD2D7] bg-white text-sm focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink/10 text-[#2C2527] placeholder:text-[#C8B8BA] transition-all disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!successMessage}
          className="w-full py-4 text-sm font-bold rounded-2xl bg-gradient-to-r from-primary-pink to-[#FF6B81] text-white hover:shadow-xl hover:shadow-primary-pink/25 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-pink/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Memperbarui...
            </>
          ) : (
            "Perbarui Kata Sandi"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-4">
          <Link href="/login" className="inline-flex items-center space-x-2 text-xs font-bold text-[#7A6B6E] hover:text-primary-pink transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
