"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HistoryCard, { HistoryItem } from "./HistoryCard";
import { deleteScanHistoryItem, clearAllUserScans } from "../app/actions/scanActions";

interface RiwayatClientProps {
  initialItems: HistoryItem[];
  userId: string;
}

export default function RiwayatClient({ initialItems, userId }: RiwayatClientProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(initialItems);

  // Sync state if initialItems change (e.g. on SSR revalidation)
  useEffect(() => {
    setHistoryItems(initialItems);
  }, [initialItems]);

  const handleDeleteItem = async (id: string) => {
    const res = await deleteScanHistoryItem(id);
    if (res.success) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Gagal menghapus riwayat dari database.");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat deteksi Anda?")) {
      const res = await clearAllUserScans(userId);
      if (res.success) {
        setHistoryItems([]);
      } else {
        alert("Gagal mengosongkan riwayat dari database.");
      }
    }
  };

  return (
    <>
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
    </>
  );
}
