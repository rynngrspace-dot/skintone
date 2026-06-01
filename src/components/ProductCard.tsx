import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Produk } from "../data/katalogProduk";

interface ProductCardProps {
  product: Produk;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      href={`/produk/${product.id}`}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group cursor-pointer block"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#FFF0F2]">
        <Image
          src={product.gambar}
          alt={product.nama_produk}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary-pink text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-[#FFD2D7]/50 shadow-sm">
          {product.kategori}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold text-primary-pink uppercase tracking-widest">{product.brand}</p>
          <h3 className="text-xs font-bold text-[#2C2527] line-clamp-2 leading-snug mt-1 min-h-[32px]">{product.nama_produk}</h3>
        </div>
        <div className="pt-3 flex justify-between items-center border-t border-primary-pink/8">
          <span className="text-sm font-extrabold text-[#2C2527]">{product.harga}</span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
            <span className="text-amber-500 text-[10px]">★</span>
            <span className="text-xs font-bold text-[#2C2527]">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
