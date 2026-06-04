# Dokumentasi Arsitektur AI & Model ML - GlowTone AI

Dokumen ini menjelaskan alur teknis, pra-pemrosesan data (*data preprocessing*), pemilihan arsitektur model (*model architecture selection*), serta integrasi model (*model integration*) pada sistem GlowTone AI.

---

## 1. Pra-Pemrosesan Data (Data Preprocessing)

Proses penyiapan data gambar dari kondisi mentah (input dari peramban/webcam klien) hingga siap diumpankan ke model klasifikasi terbagi menjadi empat tahapan penting baik di sisi klien (*client-side*) maupun di sisi server (*server-side*):

### A. Pra-Pemrosesan Sisi Klien: Kompresi Citra Dinamis (Client-Side)
* **File Path**: [image.ts](file:///c:/Users/Mystic/Desktop/skintone-app/frontend/src/utils/image.ts) (Fungsi `compressBase64Image`)
* **Proses**:
  1. Sebelum file gambar hasil tangkapan kamera dikirim ke API server atau disimpan ke database PostgreSQL, browser menggunakan **HTML5 Canvas API** untuk mereduksi dimensi gambar secara dinamis.
  2. Batas dimensi gambar diatur pada resolusi maksimal **400x400 piksel** dengan tetap menjaga rasio aspek asli gambar.
  3. Matriks piksel pada canvas kemudian dikonversi menjadi string data base64 dengan format **JPEG** berkekuatan kualitas **70%** (`quality = 0.7`).
  4. Kompresi ini berhasil mereduksi ukuran berkas dari **1 - 3 MB** menjadi hanya **20 - 40 KB** saja, menghindari hambatan jaringan (*network latency*) dan menghemat kapasitas database.

### B. Konversi Ruang Warna BGR ke RGB (Server-Side)
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py) (Fungsi `detect_and_crop_face`)
* **Proses**:
  1. Berkas gambar dibaca dari disk server menggunakan pustaka OpenCV (`cv2.imread`) yang menghasilkan format warna bawaan **BGR** (Blue, Green, Red).
  2. Gambar dikonversi dari ruang warna BGR ke **RGB** (Red, Green, Blue) menggunakan fungsi `cv2.cvtColor(image, cv2.COLOR_BGR2RGB)`.
  3. Langkah ini wajib dilakukan karena model YOLOv5 dilatih menggunakan citra dengan standar saluran warna RGB. Jika tidak dikonversi, pemetaan warna akan terbalik (kulit menjadi kebiruan), yang dapat menyebabkan YOLOv5 gagal mendeteksi keberadaan objek manusia.

### C. Segmentasi Wajah & Konversi Grayscale (Server-Side)
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py)
* **Proses**:
  1. YOLOv5s mendeteksi kotak pembatas (*bounding box*) manusia, kemudian area tubuh tersebut dipotong sebagai gambar lokal (`person_crop`).
  2. Gambar potongan tubuh dikonversi ke skala abu-abu (**Grayscale**) menggunakan `cv2.cvtColor(person_crop, cv2.COLOR_BGR2GRAY)`.
  3. Konversi grayscale membuang data warna yang tidak dibutuhkan dan menyisakan kontras gelap-terang piksel saja. Ini diperlukan karena algoritma **Haar Cascade Classifier** (`haarcascade_frontalface_default.xml`) mendeteksi struktur wajah berdasarkan perbedaan bayangan wajah (seperti area mata yang cenderung lebih gelap dibanding dahi).
  4. Setelah wajah terdeteksi, koordinat wajah diberikan **padding tambahan sebesar 15%** ke sekeliling kotak untuk menyertakan garis rahang, telinga, rambut, dan dahi (sebagai referensi warna kulit sekunder).

### D. Normalisasi Skala Tensor untuk Model AI (Server-Side)
* **File Path**: [yolo_classifier.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/services/yolo_classifier.py) (Fungsi `predict_skintone`)
* **Proses**:
  1. Gambar potongan wajah di-load menggunakan modul PIL Image dan dipastikan dalam format warna RGB.
  2. Menggunakan `torchvision.transforms`, gambar melalui pipeline normalisasi matematika:
     - **Resize**: Resolusi gambar diubah secara presisi menjadi **224x224 piksel** (dimensi input yang dibutuhkan model klasifikasi YOLOv5).
     - **ToTensor**: Gambar dikonversi menjadi tipe data tensor PyTorch. Nilai piksel integer (0-255) dinormalisasi ke rentang nilai pecahan float **[0.0, 1.0]**, serta dimensinya diatur ulang dari format *(Height, Width, Channel)* menjadi *(Channel, Height, Width)*.
     - **Normalize**: Tensor distandarisasi menggunakan rata-rata (*mean*) dan standar deviasi (*standard deviation*) dataset **ImageNet**:
       - `mean = [0.485, 0.456, 0.406]`
       - `std = [0.229, 0.224, 0.225]`
  3. Tensor diberikan dimensi batch tambahan menggunakan `.unsqueeze(0)` sehingga berubah bentuk menjadi `[1, 3, 224, 224]`, siap dikirim ke model `best.pt` untuk klasifikasi.

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
