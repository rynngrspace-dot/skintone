"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Webcam from "react-webcam";
import ProductCard from "../../components/ProductCard";
import { katalogProduk } from "../../data/katalogProduk";
import { predictSkinTone } from "../../services/api";
import { saveScanToDatabase } from "../actions/scanActions";
import { compressBase64Image } from "../../utils/image";
import { getShadeColors } from "../../utils/shades";

// Utility to convert base64 image data URL to a File object
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function DeteksiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Input states
  const [useCamera, setUseCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Results states
  const [detectedSkinClass, setDetectedSkinClass] = useState<"light" | "mid-dark" | "dark" | null>(null);
  const [resultsData, setResultsData] = useState<{
    skin_tone: string;
    rekomendasi: { foundation: string; blush: string; lipstik: string };
    penjelasan: string;
  } | null>(null);

  const webcamRef = useRef<Webcam>(null);

  // Auth Redirect Guard using NextAuth Session
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login?redirect=/deteksi");
    } else if (status === "authenticated") {
      setUserEmail(session?.user?.email || "");
      setIsCheckingAuth(false);
    }
  }, [status, session]);

  // Capture from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        try {
          const file = dataURLtoFile(imageSrc, "webcam_capture.jpg");
          setImageFile(file);
          setErrorMessage("");
        } catch (e) {
          console.error("Error converting webcam image to file:", e);
        }
      }
    }
  }, [webcamRef]);

  // Handle uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setErrorMessage("");

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform the skin tone detection pipeline
  const runAnalysis = async (mockClassOverride?: "light" | "mid-dark" | "dark") => {
    if (!capturedImage || (!imageFile && !mockClassOverride)) {
      setErrorMessage("Silakan ambil foto atau unggah gambar terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(0);
    setErrorMessage("");

    try {
      const fileToUpload = imageFile || (capturedImage ? dataURLtoFile(capturedImage, "uploaded_image.jpg") : null);
      if (!fileToUpload && !mockClassOverride) {
        throw new Error("Berkas gambar tidak ditemukan.");
      }

      // Start the API call in parallel
      let apiError: any = null;
      let apiResult: any = null;
      let apiDone = false;

      const apiPromise = predictSkinTone(fileToUpload!, mockClassOverride)
        .then((res) => {
          apiResult = res;
          apiDone = true;
        })
        .catch((err) => {
          apiError = err;
          apiDone = true;
        });

      // Sequentially animate the steps (0 to 3)
      for (let step = 0; step < 4; step++) {
        setCurrentStep(step);
        // Wait 1.2 seconds, checking if the API has failed early
        for (let t = 0; t < 12; t++) {
          if (apiError) throw apiError;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Wait for the API to complete if it is still running
      while (!apiDone) {
        if (apiError) throw apiError;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (apiError) throw apiError;
      const result = apiResult;

      setCurrentStep(4); // All steps completed

      setDetectedSkinClass(result.skin_tone_class);
      setResultsData({
        skin_tone: result.skin_tone,
        rekomendasi: result.rekomendasi,
        penjelasan: result.penjelasan,
      });

      // Save to database via Server Action
      if (session?.user) {
        const userId = (session.user as any).id;

        // Compress captured image base64 client-side before database save
        let dbImage = capturedImage;
        try {
          dbImage = await compressBase64Image(capturedImage, 400, 400, 0.7);
        } catch (e) {
          console.error("Failed to compress image for database:", e);
        }

        const saveRes = await saveScanToDatabase(userId, {
          image: dbImage,
          skinToneClass: result.skin_tone_class,
          skinToneLabel: result.skin_tone,
          foundationRec: result.rekomendasi.foundation,
          blushRec: result.rekomendasi.blush,
          lipstikRec: result.rekomendasi.lipstik
        });

        if (!saveRes.success) {
          console.error("Failed to save scan to database:", saveRes.error);
        }
      }

      // Brief pause to show completion checkmarks before showing results
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsAnalyzing(false);
      setShowResults(true);

    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err?.message || "Terjadi kesalahan saat memproses gambar. Coba lagi.");
    }
  };

  const resetDetection = () => {
    setCapturedImage(null);
    setImageFile(null);
    setShowResults(false);
    setDetectedSkinClass(null);
    setResultsData(null);
    setCurrentStep(0);
    setErrorMessage("");
  };

  // Get distinct products matching the detected skin tone class
  const matchingProducts = detectedSkinClass
    ? katalogProduk.filter((prod) => prod.target_skintone?.includes(detectedSkinClass))
    : [];

  const getSkinToneColor = (cls: string) => {
    if (cls === "light") return "#F5D6C6";
    if (cls === "mid-dark") return "#D2A27E";
    return "#8D5B4C";
  };

  if (isCheckingAuth || status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#2C2527] font-sans antialiased relative">
      {/* Decorative Blur Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-32 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary-pink/12 to-[#FFD2D7]/20 blur-3xl"></div>
        <div className="absolute bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FFD2D7]/25 to-primary-pink/8 blur-3xl"></div>
      </div>

      <main className="flex-1 min-h-[calc(100vh-72px)] max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3 animate-slideUp">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-pink/10 text-primary-pink text-[11px] font-bold tracking-wider uppercase border border-primary-pink/15">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-pink animate-pulse"></span>
            <span>AI Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2527] tracking-tight">Analisis AI Skin Tone</h1>
          <p className="text-sm text-[#7A6B6E] font-medium">Unggah foto wajah atau gunakan kamera langsung untuk menganalisis kecocokan kosmetik</p>
        </div>

        {errorMessage && (
          <div className="max-w-xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-6 rounded-xl text-center font-medium animate-slideDown flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {errorMessage}
          </div>
        )}

        {/* INPUT STATE */}
        {!showResults && !isAnalyzing && (
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-[#FFD2D7]/60 animate-scaleIn">

            {/* Input Selection Tabs */}
            <div className="flex border border-[#FFD2D7]/60 rounded-2xl overflow-hidden p-1 bg-white/50">
              <button
                onClick={() => {
                  setUseCamera(true);
                  setCapturedImage(null);
                  setImageFile(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${useCamera ? "bg-primary-pink text-white shadow-sm" : "text-[#7A6B6E] hover:text-primary-pink"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Buka Kamera
              </button>
              <button
                onClick={() => {
                  setUseCamera(false);
                  setCapturedImage(null);
                  setImageFile(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${!useCamera ? "bg-primary-pink text-white shadow-sm" : "text-[#7A6B6E] hover:text-primary-pink"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Unggah Berkas
              </button>
            </div>

            {/* Webcam / Capture Preview */}
            {useCamera ? (
              <div className="space-y-4">
                {capturedImage ? (
                  <div className="relative w-full aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-black border-2 border-white shadow-lg">
                    <Image src={capturedImage} alt="Captured Face" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-black border-2 border-white shadow-inner flex items-center justify-center">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      mirrored={true}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Circle Face Guide Overlay */}
                    <div className="absolute inset-0 border-[24px] border-black/30 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-56 border-2 border-dashed border-primary-pink/80 rounded-full bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]"></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {capturedImage ? (
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setImageFile(null);
                      }}
                      className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-white text-[#7A6B6E] border border-[#FFD2D7] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                    >
                      Ulangi Ambil Foto
                    </button>
                  ) : (
                    <button
                      onClick={capturePhoto}
                      className="px-8 py-3 text-xs font-bold rounded-xl bg-primary-pink text-white hover:bg-[#FF6B81] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary-pink/20 cursor-pointer flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Tangkap Foto Wajah
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // File Input
              <div className="space-y-4">
                {capturedImage ? (
                  <div className="relative w-full aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-black border-2 border-white shadow-lg">
                    <Image src={capturedImage} alt="Uploaded Face" fill className="object-cover" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-[#FFD2D7] border-dashed rounded-2xl cursor-pointer bg-white/50 hover:bg-primary-pink/5 hover:border-primary-pink transition-all p-6 text-center group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary-pink/10 flex items-center justify-center mb-3 group-hover:bg-primary-pink/15 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-xs font-bold text-[#2C2527] mb-1">Klik untuk pilih gambar</p>
                      <p className="text-[10px] text-[#7A6B6E]">Mendukung format PNG, JPG, atau JPEG</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                )}

                {capturedImage && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setImageFile(null);
                      }}
                      className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-white text-[#7A6B6E] border border-[#FFD2D7] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                    >
                      Ganti Gambar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Run Analysis Action Button */}
            {capturedImage && (
              <div className="pt-4 border-t border-[#FFD2D7]/30 space-y-4">
                <button
                  onClick={() => runAnalysis()}
                  className="w-full py-4 text-sm font-bold rounded-2xl bg-gradient-to-r from-primary-pink to-[#FF6B81] text-white hover:shadow-xl hover:shadow-primary-pink/25 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-pink/15 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Mulai Analisis Warna Kulit (AI)
                </button>

                <div className="space-y-2 pt-2">
                  <p className="text-[9px] font-bold text-[#7A6B6E] text-center uppercase tracking-wider">
                    🛠️ Mode Pengujian Manual (Gunakan jika Backend Offline):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => runAnalysis("light")}
                      className="py-2.5 text-[10px] font-bold rounded-xl bg-[#FFF8F9] text-[#FF6B81] hover:bg-primary-pink hover:text-white border border-[#FFD2D7]/60 transition-all cursor-pointer"
                    >
                      Light (Terang)
                    </button>
                    <button
                      onClick={() => runAnalysis("mid-dark")}
                      className="py-2.5 text-[10px] font-bold rounded-xl bg-[#FFF8F9] text-[#FF6B81] hover:bg-primary-pink hover:text-white border border-[#FFD2D7]/60 transition-all cursor-pointer"
                    >
                      Medium (Sawo Matang)
                    </button>
                    <button
                      onClick={() => runAnalysis("dark")}
                      className="py-2.5 text-[10px] font-bold rounded-xl bg-[#FFF8F9] text-[#FF6B81] hover:bg-primary-pink hover:text-white border border-[#FFD2D7]/60 transition-all cursor-pointer"
                    >
                      Dark (Gelap)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING ANIMATION */}
        {isAnalyzing && (
          <div className="max-w-md mx-auto glass-card rounded-3xl p-8 text-center space-y-6 shadow-xl border border-[#FFD2D7]/60 animate-scaleIn">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary-pink/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary-pink border-r-primary-pink animate-spin"></div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#2C2527]">AI sedang memproses gambar...</h3>
              <p className="text-xs text-[#7A6B6E]">Proses deteksi YOLOv5 & Klasifikasi Warna Kulit</p>
            </div>

            {/* Sequence indicators */}
            <div className="text-left space-y-3 pt-4 border-t border-[#FFD2D7]/30 max-w-[280px] mx-auto font-sans">
              {[
                "Mendeteksi wajah (YOLOv5)...",
                "Memotong area wajah presisi...",
                "Mengklasifikasi kecerahan kulit...",
                "Menyusun rekomendasi kosmetik..."
              ].map((label, i) => (
                <div key={i} className="flex items-center text-xs font-semibold space-x-3">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${currentStep >= i + 1 ? "bg-green-100 text-green-600" : currentStep === i ? "bg-primary-pink/10 text-primary-pink animate-pulse" : "bg-gray-100 text-[#A8989A]"
                    }`}>
                    {currentStep >= i + 1 ? "✓" : (i + 1)}
                  </span>
                  <span className={
                    currentStep === i ? "text-primary-pink font-bold" : currentStep > i ? "text-[#2C2527]" : "text-[#A8989A]"
                  }>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {showResults && detectedSkinClass && resultsData && (
          <div className="space-y-8 animate-slideUp">

            {/* Top Back Alert */}
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs py-3 px-6 rounded-xl text-center font-bold max-w-4xl mx-auto flex items-center justify-center gap-2 animate-slideDown">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Berhasil dianalisis dan disimpan secara otomatis ke riwayat akun Anda!
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">

              {/* Left Column: Image Card & Classification Tag */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-card rounded-3xl overflow-hidden p-4 border border-[#FFD2D7]/60 shadow-lg">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black mb-4">
                    {capturedImage && (
                      <Image src={capturedImage} alt="Scanned Face" fill className="object-cover" />
                    )}
                  </div>

                  <div className="text-center space-y-2 pb-2">
                    <p className="text-[10px] font-bold text-[#7A6B6E] uppercase tracking-wider">Hasil Klasifikasi AI</p>
                    <h3 className="text-lg font-bold text-[#2C2527]">
                      {resultsData.skin_tone}
                    </h3>

                    <div className="flex flex-col items-center gap-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-sm animate-pulse"
                          style={{ backgroundColor: getSkinToneColor(detectedSkinClass) }}
                        ></span>
                        <span className="text-[10px] font-extrabold text-[#2C2527] uppercase tracking-wider">{detectedSkinClass}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-pink/10 text-primary-pink border border-primary-pink/15">
                        Kode Warna: {getSkinToneColor(detectedSkinClass)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetDetection}
                  className="w-full py-3.5 text-xs font-bold rounded-xl bg-white text-[#2C2527] border border-[#FFD2D7] hover:bg-primary-pink/5 hover:border-primary-pink transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Uji Coba Foto Lain
                </button>
              </div>

              {/* Right Column: Descriptions & Makeup Recommendations */}
              <div className="lg:col-span-8 space-y-6">
                {/* Description Card */}
                <div className="glass-card rounded-2xl p-6 border border-[#FFD2D7]/60 shadow-sm space-y-3 bg-white/70">
                  <h3 className="text-xs font-bold text-[#2C2527] flex items-center gap-2 uppercase tracking-wide">
                    <span>📝</span> Penjelasan Warna Kulit
                  </h3>
                  <p className="text-[#7A6B6E] text-xs sm:text-sm leading-relaxed font-medium">
                    {resultsData.penjelasan}
                  </p>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "🧴", label: "Alas Bedak (Foundation)", value: resultsData.rekomendasi.foundation },
                    { icon: "🍑", label: "Perona Pipi (Blush On)", value: resultsData.rekomendasi.blush },
                    { icon: "💄", label: "Pewarna Bibir (Lipstik)", value: resultsData.rekomendasi.lipstik },
                  ].map((rec, i) => {
                    const shades = getShadeColors(rec.value);
                    return (
                      <div key={i} className="bg-[#FFF8F9] rounded-2xl p-5 border border-[#FFD2D7]/40 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary-pink/30 transition-all min-h-[140px]">
                        <div className="space-y-2">
                          <div className="text-2xl">{rec.icon}</div>
                          <h4 className="text-xs font-extrabold text-[#2C2527] uppercase tracking-wider">{rec.label}</h4>
                          <p className="text-xs text-[#7A6B6E] leading-relaxed font-medium">
                            {rec.value}
                          </p>
                        </div>
                        {/* Visual Swatches */}
                        {shades.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2 border-t border-[#FFD2D7]/15">
                            {shades.map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white border border-[#FFD2D7]/30 text-[#7A6B6E] shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm flex-shrink-0" style={{ backgroundColor: s.hex }}></span>
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Recommended Products Grid */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-[#2C2527] flex items-center gap-2">
                      <span>🛍️</span> Rekomendasi Produk yang Cocok
                    </h3>
                    <span className="text-[10px] text-primary-pink font-bold bg-primary-pink/10 px-3 py-1 rounded-lg border border-primary-pink/20">
                      {matchingProducts.length} Produk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {matchingProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
