# Dokumentasi Arsitektur AI & Model ML - GlowTone AI

Dokumen ini menjelaskan alur teknis, pra-pemrosesan data (*data preprocessing*), pemilihan arsitektur model (*model architecture selection*), serta integrasi model (*model integration*) sistem GlowTone AI.

---

## 1. Pra-Pemrosesan Data Sisi Server (Server-Side Data Preprocessing)

Proses penyiapan data gambar dari kondisi mentah (file yang diunggah ke server) hingga siap diumpankan ke model klasifikasi dieksekusi sepenuhnya di sisi server (*server-side*). Seluruh proses ini dikelompokkan ke dalam **3 Fase Utama (A, B, dan C)** dengan rincian langkah teknis sebagai berikut:

---

### A. Fase A: Penyelarasan Format Warna (BGR ke RGB)

Fase ini memproses pembacaan file gambar mentah dan menyelaraskan saluran warna gambar agar sesuai dengan standar latih model pendeteksi objek YOLOv5s.

#### 1. Membaca Gambar Mentah
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py)
* **Input**: File foto wajah asli yang diunggah oleh pengguna (`.jpg`, `.png`, atau `.webp`).
* **Proses**: Pustaka OpenCV membaca file gambar fisik tersebut dan mengubahnya menjadi matriks angka piksel di dalam memori server. Secara default, OpenCV membaca saluran warna dalam format **BGR** (Blue, Green, Red).
* **Output**: Matriks piksel gambar asli dalam format warna BGR.
* **Mengapa ini penting?**: Komputer tidak bisa membaca file gambar secara langsung; gambar harus dikonversi terlebih dahulu menjadi susunan angka (matriks) agar bisa diproses oleh kode program.

#### 2. Konversi Ruang Warna BGR ke RGB
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py)
* **Input**: Matriks gambar asli dalam format warna BGR.
* **Proses**: Menggunakan fungsi `cv2.cvtColor` untuk menukar posisi saluran warna biru (Blue) dan merah (Red) menjadi RGB.
* **Output**: Matriks gambar asli dalam format warna **RGB** (Red, Green, Blue).
* **Mengapa ini penting?**: Model AI pendeteksi objek YOLOv5 dilatih menggunakan standar warna internet (RGB). Jika kita mengirimkan gambar BGR tanpa konversi, warna kulit manusia akan terlihat kebiruan di mata AI, sehingga AI akan gagal mendeteksi keberadaan objek manusia.

#### Kode Implementasi (Fase A):
```python
# 1. Membaca gambar menggunakan OpenCV (Default: BGR)
image = cv2.imread(image_path)
if image is None:
    raise ValueError(f"Tidak dapat membaca gambar dari path: {image_path}")

# 2. Konversi ruang warna dari BGR ke RGB agar sesuai dengan standar YOLOv5
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
results = yolo_model(image_rgb)
```

---

### B. Fase B: Segmentasi & Pemotongan Wajah (Haar Cascade)

Fase ini bertujuan memisahkan area wajah pengguna dari latar belakang foto dan memotongnya secara presisi menggunakan model deteksi tubuh YOLOv5s dan model deteksi wajah Haar Cascade.

#### 3. Deteksi Objek Orang (YOLOv5s)
* **Input**: Matriks gambar asli dalam format warna RGB.
* **Proses**: Gambar dianalisis secara real-time oleh model detektor **YOLOv5s (small)** untuk melacak objek berlabel manusia (Kelas `person`).
* **Output**: Koordinat batas kotak (*bounding box*) manusia (`xmin, ymin, xmax, ymax`).
* **Mengapa ini penting?**: Untuk melacak letak tubuh manusia di dalam foto dan mengabaikan objek latar belakang yang mengganggu (setiap dinding, tanaman, dll.).

#### 4. Pemotongan Area Tubuh Orang
* **Input**: Gambar asli BGR dan koordinat batas kotak manusia dari langkah sebelumnya.
* **Proses**: Sistem memotong (*crop*) bagian gambar yang hanya berisi tubuh manusia tersebut.
* **Output**: Potongan gambar tubuh manusia terisolasi (`person_crop`).
* **Mengapa ini penting?**: Mempersempit area pencarian wajah agar detektor wajah bekerja lebih akurat dan terhindar dari deteksi wajah palsu pada latar belakang foto.

#### 5. Konversi Potongan Tubuh ke Skala Abu-Abu (Grayscale)
* **Input**: Gambar potongan tubuh manusia berwarna (`person_crop`).
* **Proses**: Menggunakan fungsi OpenCV untuk membuang seluruh informasi warna dan menyisakan intensitas kecerahan warna hitam-putih saja.
* **Output**: Gambar potongan tubuh hitam-putih (`gray_person`).
* **Mengapa ini penting?**: Algoritma Haar Cascade mendeteksi wajah berdasarkan pola kontras bayangan gelap-terang (seperti area mata yang selalu lebih gelap daripada area dahi). Mengubah gambar menjadi grayscale membuang data warna yang tidak penting dan mempercepat proses deteksi hingga 3x lipat.

#### 6. Deteksi Wajah Lokal & Padding 15%
* **Input**: Gambar potongan tubuh hitam-putih (`gray_person`).
* **Proses**: Algoritma Haar Cascade mencari pola wajah di area potongan tubuh tersebut. Batas lebar dan tinggi wajah ditambahkan margin kosong (**padding**) sebesar **15%** di sekelilingnya.
* **Output**: Koordinat wajah akhir ber-padding.
* **Mengapa ini penting?**: Deteksi wajah bawaan biasanya memotong area wajah terlalu ketat. Penambahan padding 15% memastikan area dahi, telinga, rambut, dan garis rahang ikut terpotong, karena area ini menyimpan karakteristik tingkat kehangatan kulit (*undertone*).

#### 7. Pemotongan Wajah Akhir
* **Input**: Gambar asli BGR dan koordinat wajah ber-padding.
* **Proses**: Sistem memotong area wajah bersih langsung dari gambar asli berkualitas tinggi.
* **Output**: Gambar potongan wajah ber-padding terisolasi (`cropped_image`).
* **Mengapa ini penting?**: Mendapatkan gambar wajah steril tanpa kontaminasi warna pakaian atau latar belakang, siap untuk diklasifikasikan warna kulitnya.

#### Kode Implementasi (Fase B):
```python
# 1. Konversi area potongan tubuh manusia ke skala abu-abu (Grayscale)
gray_person = cv2.cvtColor(person_crop, cv2.COLOR_BGR2GRAY)

# 2. Deteksi area wajah lokal menggunakan Haar Cascade Classifier
faces = face_cascade.detectMultiScale(
    gray_person, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40)
)

if len(faces) > 0:
    # 3. Urutkan dari wajah dengan area terbesar
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    fx, fy, fw, fh = faces[0]
    
    # 4. Berikan padding 15% untuk menangkap dahi, garis rahang, rambut, dan telinga
    pad_y = int(fh * 0.15)
    pad_x = int(fw * 0.15)
    
    crop_ymin = max(ymin + fy - pad_y, 0)
    crop_ymax = min(ymin + fy + fh + pad_y, h)
    crop_xmin = max(xmin + fx - pad_x, 0)
    crop_xmax = min(xmin + fx + fw + pad_x, w)
    
    cropped_image = image[crop_ymin:crop_ymax, crop_xmin:crop_xmax]
```

---

### C. Fase C: Normalisasi Skala Tensor untuk Model AI

Fase ini mengubah matriks gambar wajah fisik menjadi objek matematika PyTorch Tensor yang terstandarisasi sebelum dikirim ke model klasifikasi kustom `best.pt`.

#### 8. Penyelarasan & Normalisasi Tensor AI
* **File Path**: [yolo_classifier.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/services/yolo_classifier.py)
* **Input**: Gambar potongan wajah akhir (`cropped_image`).
* **Proses**:
  - **Resize**: Resolusi gambar diubah secara presisi menjadi **224x224 piksel** (input wajib model klasifikasi).
  - **ToTensor**: Mengonversi matriks piksel integer (0-255) menjadi array float **PyTorch Tensor** bernilai `[0.0, 1.0]` dan membalik susunan dimensi menjadi *(Channel, Height, Width)*.
  - **Normalize**: Melakukan standarisasi menggunakan rata-rata (`mean = [0.485, 0.456, 0.406]`) dan standar deviasi (`std = [0.229, 0.224, 0.225]`) ImageNet.
  - **Unsqueeze**: Menambahkan dimensi batch tambahan di depan tensor sehingga bentuknya menjadi `[1, 3, 224, 224]`.
* **Output**: Tensor siap analisis berdimensi `[1, 3, 224, 224]`.
* **Mengapa ini penting?**: Model neural network hanya menerima matriks dengan sebaran nilai yang seragam. Langkah ini menstabilkan kontras cahaya agar prediksi warna kulit berjalan konsisten pada kondisi cahaya lampu/matahari yang berbeda.

#### Kode Implementasi (Fase C):
```python
# 1. Membaca gambar wajah hasil pemotongan dan konversi ke RGB
img = Image.open(cropped_image_path).convert('RGB')

# 2. Setup pipeline transformasi matematika data gambar
preprocess = transforms.Compose([
    # Ubah resolusi gambar secara presisi ke standar 224x224 piksel
    transforms.Resize((224, 224)),
    
    # Konversi data gambar menjadi PyTorch Tensor [0.0, 1.0] dan ubah format ke (C, H, W)
    transforms.ToTensor(),
    
    # Normalisasi menggunakan mean & std deviasi standar dataset ImageNet
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

# 3. Tambahkan dimensi batch di depan sehingga bentuknya [1, 3, 224, 224]
input_tensor = preprocess(img).unsqueeze(0)
```

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
