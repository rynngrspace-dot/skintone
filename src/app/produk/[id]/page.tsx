"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import ProductCard from "../../../components/ProductCard";
import Footer from "../../../components/Footer";
import { katalogProduk } from "../../../data/katalogProduk";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = parseInt(resolvedParams.id, 10);

  // Find the product by ID
  const product = katalogProduk.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold font-serif">Produk Tidak Ditemukan</h2>
          <p className="text-sm text-[#7A6B6E]">Produk yang Anda cari tidak tersedia di katalog.</p>
          <Link href="/" className="px-6 py-2.5 text-xs font-bold rounded-full bg-primary-pink text-white hover:bg-[#FF6B81] transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const getSkinToneDetails = (tone: string) => {
    if (tone === "light") return { name: "Light (Kuning Langsat/Terang)", color: "#F5D6C6" };
    if (tone === "mid-dark") return { name: "Medium (Sawo Matang)", color: "#D2A27E" };
    return { name: "Dark (Cokelat Tua/Gelap)", color: "#8D5B4C" };
  };

  const getSuggestionText = () => {
    const tones = product.target_skintone?.map((t) => getSkinToneDetails(t).name).join(", ");
    return `${product.nama_produk} oleh ${product.brand} merupakan produk pilihan berkualitas tinggi dengan formula khusus yang mudah dibaurkan dan tahan lama. ${
      tones
        ? `Sangat cocok diaplikasikan pada warna kulit ${tones} untuk memberikan hasil akhir yang natural, menyatu sempurna dengan kulit asli, serta menonjolkan kecantikan alami Anda.`
        : "Cocok untuk semua jenis dan warna kulit, memberikan sentuhan riasan yang halus, segar, dan menawan sepanjang hari."
    }`;
  };

  // Filter similar products (same category, excluding current product)
  const similarProducts = katalogProduk
    .filter((p) => p.kategori === product.kategori && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/10 w-80 h-80 rounded-full bg-primary-pink/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#FFD2D7]/30 blur-3xl"></div>
      </div>

      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Button Link */}
        <div className="flex justify-start animate-fadeIn">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-xs font-bold text-[#7A6B6E] hover:text-primary-pink bg-white border border-[#FFD2D7] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>←</span> Kembali
          </button>
        </div>

        {/* Product Details Section Card */}
        <div className="glass-card rounded-3xl p-6 md:p-10 border border-[#FFD2D7] shadow-xl flex flex-col md:flex-row gap-8 md:gap-12 animate-fadeIn bg-white/70">
          
          {/* Left Column: Image Display */}
          <div className="w-full md:w-80 aspect-square md:h-80 relative rounded-2xl overflow-hidden bg-white border border-[#FFD2D7] shrink-0 self-center shadow-md">
            <Image
              src={product.gambar}
              alt={product.nama_produk}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Right Column: Specification details */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-primary-pink uppercase tracking-widest">{product.brand}</span>
                <span className="bg-primary-pink/10 text-primary-pink text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-primary-pink/20">
                  {product.kategori}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2C2527] leading-tight">
                {product.nama_produk}
              </h1>

              {/* Price & rating divider */}
              <div className="flex items-center justify-between border-y border-primary-pink/10 py-3.5">
                <div className="flex items-center text-amber-500 text-sm font-bold">
                  <span className="text-lg">★</span>
                  <span className="ml-1 text-base text-[#2C2527]">{product.rating} / 5.0</span>
                  <span className="ml-2 text-xs text-[#7A6B6E] font-medium">(Pilihan Terfavorit)</span>
                </div>
                <span className="text-xl font-extrabold text-primary-pink">{product.harga}</span>
              </div>

              {/* Suitable Skin Tones */}
              {product.target_skintone && product.target_skintone.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Kategori Warna Kulit Cocok:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.target_skintone.map((tone) => {
                      const details = getSkinToneDetails(tone);
                      return (
                        <div
                          key={tone}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FFD2D7] bg-[#FFF5F6] text-xs font-bold text-[#2C2527]"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: details.color }}
                          ></span>
                          {details.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Deskripsi & Saran Penggunaan:</h4>
                <p className="text-xs sm:text-sm text-[#7A6B6E] leading-relaxed text-justify bg-white/50 p-4 rounded-2xl border border-[#FFD2D7]/50 font-medium">
                  {getSuggestionText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SIMILAR PRODUCTS ==================== */}
        {similarProducts.length > 0 && (
          <section className="space-y-6 pt-6">
            <div className="border-b border-[#FFD2D7]/50 pb-4">
              <h3 className="text-xl font-serif font-bold text-[#2C2527]">Produk Serupa</h3>
              <p className="text-xs text-[#7A6B6E]">Rekomendasi kosmetik {product.kategori} lainnya yang mungkin Anda sukai</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fadeIn">
              {similarProducts.map((simProd) => (
                <ProductCard key={simProd.id} product={simProd} />
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
