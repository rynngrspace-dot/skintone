"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import HistoryCard, { HistoryItem } from "../../components/HistoryCard";
import { fetchUserScanHistory, deleteScanHistoryItem, clearAllUserScans } from "../actions/scanActions";
import Footer from "../../components/Footer";

export default function RiwayatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Auth Redirect Guard & Load History from Database via Server Action
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login?redirect=/riwayat");
    } else if (status === "authenticated" && session?.user) {
      const userId = (session.user as any).id;
      
      const loadHistory = async () => {
        const res = await fetchUserScanHistory(userId);
        if (res.success && res.scans) {
          // Map DB schema scans to HistoryItem props expected by HistoryCard
          const mappedItems: HistoryItem[] = res.scans.map((scan: any) => ({
            id: scan.id,
            timestamp: typeof scan.timestamp === "string" ? scan.timestamp : new Date(scan.timestamp).toISOString(),
            image: scan.image,
            skinToneClass: scan.skinToneClass as "light" | "mid-dark" | "dark",
            skinToneLabel: scan.skinToneLabel,
            recommendations: {
              foundation: scan.foundationRec,
              blush: scan.blushRec,
              lipstik: scan.lipstikRec
            }
          }));
          setHistoryItems(mappedItems);
        } else {
          console.error("Failed to load user scan history:", res.error);
        }
        setIsCheckingAuth(false);
      };

      loadHistory();
    }
  }, [status, session]);

  // Delete single history item from Database
  const handleDeleteItem = async (id: string) => {
    const res = await deleteScanHistoryItem(id);
    if (res.success) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Gagal menghapus riwayat dari database.");
    }
  };

  // Clear all history items from Database
  const handleClearAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat deteksi Anda?")) {
      if (session?.user) {
        const userId = (session.user as any).id;
        const res = await clearAllUserScans(userId);
        if (res.success) {
          setHistoryItems([]);
        } else {
          alert("Gagal mengosongkan riwayat dari database.");
        }
      }
    }
  };

  if (isCheckingAuth || status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <Navbar />

      <main className="flex-1 min-h-[calc(100vh-72px)] max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-[#FFD2D7]/30 font-sans animate-slideUp">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-pink/10 text-primary-pink text-[11px] font-bold tracking-wider uppercase border border-primary-pink/15">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-pink animate-pulse"></span>
              <span>Scan Archive</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#2C2527] tracking-tight">Riwayat Pemindaian</h1>
            <p className="text-sm text-[#7A6B6E] font-medium">Kumpulan hasil deteksi skin tone dan kecocokan kosmetik Anda sebelumnya</p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Bersihkan Semua
            </button>
          )}
        </div>

        {/* List of Scans */}
        {historyItems.length > 0 ? (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-xs text-[#7A6B6E] font-semibold mb-2">
              <span className="text-primary-pink font-bold">{historyItems.length}</span> hasil pemindaian ditemukan
            </p>
            {historyItems.map((item, index) => (
              <div key={item.id} className="animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
                <HistoryCard
                  item={item}
                  onDelete={handleDeleteItem}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#FFD2D7]/60 shadow-sm max-w-xl mx-auto space-y-4 animate-scaleIn font-sans">
            <div className="w-16 h-16 rounded-2xl bg-primary-pink/10 text-primary-pink flex items-center justify-center mx-auto text-2xl shadow-sm">
              📂
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#2C2527]">Belum Ada Riwayat</h3>
              <p className="text-xs text-[#7A6B6E] max-w-xs mx-auto font-medium">
                Anda belum memiliki riwayat pemindaian wajah di database. Mulailah melakukan deteksi sekarang!
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => router.push("/deteksi")}
                className="px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-primary-pink to-[#FF6B81] text-white hover:shadow-lg hover:shadow-primary-pink/20 transition-all shadow-md cursor-pointer"
              >
                Mulai Deteksi Sekarang
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
