import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import RiwayatClient from "../../components/RiwayatClient";
import { fetchUserScanHistory } from "../actions/scanActions";
import { HistoryItem } from "../../components/HistoryCard";

export default async function RiwayatPage() {
  // 1. Authenticate user on the server (instantly blocks unauthorized access)
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?redirect=/riwayat");
  }

  const userId = (session.user as any).id;

  // 2. Fetch scan history directly on the server (SSR - no client-side loading spinners!)
  const res = await fetchUserScanHistory(userId);
  let mappedItems: HistoryItem[] = [];

  if (res.success && res.scans) {
    mappedItems = res.scans.map((scan: any) => ({
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
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <main className="flex-1 min-h-[calc(100vh-72px)] max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RiwayatClient initialItems={mappedItems} userId={userId} />
      </main>

    </div>
  );
}
