export interface Produk {
  id: number;
  kategori: string;
  brand: string;
  nama_produk: string;
  gambar: string;
  harga: string;
  rating: number;
  target_skintone?: string[]; // Tag untuk mencocokkan rekomendasi hasil scan
}

export const katalogProduk: Produk[] = [
  // ==================== FOUNDATION ====================
  {
    id: 1,
    kategori: "Foundation",
    brand: "Make Over",
    nama_produk: "Make Over Powerstay Matte Foundation (W22 Warm Ivory)",
    gambar: "/assets/images/produk/foundation/foundmake over.jpeg",
    harga: "Rp 185.000",
    rating: 4.8,
    target_skintone: ["light"]
  },
  {
    id: 2,
    kategori: "Foundation",
    brand: "Wardah",
    nama_produk: "Wardah Colorfit Matte Foundation (Light Ivory)",
    gambar: "/assets/images/produk/foundation/foundwardah.jpeg",
    harga: "Rp 86.000",
    rating: 4.6,
    target_skintone: ["light"]
  },
  {
    id: 3,
    kategori: "Foundation",
    brand: "Emina",
    nama_produk: "Emina Bare With Me Mineral Mild Foundation",
    gambar: "/assets/images/produk/foundation/Emina foundation.jpeg",
    harga: "Rp 79.000",
    rating: 4.5,
    target_skintone: ["light"]
  },
  {
    id: 4,
    kategori: "Foundation",
    brand: "Somethinc",
    nama_produk: "Somethinc Copy Paste Breathable Cushion (Shade Charlotte)",
    gambar: "/assets/images/produk/foundation/foundSomethinc.jpeg",
    harga: "Rp 189.000",
    rating: 4.9,
    target_skintone: ["mid-dark"]
  },
  {
    id: 5,
    kategori: "Foundation",
    brand: "BLP Beauty",
    nama_produk: "BLP Beauty Face Base (Warm Beige)",
    gambar: "/assets/images/produk/foundation/foundBLP.webp",
    harga: "Rp 199.000",
    rating: 4.7,
    target_skintone: ["mid-dark"]
  },
  {
    id: 6,
    kategori: "Foundation",
    brand: "Y.O.U",
    nama_produk: "Y.O.U NoutriWear+ Flawless Cushion (Shade Honey)",
    gambar: "/assets/images/produk/foundation/foundYOU.webp",
    harga: "Rp 175.000",
    rating: 4.6,
    target_skintone: ["mid-dark"]
  },
  {
    id: 7,
    kategori: "Foundation",
    brand: "La Tulipe",
    nama_produk: "La Tulipe True Skin Foundation (Shade Dark Ochre)",
    gambar: "/assets/images/produk/foundation/Latulipe TRUE SKIN Foundation.jpeg",
    harga: "Rp 145.000",
    rating: 4.5,
    target_skintone: ["dark"]
  },
  {
    id: 8,
    kategori: "Foundation",
    brand: "Implora",
    nama_produk: "Implora Even Seamless Liquid Foundation (Shade Caramel)",
    gambar: "/assets/images/produk/foundation/foundimplora.jpg",
    harga: "Rp 56.000",
    rating: 4.4,
    target_skintone: ["dark"]
  },
  {
    id: 9,
    kategori: "Foundation",
    brand: "Purbasari",
    nama_produk: "Purbasari Liquid Foundation (Shade Honey Beige)",
    gambar: "/assets/images/produk/foundation/foundpurbasari.jpeg",
    harga: "Rp 15.000",
    rating: 4.1,
    target_skintone: ["dark"]
  },
  {
    id: 10,
    kategori: "Foundation",
    brand: "Viva",
    nama_produk: "Viva Liquid Foundation (Shade Brown)",
    gambar: "/assets/images/produk/foundation/Viva liquid foundation.jpeg",
    harga: "Rp 8.000",
    rating: 4.0,
    target_skintone: ["dark"]
  },
  {
    id: 11,
    kategori: "Foundation",
    brand: "Pixy",
    nama_produk: "Pixy Stay Last Serum Foundation",
    gambar: "/assets/images/produk/foundation/Foundation pixi.jpeg",
    harga: "Rp 65.000",
    rating: 4.4,
    target_skintone: ["light", "mid-dark"]
  },

  // ==================== BLUSH ON ====================
  {
    id: 12,
    kategori: "Blush On",
    brand: "Wardah",
    nama_produk: "Wardah Colorfit Cream Blush (01 Sand Coral)",
    gambar: "/assets/images/produk/blush/VIRALLL - Wardah Colorfit Cream Blush _ Blush On Krim.jpeg",
    harga: "Rp 54.000",
    rating: 4.8,
    target_skintone: ["light"]
  },
  {
    id: 13,
    kategori: "Blush On",
    brand: "Emina",
    nama_produk: "Emina Cheeklit Cream Blush (Pink)",
    gambar: "/assets/images/produk/blush/blushemina.jpeg",
    harga: "Rp 32.500",
    rating: 4.7,
    target_skintone: ["light"]
  },
  {
    id: 14,
    kategori: "Blush On",
    brand: "BLP Beauty",
    nama_produk: "BLP Beauty Cheek Stain (Peach Soda)",
    gambar: "/assets/images/produk/blush/blushBLP.jpg",
    harga: "Rp 139.000",
    rating: 4.7,
    target_skintone: ["light", "mid-dark"]
  },
  {
    id: 15,
    kategori: "Blush On",
    brand: "Somethinc",
    nama_produk: "Somethinc Tamago Airy Blush (Shade Molly)",
    gambar: "/assets/images/produk/blush/blushSomethinc.jpg",
    harga: "Rp 79.000",
    rating: 4.9,
    target_skintone: ["mid-dark"]
  },
  {
    id: 16,
    kategori: "Blush On",
    brand: "Make Over",
    nama_produk: "Make Over Multifix Blush Crayon (Shade Rose Hour)",
    gambar: "/assets/images/produk/blush/blushmakeover.jpeg",
    harga: "Rp 135.000",
    rating: 4.8,
    target_skintone: ["mid-dark"]
  },
  {
    id: 17,
    kategori: "Blush On",
    brand: "La Tulipe",
    nama_produk: "La Tulipe Active Hydrating Blush On",
    gambar: "/assets/images/produk/blush/blushLatulife.webp",
    harga: "Rp 65.000",
    rating: 4.5,
    target_skintone: ["mid-dark", "dark"]
  },
  {
    id: 18,
    kategori: "Blush On",
    brand: "Y.O.U",
    nama_produk: "Y.O.U Simplicity Flush Blush (Deep Amber)",
    gambar: "/assets/images/produk/blush/blushYOU.jpeg",
    harga: "Rp 55.000",
    rating: 4.6,
    target_skintone: ["dark"]
  },
  {
    id: 19,
    kategori: "Blush On",
    brand: "Purbasari",
    nama_produk: "Purbasari Daily Series Blush On (Shade 02)",
    gambar: "/assets/images/produk/blush/bluspurbasari.webp",
    harga: "Rp 29.000",
    rating: 4.3,
    target_skintone: ["dark"]
  },
  {
    id: 20,
    kategori: "Blush On",
    brand: "Viva",
    nama_produk: "Viva Fin Touch Blush On (Shade Red Orange)",
    gambar: "/assets/images/produk/blush/blushviva.jpg",
    harga: "Rp 9.000",
    rating: 4.2,
    target_skintone: ["dark"]
  },
  {
    id: 21,
    kategori: "Blush On",
    brand: "Implora",
    nama_produk: "Implora Cheek & Liptint (Shade Cherry)",
    gambar: "/assets/images/produk/blush/blushimplora.jpeg",
    harga: "Rp 22.000",
    rating: 4.5,
    target_skintone: ["light", "mid-dark", "dark"]
  },

  // ==================== LIPSTICK ====================
  {
    id: 22,
    kategori: "Lipstik",
    brand: "Wardah",
    nama_produk: "Wardah Colorfit Velvet Matte Lip Mousse (01 Brown Creator)",
    gambar: "/assets/images/produk/lipstik/Wardah Colorfit Velvet Matte Lip Mousse _ All Varian Lip Mousse Wardah.jpeg",
    harga: "Rp 73.000",
    rating: 4.7,
    target_skintone: ["light"]
  },
  {
    id: 23,
    kategori: "Lipstik",
    brand: "Emina",
    nama_produk: "Emina Creamatte Lip Cream (Peach Crush)",
    gambar: "/assets/images/produk/lipstik/Emina CREAMATTE LIP CREAM ORIGINAL BPOM.jpeg",
    harga: "Rp 49.000",
    rating: 4.6,
    target_skintone: ["light"]
  },
  {
    id: 24,
    kategori: "Lipstik",
    brand: "BLP Beauty",
    nama_produk: "BLP Beauty Lip Petal Lipstick (Nude Rose)",
    gambar: "/assets/images/produk/lipstik/BLP Beauty Lip Petal Lipstick.jpeg",
    harga: "Rp 149.000",
    rating: 4.8,
    target_skintone: ["light", "mid-dark"]
  },
  {
    id: 25,
    kategori: "Lipstik",
    brand: "Make Over",
    nama_produk: "Make Over Powerstay Transferproof Matte Lip Cream (B01)",
    gambar: "/assets/images/produk/lipstik/Make Over  Powerstay Transferproof Matte Lip cream.jpeg",
    harga: "Rp 135.000",
    rating: 4.9,
    target_skintone: ["mid-dark"]
  },
  {
    id: 26,
    kategori: "Lipstik",
    brand: "Somethinc",
    nama_produk: "Somethinc Checkmatte Transferproof Lipstick (Shade Paladin)",
    gambar: "/assets/images/produk/lipstik/Somethinc Checkmatte Transferproof Lipstick.jpeg",
    harga: "Rp 89.000",
    rating: 4.8,
    target_skintone: ["mid-dark"]
  },
  {
    id: 27,
    kategori: "Lipstik",
    brand: "La Tulipe",
    nama_produk: "La Tulipe True Color Lipstick (Shade Peach)",
    gambar: "/assets/images/produk/lipstik/La Tulipe True Color Lipstick _ Lipstick New.jpeg",
    harga: "Rp 58.000",
    rating: 4.4,
    target_skintone: ["mid-dark", "dark"]
  },
  {
    id: 28,
    kategori: "Lipstik",
    brand: "Y.O.U",
    nama_produk: "Y.O.U Rouge Power Matte Lip Cream (Shade R747 Burgundy)",
    gambar: "/assets/images/produk/lipstik/lipstikYOU.jpg",
    harga: "Rp 99.000",
    rating: 4.7,
    target_skintone: ["dark"]
  },
  {
    id: 29,
    kategori: "Lipstik",
    brand: "Purbasari",
    nama_produk: "Purbasari Serum Infused Lipstick (Shade 05 Bold Red)",
    gambar: "/assets/images/produk/lipstik/Lipstick LEGEND punya hero baru_ 🤩_Setelah jadi produk favorit di kalangan beauty enthusiast sejak dulu, Purbasari akhirnya ngeluarin Serum Infused Lipstick yang smooth dan pigmented_ Sesuai namanya, produk ini ju.jpeg",
    harga: "Rp 45.000",
    rating: 4.6,
    target_skintone: ["dark"]
  },
  {
    id: 30,
    kategori: "Lipstik",
    brand: "Viva",
    nama_produk: "Viva Queen Lipstick (Shade 03 Maroon)",
    gambar: "/assets/images/produk/lipstik/lipstikviva.jpg",
    harga: "Rp 18.000",
    rating: 4.2,
    target_skintone: ["dark"]
  },
  {
    id: 31,
    kategori: "Lipstik",
    brand: "Implora",
    nama_produk: "Implora Jelly Tint (Shade 02 Jelly Cherry)",
    gambar: "/assets/images/produk/lipstik/IMPLORA JELLY TINT.jpeg",
    harga: "Rp 24.000",
    rating: 4.5,
    target_skintone: ["light", "mid-dark"]
  },

  // ==================== POWDER ====================
  {
    id: 32,
    kategori: "Bedak",
    brand: "Wardah",
    nama_produk: "Wardah Everyday Luminous Face Powder",
    gambar: "/assets/images/produk/powder/bedakwardah.jpg",
    harga: "Rp 45.000",
    rating: 4.6
  },
  {
    id: 33,
    kategori: "Bedak",
    brand: "Make Over",
    nama_produk: "Make Over Powerstay Matte Powder Foundation",
    gambar: "/assets/images/produk/powder/bedakMake Over.jpeg",
    harga: "Rp 188.000",
    rating: 4.8
  },
  {
    id: 34,
    kategori: "Bedak",
    brand: "Emina",
    nama_produk: "Emina Daily Matte Loose Powder",
    gambar: "/assets/images/produk/powder/bedakEmina.jpg",
    harga: "Rp 35.000",
    rating: 4.5
  },
  {
    id: 35,
    kategori: "Bedak",
    brand: "Pixy",
    nama_produk: "Pixy Perfect Fit Two Way Cake",
    gambar: "/assets/images/produk/powder/bedakpixy.jpeg",
    harga: "Rp 55.000",
    rating: 4.4
  },
  {
    id: 36,
    kategori: "Bedak",
    brand: "Implora",
    nama_produk: "Implora Supreme Compact Powder",
    gambar: "/assets/images/produk/powder/bedakimplora.webp",
    harga: "Rp 38.000",
    rating: 4.3
  },
  {
    id: 37,
    kategori: "Bedak",
    brand: "Viva",
    nama_produk: "Viva Face Powder",
    gambar: "/assets/images/produk/powder/bedakviva.webp",
    harga: "Rp 12.000",
    rating: 4.1
  },

  // ==================== MASCARA ====================
  {
    id: 38,
    kategori: "Maskara",
    brand: "Somethinc",
    nama_produk: "Somethinc Hangover Volumizing Mascara",
    gambar: "/assets/images/produk/maskara/maskaraSomethinc.jpeg",
    harga: "Rp 79.000",
    rating: 4.9
  },
  {
    id: 39,
    kategori: "Maskara",
    brand: "Make Over",
    nama_produk: "Make Over Ultimate Lash Mascara",
    gambar: "/assets/images/produk/maskara/Make Over - Ultimate Lash Mascara.jpeg",
    harga: "Rp 125.000",
    rating: 4.7
  },
  {
    id: 40,
    kategori: "Maskara",
    brand: "Wardah",
    nama_produk: "Wardah Perfect Curl Mascara",
    gambar: "/assets/images/produk/maskara/Oke Price - Wardah Perfect Curl Mascara _ Maskara Wardah Perfectcurl.jpeg",
    harga: "Rp 85.000",
    rating: 4.6
  },
  {
    id: 41,
    kategori: "Maskara",
    brand: "BLP Beauty",
    nama_produk: "BLP Beauty Lash Bust Mascara",
    gambar: "/assets/images/produk/maskara/maskaraBLP.png",
    harga: "Rp 129.000",
    rating: 4.7
  },
  {
    id: 42,
    kategori: "Maskara",
    brand: "Emina",
    nama_produk: "Emina Star Lash Mascara",
    gambar: "/assets/images/produk/maskara/maskaraEmina.jpg",
    harga: "Rp 55.000",
    rating: 4.4
  },
  {
    id: 43,
    kategori: "Maskara",
    brand: "Implora",
    nama_produk: "Implora Deep Black Mascara",
    gambar: "/assets/images/produk/maskara/makaraimplora.jpg",
    harga: "Rp 26.000",
    rating: 4.3
  },

  // ==================== SETTING SPRAY ====================
  {
    id: 44,
    kategori: "Setting Spray",
    brand: "Make Over",
    nama_produk: "Make Over Powerstay Fix & Matte Setting Spray",
    gambar: "/assets/images/produk/setting spray/setingmakeover.webp",
    harga: "Rp 115.000",
    rating: 4.8
  },
  {
    id: 45,
    kategori: "Setting Spray",
    brand: "Wardah",
    nama_produk: "Wardah Matte Fit Setting Spray",
    gambar: "/assets/images/produk/setting spray/seting wardah.jpeg",
    harga: "Rp 69.000",
    rating: 4.6
  },
  {
    id: 46,
    kategori: "Setting Spray",
    brand: "Pixy",
    nama_produk: "Pixy Aqua Beauty Protecting Mist",
    gambar: "/assets/images/produk/setting spray/setingpixy.jpeg",
    harga: "Rp 32.000",
    rating: 4.5
  },
  {
    id: 47,
    kategori: "Setting Spray",
    brand: "Purbasari",
    nama_produk: "Purbasari Hydra Series Setting Spray",
    gambar: "/assets/images/produk/setting spray/setingpurbasari.jpeg",
    harga: "Rp 38.000",
    rating: 4.4
  },
  {
    id: 48,
    kategori: "Setting Spray",
    brand: "Viva",
    nama_produk: "Viva Queen Setting Spray",
    gambar: "/assets/images/produk/setting spray/setingviva.jpg",
    harga: "Rp 21.000",
    rating: 4.2
  }
];
