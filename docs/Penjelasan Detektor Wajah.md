# Dokumentasi Alur & Bedah Kode Detektor Wajah (yolo_detector.py)

Dokumen ini berisi bedah kode baris-demi-baris pada modul **yolo_detector.py** yang digunakan untuk mendeteksi dan memotong wajah pengguna. Penjelasan konsep pengolahan gambar (Haar Cascade dan BGR vs RGB) disematkan secara runut sesuai dengan urutan baris kode di mana mereka digunakan.

---

## Alur Bedah Kode Berdasarkan Urutan Eksekusi

Berikut adalah penjelasan logika dari setiap baris kode di dalam berkas [yolo_detector.py](file:///c:/Users/Mystic/Desktop/skintone-app/backend/app/core/yolo_detector.py) dari baris pertama hingga akhir secara urut:

### 1. Pernyataan Import (Baris 1-4)
```python
import os
import cv2
import torch
import numpy as np
```
* **Penjelasan Kode**:
  - `os`: Digunakan untuk berinteraksi dengan sistem operasi, seperti mendapatkan path absolut dari file dan membuat direktori penyimpanan baru.
  - `cv2` (OpenCV): Library utama pengolahan citra komputer yang digunakan untuk membaca gambar, konversi ruang warna, memproses Haar Cascade Classifier, memotong gambar, dan menyimpan hasilnya.
  - `torch` (PyTorch): Digunakan untuk memuat model YOLOv5s dari PyTorch Hub dan menjalankan inference deteksi objek.
  - `numpy`: Library untuk komputasi matriks yang digunakan secara internal oleh OpenCV untuk manipulasi array gambar.

---

### 2. Inisialisasi & Caching Model YOLOv5 (Baris 7-14)
```python
# Cache model agar tidak memuat ulang pada setiap permintaan
model = None

def get_model():
    global model
    if model is None:
        # Memuat model YOLOv5s dari PyTorch Hub
        model = torch.hub.load('ultralytics/yolov5', 'yolov5s', trust_repo=True)
    return model
```
* **Penjelasan Kode**: 
  - Kita mendefinisikan variabel global `model` yang awalnya bernilai kosong (`None`).
  - Saat fungsi `get_model()` dipanggil pertama kali (pada permintaan pertama), sistem akan mengunduh dan memuat bobot model YOLOv5s seberat ~14MB ke memori server.
  - Pada permintaan berikutnya, model yang sudah ada di memori akan langsung digunakan tanpa di-load ulang (menghemat waktu proses ~2 detik per request).

---

### 3. Membaca Gambar dengan OpenCV (Baris 16-30)
```python
def detect_and_crop_face(image_path: str) -> str:
    # Memuat model YOLO
    yolo_model = get_model()

    # Membaca gambar menggunakan OpenCV
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Tidak dapat membaca gambar dari path: {image_path}")

    h, w, _ = image.shape
```
* **Penjelasan Kode**:
  - `detect_and_crop_face(image_path)` menerima path/lokasi file foto yang baru saja diunggah pengguna.
  - Menerima model YOLOv5 hasil cache melalui pemanggilan `get_model()`.
  - Membaca gambar ke dalam matriks piksel lewat `cv2.imread`. Jika gambarnya rusak atau corrupt, sistem mengeluarkan error.
  - Menyimpan ukuran tinggi (`h`) dan lebar (`w`) gambar asli untuk digunakan dalam validasi koordinat pemotongan.

---

### 4. Memuat Haar Cascade (Baris 33-34)
```python
    # Memuat pengklasifikasi wajah Haar Cascade OpenCV
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
```
* **Penjelasan Kode**:
  - Memuat XML pre-trained classifier wajah Haar Cascade bawaan OpenCV (`haarcascade_frontalface_default.xml`).
  
> [!NOTE]
> **Apa itu Haar Cascade?**
> Haar Cascade adalah algoritma pendeteksi objek berbasis pembelajaran mesin klasik (*machine learning*) yang sangat cepat dan legendaris (dibuat oleh Viola & Jones pada tahun 2001).
> Algoritma ini mencari pola perbedaan gelap-terang piksel di area wajah. Sebagai contoh: wilayah mata manusia selalu terlihat lebih gelap daripada area dahi atau pipi di bawahnya, dan batang hidung selalu memantulkan cahaya lebih terang daripada bayangan di sisi hidung.
> Dengan menggeser filter persegi hitam-putih (*Haar-like features*) ke seluruh bagian foto, ia dapat mengenali struktur wajah secara cepat tanpa memerlukan GPU.

---

### 5. Konversi Warna BGR ke RGB & Deteksi Manusia (Baris 37-42)
```python
    # Konversi ruang warna BGR ke RGB untuk YOLOv5
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = yolo_model(image_rgb)
    detections = results.pandas().xyxy[0]

    # Filter hasil deteksi untuk kelas 0 ('person')
    persons = detections[detections['class'] == 0]
```
* **Penjelasan Kode**:
  - Melakukan konversi warna BGR ke RGB menggunakan `cv2.cvtColor`.
  - Mengumpankan gambar RGB ke model `yolo_model` untuk mendapatkan deteksi bounding box.
  - Mengubah output YOLOv5 menjadi objek tabel Pandas DataFrame (`xyxy[0]`) yang berisi kolom koordinat `xmin, ymin, xmax, ymax`, kelas, nama, dan nilai *confidence*.
  - Melakukan filter tabel untuk hanya mengambil objek manusia (ID kelas `0` atau `'person'`).

> [!IMPORTANT]
> **Mengapa Harus Mengonversi BGR ke RGB?**
> **OpenCV (BGR)**: Secara bawaan (*default*), pustaka OpenCV membaca gambar dengan urutan kanal warna **Blue, Green, Red (BGR)**.
> **YOLOv5 (RGB)**: Model deep learning modern seperti YOLOv5 dilatih menggunakan standar warna **Red, Green, Blue (RGB)** yang merupakan standar tampilan digital saat ini.
> **Dampak Tanpa Konversi**: Jika gambar BGR langsung dikirim ke YOLOv5 tanpa dikonversi, saluran merah dan biru akan tertukar. Wajah manusia yang dominan merah akan terlihat biru layaknya karakter fiksi. AI tidak akan mengenali objek tersebut sebagai manusia karena representasi warna yang salah.

---

### 6. Memotong Area Tubuh Orang (Baris 44-56)
```python
    cropped_image = None

    if not persons.empty:
        # Mengambil koordinat deteksi orang dengan skor kepercayaan tertinggi
        best_person = persons.sort_values(by='confidence', ascending=False).iloc[0]
        
        xmin = max(int(best_person['xmin']), 0)
        ymin = max(int(best_person['ymin']), 0)
        xmax = min(int(best_person['xmax']), w)
        ymax = min(int(best_person['ymax']), h)
        
        # Memotong area gambar tubuh orang
        person_crop = image[ymin:ymax, xmin:xmax]
```
* **Penjelasan Kode**:
  - Jika ada orang terdeteksi, kita urutkan berdasarkan *confidence score* tertinggi dan mengambil data orang terbaik di urutan pertama (`iloc[0]`).
  - Mengambil batas piksel koordinat orang tersebut dan melindunginya agar tidak melewati batas pixel gambar asli (menggunakan fungsi `max` dan `min`).
  - Memotong (*cropping*) area tubuh orang tersebut dan menyimpannya di variabel `person_crop`.

---

### 7. Deteksi Wajah Haar Cascade di Dalam Area Orang (Baris 59-63)
```python
        # Mendeteksi wajah di dalam area potongan orang menggunakan Haar Cascade
        if not face_cascade.empty() and person_crop.size > 0:
            gray_person = cv2.cvtColor(person_crop, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray_person, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40)
            )
```
* **Penjelasan Kode**:
  - Jika Haar Cascade berhasil dimuat dan gambar potongan orang tidak kosong, kita konversi gambar `person_crop` ke format abu-abu (*grayscale* / `COLOR_BGR2GRAY`).
  - Memanggil `detectMultiScale` untuk mendeteksi koordinat wajah di dalam area potongan tubuh orang tersebut menggunakan Haar Cascade.

> [!NOTE]
> **Mengapa Menggunakan Grayscale untuk Haar Cascade?**
> Haar Cascade hanya memproses perbedaan intensitas warna hitam-putih (kecerahan piksel) untuk mendeteksi struktur wajah. Konversi ke grayscale membuang data warna yang tidak relevan sehingga menghemat memori dan mempercepat waktu pemrosesan secara drastis.

---

### 8. Memilih Wajah & Menambahkan Padding 15% (Baris 65-79)
```python
            if len(faces) > 0:
                # Memilih area wajah terdeteksi yang paling besar
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                fx, fy, fw, fh = faces[0]
                
                # Menambahkan 15% padding di sekitar wajah (agar rambut, telinga, dan rahang ikut terpotong)
                pad_y = int(fh * 0.15)
                pad_x = int(fw * 0.15)
                
                crop_ymin = max(ymin + fy - pad_y, 0)
                crop_ymax = min(ymin + fy + fh + pad_y, h)
                crop_xmin = max(xmin + fx - pad_x, 0)
                crop_xmax = min(xmin + fx + fw + pad_x, w)
                
                cropped_image = image[crop_ymin:crop_ymax, crop_xmin:crop_xmax]
```
* **Penjelasan Kode**:
  - Jika ditemukan wajah di area potongan orang, kita urutkan berdasarkan luas area (`fw * fh`) dari yang terbesar dan mengambil wajah utama (`faces[0]`).
  - Menyimpan koordinat lokal wajah (`fx, fy`) serta lebar (`fw`) dan tinggi (`fh`) wajah tersebut.
  - Menghitung nilai padding horizontal (`pad_x`) dan vertikal (`pad_y`) sebesar **15%** dari dimensi wajah asli.
  - Menghitung koordinat potong akhir terhadap koordinat gambar asli (`image`) dengan menggabungkan offset deteksi orang (`ymin, xmin`) dan lokal wajah (`fy, fx`), ditambah padding di sekelilingnya. Kita batasi koordinatnya agar tidak di luar ukuran gambar asli menggunakan `max` dan `min`.
  - Melakukan pemotongan akhir wajah secara utuh ke variabel `cropped_image`.

> [!TIP]
> **Mengapa Menambahkan Padding 15%?**
> Pemotongan wajah default biasanya sangat ketat di sekeliling mata, hidung, dan mulut. Padding tambahan sebesar 15% memastikan rambut, telinga, dahi, dan garis rahang ikut terpotong. Bagian-bagian ini memuat informasi warna kulit sekunder yang sangat berharga untuk mendeteksi *undertone* kulit secara presisi.

---

### 9. Alternatif 1: Deteksi Wajah Gagal di Kotak Orang (Baris 82-91)
```python
        # Alternatif 1: Jika deteksi wajah Haar Cascade gagal di dalam kotak orang
        if cropped_image is None:
            box_height = ymax - ymin
            # Jika kotak orang yang terdeteksi memenuhi tinggi gambar (>= 70%),
            # asumsikan foto close-up, gunakan kotak deteksi orang tersebut secara utuh.
            if box_height >= int(h * 0.70):
                cropped_image = image[ymin:ymax, xmin:xmax]
            else:
                # Jika tidak, ambil 45% area tubuh bagian atas (default perkiraan letak wajah)
                crop_ymax = min(ymin + int(box_height * 0.45), h)
                cropped_image = image[ymin:crop_ymax, xmin:xmax]
```
* **Penjelasan Kode**:
  - Jika YOLOv5 mendeteksi orang tetapi Haar Cascade gagal menemukan wajah di dalam area orang tersebut:
    - Kita periksa tinggi kotak orang. Jika sangat tinggi (>=70% dari tinggi gambar asli), diasumsikan pengguna mengambil foto selfie/close-up dekat, sehingga sistem memotong area deteksi orang secara utuh sebagai pengganti wajah.
    - Jika foto bertubuh penuh atau setengah badan jauh, sistem mengambil **45% bagian atas** dari kotak deteksi orang tersebut (sesuai anatomi manusia di mana kepala/wajah berada di bagian paling atas tubuh).

---

### 10. Alternatif 2: YOLOv5 Gagal Mendeteksi Orang (Baris 93-112)
```python
    else:
        # Alternatif 2: Jika tidak ada objek orang terdeteksi, cari wajah di seluruh gambar
        if not face_cascade.empty():
            gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray_img, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40)
            )
            if len(faces) > 0:
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                fx, fy, fw, fh = faces[0]
                
                pad_y = int(fh * 0.15)
                pad_x = int(fw * 0.15)
                
                crop_ymin = max(fy - pad_y, 0)
                crop_ymax = min(fy + fh + pad_y, h)
                crop_xmin = max(fx - pad_x, 0)
                crop_xmax = min(fx + fw + pad_x, w)
                
                cropped_image = image[crop_ymin:crop_ymax, crop_xmin:crop_xmax]
```
* **Penjelasan Kode**:
  - Jika YOLOv5 tidak dapat mendeteksi manusia di dalam gambar, sistem menggunakan Haar Cascade untuk mendeteksi wajah di **seluruh gambar asli**.
  - Mengubah gambar asli ke skala abu-abu dan memanggil `detectMultiScale`.
  - Jika wajah ditemukan, kita pilih wajah terbesar, terapkan padding 15%, dan potong area wajah tersebut relatif terhadap gambar asli.

---

### 11. Alternatif 3: Semua Deteksi Gagal (Baris 115-116)
```python
        # Alternatif 3: Jika semua langkah gagal, gunakan gambar asli
        if cropped_image is None:
            cropped_image = image
```
* **Penjelasan Kode**:
  - Sebagai pertahanan terakhir (*fail-safe*), jika YOLOv5 gagal mendeteksi orang dan Haar Cascade juga gagal mendeteksi wajah di mana pun, sistem akan menggunakan gambar asli secara utuh sebagai `cropped_image` agar aplikasi tidak mengalami *crash* dan tetap memproses klasifikasi warna kulit.

---

### 12. Penyimpanan Gambar Potongan Wajah (Baris 119-133)
```python
    # Memastikan direktori temp_uploads/cropped tersedia
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(os.path.dirname(current_dir))
    cropped_dir = os.path.join(backend_root, "temp_uploads", "cropped")
    os.makedirs(cropped_dir, exist_ok=True)

    # Membuat nama file dan path untuk hasil potongan wajah
    filename = os.path.basename(image_path)
    cropped_filename = f"cropped_{filename}"
    cropped_path = os.path.join(cropped_dir, cropped_filename)

    # Menyimpan gambar wajah hasil pemotongan
    cv2.imwrite(cropped_path, cropped_image)
    
    return cropped_path
```
* **Penjelasan Kode**:
  - Menemukan path absolut direktori root backend (`skintone-app/backend/`).
  - Menentukan path folder penyimpanan sementara di `temp_uploads/cropped`.
  - Menggunakan `os.makedirs` dengan `exist_ok=True` untuk memastikan folder penyimpanan dibuat jika belum ada.
  - Membuat nama file baru dengan awalan `cropped_`.
  - Menyimpan matriks gambar hasil pemotongan (`cropped_image`) kembali ke format file gambar asli menggunakan `cv2.imwrite`.
  - Mengembalikan path absolut file hasil pemotongan tersebut.
