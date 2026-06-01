"use server";

import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

interface ScanDataInput {
  image: string;
  skinToneClass: string;
  skinToneLabel: string;
  foundationRec: string;
  blushRec: string;
  lipstikRec: string;
}

/**
 * Saves a new face skin tone scan to the database via Prisma ORM.
 */
export async function saveScanToDatabase(userId: string, scanData: ScanDataInput) {
  try {
    const newScan = await prisma.scanHistory.create({
      data: {
        userId,
        image: scanData.image,
        skinToneClass: scanData.skinToneClass,
        skinToneLabel: scanData.skinToneLabel,
        foundationRec: scanData.foundationRec,
        blushRec: scanData.blushRec,
        lipstikRec: scanData.lipstikRec
      }
    });

    revalidatePath("/riwayat");
    return { success: true, scan: newScan };
  } catch (error: any) {
    console.error("saveScanToDatabase error:", error);
    return { success: false, error: error?.message || "Failed to save scan." };
  }
}

/**
 * Fetches all past skin tone scans of the user, ordered by timestamp descending.
 */
export async function fetchUserScanHistory(userId: string) {
  try {
    const scans = await prisma.scanHistory.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" }
    });

    return { success: true, scans };
  } catch (error: any) {
    console.error("fetchUserScanHistory error:", error);
    return { success: false, error: error?.message || "Failed to fetch scans.", scans: [] };
  }
}

/**
 * Deletes a single scan history record.
 */
export async function deleteScanHistoryItem(scanId: string) {
  try {
    await prisma.scanHistory.delete({
      where: { id: scanId }
    });

    revalidatePath("/riwayat");
    return { success: true };
  } catch (error: any) {
    console.error("deleteScanHistoryItem error:", error);
    return { success: false, error: error?.message || "Failed to delete scan." };
  }
}

/**
 * Deletes all scan history records for a user.
 */
export async function clearAllUserScans(userId: string) {
  try {
    await prisma.scanHistory.deleteMany({
      where: { userId }
    });

    revalidatePath("/riwayat");
    return { success: true };
  } catch (error: any) {
    console.error("clearAllUserScans error:", error);
    return { success: false, error: error?.message || "Failed to clear history." };
  }
}
