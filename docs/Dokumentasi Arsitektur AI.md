# Dokumentasi Arsitektur AI & Model ML - GlowTone AI

Dokumen ini menjelaskan alur teknis, pra-pemrosesan data (*data preprocessing*), pemilihan arsitektur model (*model architecture selection*), serta integrasi model (*model integration*) pada sistem GlowTone AI.

---

## 1. Pra-Pemrosesan Data Sisi Server (Server-Side Data Preprocessing)

Proses penyiapan data gambar dari kondisi mentah (file yang diunggah ke server) hingga siap diumpankan ke model klasifikasi dieksekusi sepenuhnya di sisi server (*server-side*) dengan alur sistematis berikut:

#### Alur Utama Pra-Pemrosesan Gambar (Server-Side):
1. **Membaca Gambar Mentah**: Gambar masukan dibaca oleh pustaka OpenCV ke memori server dalam format warna BGR asli.
2. **Konversi Warna BGR ke RGB**: Mengonversi format warna gambar asli dari BGR ke RGB agar selaras dengan kebutuhan model deteksi YOLOv5s.
3. **Deteksi & Pemotongan Area Tubuh Orang**: Menjalankan model YOLOv5s untuk mengidentifikasi objek manusia terjelas, lalu memotong area tubuh tersebut dari gambar asli (`person_crop`).
4. **Konversi Area Tubuh ke Grayscale**: Mengonversi citra tubuh hasil potong menjadi skala abu-abu (hitam-putih) untuk optimalisasi deteksi Haar Cascade.
5. **Deteksi Wajah Lokal & Padding 15%**: Menjalankan algoritma Haar Cascade di dalam area tubuh orang untuk mendeteksi wajah utama, lalu menambahkan area padding sebesar 15% di sekeliling area wajah.
6. **Pemotongan Wajah Akhir**: Memotong area wajah ber-padding dari gambar asli dan menyimpannya sebagai file citra wajah fisik di disk server.
7. **Penyelarasan & Normalisasi Tensor AI**: Mengubah ukuran gambar wajah terpotong menjadi 224x224 piksel, mengonversinya menjadi PyTorch Tensor, menormalisasi nilainya dengan parameter ImageNet, dan menambahkan dimensi batch untuk siap diumpankan ke model klasifikasi `best.pt`.

---

### A. Konversi Ruang Warna BGR ke RGB
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py) (Fungsi `detect_and_crop_face`)
* **Mengapa ini dilakukan?**
  Berkas gambar dibaca dari disk server menggunakan pustaka OpenCV (`cv2.imread`) yang menghasilkan format warna bawaan **BGR** (Blue, Green, Red). 
  Namun, model YOLOv5 dilatih menggunakan standar warna **RGB** (Red, Green, Blue). Jika tidak dikonversi, pemetaan warna akan terbalik (kulit menjadi kebiruan), yang dapat menyebabkan YOLOv5 gagal mendeteksi keberadaan objek manusia karena kesalahan representasi warna.
* **Kode Implementasi**:
```python
# 1. Membaca gambar menggunakan OpenCV (Default: BGR)
image = cv2.imread(image_path)
if image is None:
    raise ValueError(f"Tidak dapat membaca gambar dari path: {image_path}")

# 2. Konversi ruang warna dari BGR ke RGB agar sesuai dengan standar YOLOv5
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
results = yolo_model(image_rgb)
```

### B. Segmentasi Wajah & Konversi Grayscale
* **File Path**: [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py)
* **Mengapa ini dilakukan?**
  - **Grayscale**: Algoritma Haar Cascade mendeteksi wajah dengan membandingkan pola kontras bayangan gelap-terang piksel secara cepat (seperti area mata yang cenderung lebih gelap dibanding batang hidung atau dahi). Citra hitam-putih (grayscale) membuang informasi warna RGB yang tidak dibutuhkan sehingga menghemat memori dan mempercepat komputasi.
  - **Padding 15%**: Menambahkan 15% ruang kosong di sekeliling deteksi wajah agar dahi, telinga, rambut, dan rahang ikut terpotong. Bagian-bagian ini menyimpan kontribusi besar warna kulit untuk analisis undertone.
* **Kode Implementasi**:
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

### C. Normalisasi Skala Tensor untuk Model AI
* **File Path**: [yolo_classifier.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/services/yolo_classifier.py) (Fungsi `predict_skintone`)
* **Mengapa ini dilakukan?**
  Sebelum gambar wajah yang telah dipotong masuk ke model klasifikasi kustom `best.pt`, gambar tersebut harus diubah menjadi format data PyTorch Tensor, di-resize ke resolusi standar input model (224x224), dan distandarisasi menggunakan matematika statistika ImageNet. Hal ini bertujuan mengurangi ketergantungan model terhadap kontras cahaya ekstrim.
* **Kode Implementasi**:
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
