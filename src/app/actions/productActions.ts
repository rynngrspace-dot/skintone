"use server";

import prisma from "../../lib/prisma";

export interface DBProduct {
  id: number;
  kategori: string;
  brand: string;
  nama_produk: string;
  gambar: string;
  harga: string;
  rating: number;
  target_skintone?: string[];
}

// Map database Prisma model (camelCase) to frontend interface (snake_case)
function mapProduct(p: any): DBProduct {
  return {
    id: p.id,
    kategori: p.kategori,
    brand: p.brand,
    nama_produk: p.namaProduk,
    gambar: p.gambar,
    harga: p.harga,
    rating: p.rating,
    target_skintone: p.targetSkintone || []
  };
}

/**
 * Fetches all products from the database, ordered by category and ID.
 */
export async function fetchProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { kategori: "asc" },
        { id: "asc" }
      ]
    });
    return {
      success: true,
      products: products.map(mapProduct)
    };
  } catch (error: any) {
    console.error("fetchProducts error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memuat katalog produk dari database.",
      products: []
    };
  }
}

/**
 * Fetches a single product by ID and up to 4 similar products in the same category.
 */
export async function fetchProductById(productId: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    // Fetch up to 4 similar products in the same category, excluding the current product
    const similarRaw = await prisma.product.findMany({
      where: {
        kategori: product.kategori,
        id: { not: productId }
      },
      take: 4
    });

    return {
      success: true,
      product: mapProduct(product),
      similarProducts: similarRaw.map(mapProduct)
    };
  } catch (error: any) {
    console.error("fetchProductById error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memuat detail produk."
    };
  }
}
