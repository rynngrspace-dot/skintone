"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { katalogProduk, Produk } from "../data/katalogProduk";
import { fetchProducts } from "./actions/productActions";

export default function Home() {
  const [products, setProducts] = useState<Produk[]>([]);
  // Product Catalog Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const catalogRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts().then((res) => {
      if (res.success && res.products && res.products.length > 0) {
        setProducts(res.products);
      } else {
        setProducts(katalogProduk);
      }
    });
  }, []);

  // Get distinct categories for catalog filter
  const categories = ["Semua", "Foundation", "Blush On", "Lipstik", "Bedak", "Maskara", "Setting Spray"];

  // Filter products based on search and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || prod.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Category change handler — scroll to filter bar top to keep filters in view
  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
  }, []);


  return (
    <div className="flex-1 flex flex-col min-h-screen relative selection:bg-primary-pink selection:text-white">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-pink/5 blur-3xl"></div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

        {/* ==================== HERO SECTION ==================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 animate-slideUp">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-pink/10 text-primary-pink text-[11px] font-bold tracking-wider uppercase border border-primary-pink/15">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-pink animate-pulse"></span>
              <span>Smart Skincare & Cosmetics</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold text-[#2C2527] leading-[1.15] tracking-tight">
              Temukan Makeup yang <br />
              <span className="gradient-text italic">Sempurna</span> untuk Kulit Anda
            </h1>
            <p className="text-[#7A6B6E] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              GlowTone AI menggunakan kecerdasan buatan YOLOv5 untuk memindai wajah Anda, mengekstrak warna kulit alami secara instan, dan mencocokkannya dengan database rekomendasi kosmetik.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                href="/deteksi"
                className="group px-8 py-4 text-sm font-semibold rounded-full bg-primary-pink text-white hover:bg-[#FF6B81] hover:shadow-xl hover:shadow-primary-pink/25 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-primary-pink/15 text-center flex items-center justify-center gap-2"
              >
                <span>Mulai Scan Wajah (AI)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <button
                onClick={scrollToCatalog}
                className="px-8 py-4 text-sm font-semibold rounded-full bg-white text-[#2C2527] border border-[#FFD2D7] hover:bg-primary-pink/5 hover:border-primary-pink hover:shadow-md transition-all shadow-sm cursor-pointer"
              >
                Lihat Katalog Produk
              </button>
            </div>

            {/* Stats row */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-8">
              <div className="text-center lg:text-left">
                <p className="text-xl font-extrabold text-[#2C2527]">{products.length || katalogProduk.length}+</p>
                <p className="text-[10px] text-[#7A6B6E] font-semibold uppercase tracking-wider">Produk Terdaftar</p>
              </div>
              <div className="w-px h-10 bg-[#FFD2D7]"></div>
              <div className="text-center lg:text-left">
                <p className="text-xl font-extrabold text-[#2C2527]">3</p>
                <p className="text-[10px] text-[#7A6B6E] font-semibold uppercase tracking-wider">Kelas Skin Tone</p>
              </div>
              <div className="w-px h-10 bg-[#FFD2D7]"></div>
              <div className="text-center lg:text-left">
                <p className="text-xl font-extrabold text-[#2C2527]">YOLOv5</p>
                <p className="text-[10px] text-[#7A6B6E] font-semibold uppercase tracking-wider">AI Engine</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-[320px] h-[400px] sm:w-[380px] sm:h-[480px] bg-white rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white shadow-primary-pink/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
              {/* Representational model image */}
              <Image
                src="/assets/images/produk/lipstik/BLP Beauty Lip Petal Lipstick.jpeg"
                alt="GlowTone Model representative"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#FFD2D7] z-20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold shadow-sm">✓</div>
                  <div>
                    <p className="text-xs font-bold text-[#2C2527]">Akurasi Presisi Tinggi</p>
                    <p className="text-[10px] text-[#7A6B6E] font-medium">Didukung YOLOv5 Skin Classifier</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating decorative dot */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary-pink/10 blur-md animate-float"></div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-[#FFD2D7]/20 blur-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </section>

        {/* ==================== PRODUCT CATALOG SECTION ==================== */}
        <section ref={catalogRef} id="catalog" className="space-y-6 scroll-mt-24">
          {/* Section Header */}
          <div ref={filterRef} className="scroll-mt-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-pink/10 text-primary-pink text-[11px] font-bold tracking-wider uppercase border border-primary-pink/15">
                  <span>🛍️ Explore Catalog</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#2C2527]">Katalog Kosmetik GlowTone</h2>
                <p className="text-sm text-[#7A6B6E] font-medium">Jelajahi produk kosmetik terbaik untuk dicocokkan dengan warna kulit unik Anda</p>
              </div>

              {/* Search Input */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8989A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Cari brand atau produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-[#FFD2D7] bg-white text-sm focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink/10 text-[#2C2527] placeholder:text-[#A8989A] shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Category Filter Tabs */}
          <div className="catalog-filter-bar">
            <div className="flex overflow-x-auto gap-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-6 py-2.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all border cursor-pointer ${selectedCategory === cat
                      ? "bg-primary-pink border-primary-pink text-white shadow-md shadow-primary-pink/15 scale-[1.02]"
                      : "bg-white border-[#FFD2D7] text-[#7A6B6E] hover:text-[#2C2527] hover:border-primary-pink hover:bg-primary-pink/5"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7A6B6E] font-semibold">
              Menampilkan <span className="text-primary-pink font-bold">{filteredProducts.length}</span> produk
              {selectedCategory !== "Semua" && <span> dalam kategori <span className="text-[#2C2527] font-bold">{selectedCategory}</span></span>}
            </p>
            {selectedCategory !== "Semua" && (
              <button
                onClick={() => handleCategoryChange("Semua")}
                className="text-xs text-primary-pink font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>✕</span> Hapus Filter
              </button>
            )}
          </div>

          {/* Catalog Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#FFD2D7] shadow-sm animate-scaleIn">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[#2C2527] text-sm font-bold mb-1">Tidak Ada Produk Ditemukan</p>
              <p className="text-[#7A6B6E] text-xs font-medium max-w-xs mx-auto">Coba ubah kata kunci pencarian atau pilih kategori berbeda.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
