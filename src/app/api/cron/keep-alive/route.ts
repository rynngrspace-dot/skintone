import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

/**
 * API route to ping the database and keep the Supabase connection active.
 * Protected by a token matching the CRON_SECRET environment variable.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Support both query param (?token=...) and Header (Authorization: Bearer ...)
  const token = searchParams.get("token") || req.headers.get("Authorization")?.split(" ")[1];

  const cronSecret = process.env.CRON_SECRET || "glowtone_keep_alive_secret_2026";

  if (token !== cronSecret) {
    return NextResponse.json(
      { error: "Akses tidak diizinkan. Token tidak valid." },
      { status: 401 }
    );
  }

  try {
    // Run a simple query to ping the Postgres database
    const result = await prisma.$queryRaw`SELECT 1 as ping`;

    return NextResponse.json({
      success: true,
      message: "Database berhasil diping untuk menjaga Supabase tetap aktif.",
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error("Keep-alive database ping error:", error);
    return NextResponse.json(
      { error: "Gagal melakukan ping ke database.", details: error.message },
      { status: 500 }
    );
  }
}
