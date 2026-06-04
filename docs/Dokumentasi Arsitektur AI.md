# Dokumentasi Arsitektur AI & Model ML - GlowTone AI

Dokumen ini menjelaskan alur teknis, pra-pemrosesan data (*data preprocessing*), pemilihan arsitektur model (*model architecture selection*), serta integrasi model (*model integration*) pada sistem GlowTone AI.

---

## 1. Pra-Pemrosesan Data (Data Preprocessing)

Proses penyiapan data gambar dari kondisi mentah (input dari peramban/webcam klien) hingga siap diumpankan ke model klasifikasi terbagi menjadi beberapa tahapan penting:

### A. Konversi Warna & Deteksi Orang (YOLOv5s)
* **File Paths**: [yolo_detector.py](skintone-app/backend/app/core/yolo_detector.py) (Fungsi `detect_and_crop_face`)
* **Proses**:
  1. Gambar mentah dari klien dibaca menggunakan modul OpenCV (`cv2.imread`).
  2. Gambar dikonversi dari ruang warna BGR (standar OpenCV) ke RGB (`cv2.cvtColor`) agar sesuai dengan standar deteksi arsitektur YOLOv5.
  3. Gambar diproses oleh model dasar **YOLOv5s (small)** untuk melacak objek berlabel `person` (ID Kelas `0`). Jika terdeteksi beberapa orang, sistem akan memilih objek dengan tingkat kepercayaan (*confidence rate*) tertinggi.

### B. Segmentasi & Pemotongan Wajah (Haar Cascade)
* **File Paths**: [yolo_detector.py](skintone-app/backend/app/core/yolo_detector.py)
* **Proses**:
  1. Setelah koordinat orang terdeteksi, area tersebut di-crop.
  2. Di dalam area orang tersebut, algoritma **Haar Cascade** OpenCV (`haarcascade_frontalface_default.xml`) mendeteksi koordinat persegi wajah secara spesifik.
  3. Sistem menambahkan **padding sebesar 15%** secara dinamis ke sekeliling koordinat wajah (atas, bawah, kiri, kanan). Padding ini krusial untuk menangkap informasi tambahan seperti garis rahang, telinga, dahi, dan rambut yang membawa karakteristik undertone kulit.
  4. Jika Haar Cascade gagal mendeteksi wajah di dalam area orang, sistem menerapkan *fallback* berupa pemotongan 45% bagian atas tubuh orang tersebut (area wajah/leher default).

### C. Normalisasi Gambar & Skala Tensor
* **File Paths**: [yolo_classifier.py](skintone-app/backend/app/services/yolo_classifier.py) (Fungsi `predict_skintone`)
* **Proses**:
  1. File potongan wajah dibaca oleh PIL (Python Imaging Library) dan dikonversi ke format RGB penuh.
  2. Menggunakan modul `torchvision.transforms`, gambar diubah ukurannya secara presisi menjadi **224x224 piksel** (dimensi input default YOLOv5 Classifier).
  3. Gambar dikonversi menjadi PyTorch Tensor.
  4. Tensor dinormalisasi dengan nilai rata-rata (*mean*) dan standar deviasi (*std*) standar dataset **ImageNet**:
     * `mean = [0.485, 0.456, 0.406]`
     * `std = [0.229, 0.224, 0.225]`
     Hal ini bertujuan agar data input memiliki distribusi warna yang sama dengan dataset yang digunakan saat melatih model klasifikasi.

---

## 2. Pemilihan Arsitektur Model (Model Architecture Selection)

GlowTone AI menggunakan dua lapis arsitektur model pembelajaran mesin:

### A. YOLOv5s Object Detector (Deteksi Orang)
* **Arsitektur**: YOLOv5s (Small)
* **Alasan Pemilihan**: Model ini sangat cepat dan ringan (ukuran file ~14MB) dengan performa deteksi real-time yang optimal. Model ini digunakan hanya untuk mendeteksi koordinat pembatas manusia (*bounding box*) di server backend sebelum proses *face cropping*.

### B. Custom YOLOv5 Classifier (Klasifikasi Skin Tone)
* **Arsitektur**: YOLOv5 Classifier (CSPNet backbone dengan klasifikasi *softmax* di layer output).
* **Bobot Model**: **[best.pt](skintone-app/backend/app/models/best.pt)**
* **Alasan Pemilihan**: 
  - Arsitektur YOLOv5 Classifier memiliki keunggulan transfer learning yang sangat baik untuk mendeteksi fitur-fitur tekstur permukaan seperti kulit manusia.
  - Model custom `best.pt` telah dilatih secara khusus (*fine-tuned*) untuk mengklasifikasikan tekstur wajah ke dalam 3 kelas warna kulit secara akurat:
    1. **`light`** (Kuning Langsat / Terang)
    2. **`mid-dark`** (Sawo Matang)
    3. **`dark`** (Cokelat Tua / Gelap)

---

## 3. Integrasi Model & Pipeline API (Model Integration)

Backend dibangun menggunakan framework **FastAPI** (Python) untuk menyatukan seluruh pipeline machine learning dan menyediakannya sebagai layanan web terintegrasi.

* **File Paths**: [main.py](skintone-app/backend/main.py) (Endpoint `POST /api/predict`)

### Diagram Alur Integrasi Sistem:

```
[Klien Frontend] (Base64/File)
      │
      ▼ (POST /api/predict)
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                    │
│                                                         │
│  1. Simpan Gambar Asli ke temp_uploads/original/        │
│  2. Jalankan Preprocessing & Crop Wajah                 │
│     (yolo_detector.py -> Haar Cascade)                  │
│  3. Simpan Hasil Crop ke temp_uploads/cropped/          │
│  4. Muat Model best.pt & Prediksi                       │
│     (yolo_classifier.py -> PyTorch Tensor)              │
│  5. Pemetaan Rekomendasi Kosmetik                       │
│     (recommendation.py -> Kamus Warna)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
      │
      ▼ (Respons JSON)
[Klien Frontend] (Hasil & Rekomendasi Shade Terkompresi)
```

### Penjelasan Langkah Integrasi API:
1. **Penerimaan Gambar**: FastAPI menerima file gambar mentah melalui endpoint `POST /api/predict`. Berkas gambar divalidasi tipenya dan disimpan secara sementara di folder `temp_uploads/original/` dengan nama unik berupa UUID.
2. **Eksekusi Deteksi**: Endpoint memanggil fungsi `detect_and_crop_face()` untuk menjalankan alur pra-pemrosesan Haar Cascade dan menyimpan output wajah ke `temp_uploads/cropped/`.
3. **Eksekusi Klasifikasi**: Model `best.pt` dimuat ke dalam memori secara efisien (*cached*) melalui fungsi `get_classifier_model()`. Citra wajah hasil crop diprediksi kelasnya lewat fungsi `predict_skintone()`.
4. **Pemetaan Kosmetik**: Output string kelas warna kulit (`light`, `mid-dark`, atau `dark`) digunakan untuk mengambil data kosmetik yang sesuai dari kamus pencocokan di [recommendation.py](skintone-app/backend/app/services/recommendation.py).
5. **Respons Akhir**: API mengirimkan data JSON berikut kembali ke klien:
   ```json
   {
     "skin_tone": "Light (Kuning Langsat / Terang)",
     "skin_tone_class": "light",
     "rekomendasi": {
       "foundation": "Warna Ivory, Fair, atau Beige terang.",
       "blush": "Warna Soft Pink, Peach, atau Coral muda.",
       "lipstik": "Warna Nude Pink, Soft Peach, atau warna berry terang."
     },
     "penjelasan": "..."
   }
   ```
6. **Pembersihan Otomatis**: Backend secara berkala menghapus berkas sementara di dalam folder `temp_uploads/` yang usianya sudah melebihi 2 jam untuk mencegah kepenuhan memori pada server hosting.
