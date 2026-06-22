"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../actions/authActions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await requestPasswordReset(null, formData);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccessMessage(res.message);
        setEmail("");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#FFD2D7]/60 shadow-xl w-full max-w-md mx-auto space-y-7 animate-scaleIn bg-white/70 backdrop-blur-md">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-pink/15 to-primary-pink/5 text-primary-pink flex items-center justify-center mx-auto text-2xl shadow-sm border border-primary-pink/10">
                🔒
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2C2527]">Lupa Kata Sandi?</h2>
                <p className="text-xs text-[#7A6B6E] max-w-xs mx-auto mt-1 font-medium leading-relaxed">
                  Masukkan alamat email Anda yang terdaftar, kami akan mengirimkan link untuk mengatur ulang kata sandi Anda.
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
                {successMessage}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Alamat Email</label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8989A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccessMessage("");
                    }}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-[#FFD2D7] bg-white text-sm focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink/10 text-[#2C2527] placeholder:text-[#C8B8BA] transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-bold rounded-2xl bg-gradient-to-r from-primary-pink to-[#FF6B81] text-white hover:shadow-xl hover:shadow-primary-pink/25 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-pink/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mengirim Link...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
