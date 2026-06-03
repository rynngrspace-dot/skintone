"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RiwayatClient from "../../components/RiwayatClient";
import { fetchUserScanHistory } from "../actions/scanActions";
import { HistoryItem } from "../../components/HistoryCard";
import RiwayatLoading from "./loading";

export default function RiwayatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Guard: Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/riwayat");
    }
  }, [status, router]);

  // Load history data client-side using the Server Action
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const loadHistory = async () => {
        try {
          const userId = (session.user as any).id;
          const res = await fetchUserScanHistory(userId);
          if (res.success && res.scans) {
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
          }
        } catch (error) {
          console.error("Error loading scan history:", error);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadHistory();
    }
  }, [status, session]);

  // Show skeleton loader while loading the session or data
  if (status === "loading" || status === "unauthenticated" || loadingHistory) {
    return <RiwayatLoading />;
  }

  const userId = (session?.user as any)?.id || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <main className="flex-1 min-h-[calc(100vh-72px)] max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RiwayatClient initialItems={historyItems} userId={userId} />
      </main>
    </div>
  );
}
