import React from "react";

export default function RiwayatLoading() {
  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Page Title & Subtitle Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-[#FFD2D7]/30 rounded-full animate-pulse"></div>
        <div className="h-9 w-64 bg-[#2C2527]/10 rounded-2xl animate-pulse"></div>
        <div className="h-4 w-96 bg-[#7A6B6E]/15 rounded-xl animate-pulse"></div>
      </div>

      {/* Filter and Clear Filter Buttons Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-white/60 border border-[#FFD2D7]/40 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-5 w-28 bg-[#7A6B6E]/15 rounded-lg animate-pulse"></div>
      </div>

      {/* Card Skeletons Stack */}
      <div className="space-y-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 md:p-5 border border-[#FFD2D7]/40 flex flex-col md:flex-row gap-4 md:gap-5 items-stretch md:items-start bg-white/40"
          >
            {/* Image Thumbnail Skeleton */}
            <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square rounded-xl bg-gradient-to-br from-[#FFD2D7]/20 to-[#FFD2D7]/40 animate-pulse flex-shrink-0"></div>

            {/* Content Skeleton */}
            <div className="flex-1 flex flex-col justify-between space-y-6 w-full pt-1">
              <div className="space-y-4">
                {/* Title and Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-6 w-48 bg-[#2C2527]/10 rounded-xl animate-pulse"></div>
                  <div className="h-5 w-32 bg-[#FFD2D7]/20 rounded-full animate-pulse"></div>
                </div>

                {/* Timestamp */}
                <div className="h-4 w-36 bg-[#7A6B6E]/10 rounded-lg animate-pulse"></div>

                {/* Description Box */}
                <div className="h-16 w-full bg-white/30 rounded-xl border border-[#FFD2D7]/20 animate-pulse"></div>
              </div>

              {/* Recommendations Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#FFD2D7]/20 pt-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="bg-white/40 rounded-xl p-3 h-20 border border-[#FFD2D7]/10 animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
