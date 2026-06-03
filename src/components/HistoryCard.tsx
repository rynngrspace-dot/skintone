import React from "react";
import Image from "next/image";
import { kamusWarnaLokal } from "../services/api";

export interface HistoryItem {
  id: string;
  timestamp: string;
  image: string;
  skinToneClass: "light" | "mid-dark" | "dark";
  skinToneLabel: string;
  recommendations: {
    foundation: string;
    blush: string;
    lipstik: string;
  };
}

interface HistoryCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
}

export default function HistoryCard({ item, onDelete }: HistoryCardProps) {
  // Safe lookup with fallback
  const localData = kamusWarnaLokal[item.skinToneClass] || {
    color: "#F5D6C6",
    penjelasan: ""
  };

  const getSkinToneBg = (cls: string) => {
    if (cls === "light") return "bg-orange-50";
    if (cls === "mid-dark") return "bg-amber-50";
    return "bg-stone-100";
  };

  // Helper to extract shade keywords and map to exact colors
  const getShadeColors = (recText: string): Array<{ name: string; hex: string }> => {
    const shadesMap: Record<string, string> = {
      // Foundation
      "ivory": "#F9E4D4",
      "fair": "#FCE8DB",
      "beige": "#E8C8B0",
      "sand": "#DEC0A5",
      "honey": "#CFA37E",
      "warm beige": "#D6A885",
      "caramel": "#B0835D",
      "cocoa": "#7C5335",
      "espresso": "#4C2D18",
      // Blush
      "soft pink": "#FFB7C5",
      "peach": "#FFD1B3",
      "coral": "#FF7F50",
      "mauve": "#D69CA9",
      "rose": "#C08081",
      "apricot": "#FBAC83",
      "deep berry": "#8A2E44",
      "plum": "#6B3047",
      "merah bata": "#A04040",
      // Lipstick
      "nude pink": "#E09A97",
      "soft peach": "#F4A284",
      "berry": "#C84E6D",
      "terracotta": "#C36241",
      "brick red": "#A52A2A",
      "warm nude": "#B58778",
      "burgundy": "#800020",
      "deep plum": "#4E1627",
      "cokelat kemerahan": "#8B5A2B"
    };

    const foundShades: Array<{ name: string; hex: string }> = [];
    const lowerText = recText.toLowerCase();

    Object.entries(shadesMap).forEach(([name, hex]) => {
      if (lowerText.includes(name)) {
        const capName = name.replace(/\b\w/g, (c) => c.toUpperCase());
        foundShades.push({ name: capName, hex });
      }
    });

    return foundShades;
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 border border-[#FFD2D7]/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 md:gap-5 items-stretch md:items-start group bg-white/60">
      {/* Thumbnail */}
      <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square rounded-xl overflow-hidden bg-black flex-shrink-0">
        <Image
          src={item.image}
          alt="Scan Face"
          fill
          sizes="(max-width: 768px) 100vw, 256px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Skin tone color indicator overlay */}
        <div className="absolute bottom-3 left-3">
          <div className={`flex items-center gap-1.5 ${getSkinToneBg(item.skinToneClass)} backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50`}>
            <span
              className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-sm"
              style={{ backgroundColor: localData.color }}
            ></span>
            <span className="text-[10px] font-extrabold text-[#2C2527] uppercase tracking-wider">{item.skinToneClass}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between space-y-4 relative w-full pt-1">
        {/* Delete trigger */}
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-0 right-0 w-8 h-8 rounded-xl bg-white hover:bg-red-50 hover:text-red-500 transition-all border border-[#FFD2D7]/60 text-[#A8989A] flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
          title="Hapus dari Riwayat"
        >
          ✕
        </button>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#2C2527]">{item.skinToneLabel}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-pink/10 text-primary-pink border border-primary-pink/15">
              Kode Warna: {localData.color}
            </span>
          </div>
          <p className="text-[10px] text-[#A8989A] font-semibold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {new Date(item.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short"
            })}
          </p>
        </div>

        {/* Description / Penjelasan */}
        {localData.penjelasan && (
          <div className="text-xs text-[#7A6B6E] leading-relaxed bg-white/45 p-3.5 rounded-xl border border-[#FFD2D7]/30 font-medium">
            <span className="font-extrabold text-[#2C2527] block text-[10px] uppercase tracking-wide mb-1">📝 Karakteristik Kulit:</span>
            {localData.penjelasan}
          </div>
        )}

        {/* Recommendations row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#FFD2D7]/30 pt-4">
          {/* Foundation */}
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1 border border-[#FFD2D7]/20 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1 mb-1">
                🧴 Foundation
              </span>
              <p className="text-[11px] text-[#2C2527] font-bold leading-snug">{item.recommendations.foundation}</p>
            </div>
            {/* Visual Swatches */}
            {getShadeColors(item.recommendations.foundation).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-[#FFD2D7]/15">
                {getShadeColors(item.recommendations.foundation).map((s, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white border border-[#FFD2D7]/30 text-[#7A6B6E] shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm flex-shrink-0" style={{ backgroundColor: s.hex }}></span>
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Blush On */}
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1 border border-[#FFD2D7]/20 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1 mb-1">
                🍑 Blush On
              </span>
              <p className="text-[11px] text-[#2C2527] font-bold leading-snug">{item.recommendations.blush}</p>
            </div>
            {/* Visual Swatches */}
            {getShadeColors(item.recommendations.blush).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-[#FFD2D7]/15">
                {getShadeColors(item.recommendations.blush).map((s, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white border border-[#FFD2D7]/30 text-[#7A6B6E] shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm flex-shrink-0" style={{ backgroundColor: s.hex }}></span>
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lipstik */}
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1 border border-[#FFD2D7]/20 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1 mb-1">
                💄 Lipstik
              </span>
              <p className="text-[11px] text-[#2C2527] font-bold leading-snug">{item.recommendations.lipstik}</p>
            </div>
            {/* Visual Swatches */}
            {getShadeColors(item.recommendations.lipstik).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-[#FFD2D7]/15">
                {getShadeColors(item.recommendations.lipstik).map((s, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white border border-[#FFD2D7]/30 text-[#7A6B6E] shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm flex-shrink-0" style={{ backgroundColor: s.hex }}></span>
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
