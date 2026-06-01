import React from "react";
import Image from "next/image";

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
  const getSkinToneColor = (cls: string) => {
    if (cls === "light") return "#F5D6C6";
    if (cls === "mid-dark") return "#D2A27E";
    return "#8D5B4C";
  };

  const getSkinToneBg = (cls: string) => {
    if (cls === "light") return "bg-orange-50";
    if (cls === "mid-dark") return "bg-amber-50";
    return "bg-stone-100";
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-[#FFD2D7]/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-36 aspect-square sm:aspect-auto sm:min-h-[160px] overflow-hidden bg-black flex-shrink-0">
        <Image
          src={item.image}
          alt="Scan Face"
          fill
          sizes="(max-width: 768px) 100vw, 144px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Skin tone color indicator overlay */}
        <div className="absolute bottom-3 left-3">
          <div className={`flex items-center gap-1.5 ${getSkinToneBg(item.skinToneClass)} backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm`}>
            <span
              className="w-3 h-3 rounded-full inline-block border border-black/10 shadow-sm"
              style={{ backgroundColor: getSkinToneColor(item.skinToneClass) }}
            ></span>
            <span className="text-[9px] font-bold text-[#2C2527] uppercase">{item.skinToneClass}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-3 relative">
        {/* Delete trigger */}
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white hover:bg-red-50 hover:text-red-500 transition-all border border-[#FFD2D7]/60 text-[#A8989A] flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
          title="Hapus dari Riwayat"
        >
          ✕
        </button>

        <div>
          <h3 className="text-sm font-bold text-[#2C2527] pr-10">{item.skinToneLabel}</h3>
          <p className="text-[10px] text-[#A8989A] mt-1 font-semibold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {new Date(item.timestamp).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short"
            })}
          </p>
        </div>

        {/* Recommendations row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-primary-pink/8 pt-3">
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1">
            <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1">
              🧴 Foundation
            </span>
            <p className="text-[11px] text-[#7A6B6E] font-medium leading-snug">{item.recommendations.foundation}</p>
          </div>
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1">
            <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1">
              🍑 Blush On
            </span>
            <p className="text-[11px] text-[#7A6B6E] font-medium leading-snug">{item.recommendations.blush}</p>
          </div>
          <div className="bg-[#FFF8F9] rounded-xl p-3 space-y-1">
            <span className="text-[9px] font-extrabold text-primary-pink uppercase tracking-wider flex items-center gap-1">
              💄 Lipstik
            </span>
            <p className="text-[11px] text-[#7A6B6E] font-medium leading-snug">{item.recommendations.lipstik}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
