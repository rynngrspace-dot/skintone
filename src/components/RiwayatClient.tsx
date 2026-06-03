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

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Sync state if initialItems change (e.g. on SSR revalidation)
  useEffect(() => {
    setHistoryItems(initialItems);
  }, [initialItems]);

  const handleDeleteItem = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Riwayat",
      message: "Apakah Anda yakin ingin menghapus item riwayat pemindaian ini?",
      confirmText: "Hapus",
      onConfirm: async () => {
        const res = await deleteScanHistoryItem(id);
        if (res.success) {
          setHistoryItems((prev) => prev.filter((item) => item.id !== id));
          setToast({ show: true, message: "Item riwayat berhasil dihapus.", type: "success" });
        } else {
          setToast({ show: true, message: "Gagal menghapus riwayat dari database.", type: "error" });
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleClearAll = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Kosongkan Riwayat",
      message: "Apakah Anda yakin ingin menghapus seluruh riwayat deteksi Anda? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Kosongkan Semua",
      onConfirm: async () => {
        const res = await clearAllUserScans(userId);
        if (res.success) {
          setHistoryItems([]);
          setToast({ show: true, message: "Seluruh riwayat berhasil dikosongkan.", type: "success" });
        } else {
          setToast({ show: true, message: "Gagal mengosongkan riwayat dari database.", type: "error" });
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
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
      {/* Custom Confirm Dialog (Shadcn style) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Custom Toast (Shadcn style) */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}

// ==========================================
// Sub-components (Shadcn UI style)
// ==========================================

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
  isOpen,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      ></div>
      
      {/* Modal Card */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-[#FFD2D7]/60 shadow-2xl p-6 max-w-sm w-full mx-auto animate-scaleIn space-y-5 font-sans z-10">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-[#2C2527] leading-none">{title}</h3>
          <p className="text-xs text-[#7A6B6E] leading-relaxed font-medium">{message}</p>
        </div>
        
        <div className="flex justify-end gap-2.5 pt-1">
          <button
            onClick={onCancel}
            className="px-4.5 py-2.5 text-xs font-semibold rounded-xl bg-white border border-[#FFD2D7]/80 text-[#7A6B6E] hover:bg-[#FFF0F2] hover:text-[#2C2527] transition-all cursor-pointer shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4.5 py-2.5 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10 transition-all cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slideUp px-4 sm:px-0">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
        type === "success" 
          ? "bg-white/90 border-green-200 text-green-800 shadow-green-100/50" 
          : "bg-white/90 border-red-200 text-red-800 shadow-red-100/50"
      }`}>
        <div className="flex-shrink-0">
          {type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-[11px] font-bold text-[#2C2527] leading-snug">{message}</p>
        </div>

        <button 
          onClick={onClose} 
          className="text-[#A8989A] hover:text-[#2C2527] transition-colors p-1 rounded-lg cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
