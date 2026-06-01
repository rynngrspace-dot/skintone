# Panduan Pengembangan & Pindah Komputer (GlowTone AI)

Dokumen ini berisi panduan langkah demi langkah tentang cara menyiapkan dan menjalankan proyek **GlowTone AI** saat Anda ingin melanjutkan pengembangan di komputer/laptop lain dari awal (baik menggunakan **Windows** maupun **macOS**).

---

## 🛠️ Prasyarat & Instalasi Alat (Prerequisites)

Pastikan komputer baru Anda sudah terpasang Node.js, Python, Git, dan Git LFS sesuai dengan sistem operasi yang digunakan:

### 💻 Untuk Windows:
1. **Node.js** (Versi 18 atau 20+): Unduh installer `.msi` dari [nodejs.org](https://nodejs.org/) dan jalankan.
2. **Python** (Versi 3.11): Unduh installer `.exe` dari [python.org](https://www.python.org/). **PENTING:** Pastikan centang opsi *"Add Python to PATH"* saat instalasi.
3. **Git & Git LFS**: Unduh installer dari [git-scm.com](https://git-scm.com/). Saat instalasi Git, pastikan fitur Git LFS dicentang agar berkas model besar `.pt` bisa terunduh/terunggah dengan benar.

### 🍎 Untuk macOS:
Cara paling mudah memasang alat-alat di Mac adalah menggunakan **Homebrew** via Terminal:
1. Pasang Homebrew jika belum ada:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Pasang Node.js, Python 3.11, Git, dan Git LFS via Homebrew:
   ```bash
   brew install node python@3.11 git git-lfs
   ```
3. Aktifkan Git LFS setelah terpasang:
   ```bash
   git lfs install
   ```

---

## 📥 Langkah 0: Mengunduh Source Code (Clone)

Saat Anda berpindah ke komputer baru, Anda perlu mengunduh berkas kode sumber untuk **Frontend** dan **Backend** Anda. Ada dua cara untuk melakukan ini:

### Cara A: Clone Masing-Masing Repositori (Rekomendasi Praktis)
Karena Frontend dan Backend Anda saat ini berada di repositori Git terpisah, Anda dapat men-clone keduanya ke satu folder di komputer baru Anda:

1. **Unduh Frontend dari GitHub:**
   ```bash
   git clone https://github.com/rynngrspace-dot/skintone.git
   ```
2. **Unduh Backend dari Hugging Face:**
   *(Ganti `username` dan `space-name` sesuai dengan akun Hugging Face Anda)*
   ```bash
   git clone https://huggingface.co/spaces/ryspcskin/ryspc-glowtone-be
   ```
   > [!IMPORTANT]
   > Pastikan Anda sudah menjalankan `git lfs install` di terminal sebelum menjalankan perintah clone backend, agar berkas model besar `.pt` dapat terunduh dengan lengkap (bukan hanya berupa berkas *pointer* teks).

---

## 💻 Langkah 1: Persiapan Frontend (Next.js) - *Sama untuk Windows & macOS*

Buka terminal (atau VS Code Terminal), masuk ke folder `frontend`, dan ikuti langkah berikut:

### 1. Install Node Modules
Instal semua dependensi Javascript yang diperlukan proyek:
```bash
cd frontend
npm install
```

### 2. Salin dan Siapkan Berkas `.env`
Buat berkas `.env` baru di dalam root folder `frontend/` (Anda bisa menyalin dari `.env.example`). Isi nilai-nilainya seperti di bawah:

```env
# URL Koneksi Database Supabase (Transaction Pooler, port 6543)
DATABASE_URL="postgresql://postgres.exnpeojpmylfxdzadcjr:%40Ryspcskintone321@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL Koneksi Database Langsung (Session Mode, untuk migrasi)
DIRECT_URL="postgresql://postgres.exnpeojpmylfxdzadcjr:%40Ryspcskintone321@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Konfigurasi NextAuth (Autentikasi Akun)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="glowtone_ai_dev_secret_key_99cd7928_806b_4065"

# URL Backend FastAPI (Gunakan localhost untuk lokal, atau Hugging Face untuk online)
# Lokal: http://127.0.0.1:8000
# Online: https://ryspcskin-ryspc-glowtone-be.hf.space
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
```

### 3. Generate Prisma Client (Sangat Penting! ⚠️)
Jalankan perintah ini agar Prisma membuat berkas Client lokal untuk menghubungkan kode Next.js dengan database Supabase:
```bash
npx prisma generate
```

### 4. Jalankan Server Frontend Lokal
```bash
npm run dev
```
Aplikasi frontend Anda sekarang dapat diakses secara lokal di **`http://localhost:3000`**.

---

## 🐍 Langkah 2: Persiapan Backend (FastAPI Python)

Masuk ke folder `backend` di terminal Anda. Langkah pembuatan dan aktivasi virtual environment dibedakan berdasarkan sistem operasi:

### 1. Buat Virtual Environment (venv) Baru
* **Windows (CMD / PowerShell):**
  ```powershell
  cd backend
  python -m venv venv
  ```
* **macOS:**
  ```bash
  cd backend
  python3 -m venv venv
  ```

### 2. Aktifkan Virtual Environment
* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(Jika muncul error script execution, jalankan `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` di PowerShell Anda terlebih dahulu).*
* **Windows (CMD / Command Prompt):**
  ```cmd
  venv\Scripts\activate
  ```
* **macOS:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependensi Python
Instal semua library AI, PyTorch, dan YOLOv5 yang dibutuhkan:
* **Windows:**
  ```bash
  pip install -r requirements.txt
  ```
* **macOS:**
  ```bash
  pip3 install -r requirements.txt
  ```

### 4. Jalankan Server Backend Lokal - *Sama untuk Windows & macOS*
```bash
uvicorn main:app --reload
```
Server API backend AI Anda sekarang berjalan secara lokal di **`http://127.0.0.1:8000`** (dan dokumentasi interaktif tersedia di `http://127.0.0.1:8000/docs`).

---

## 🚀 Alur Kerja Pembaruan ke Production (Hosting Online)

Jika Anda melakukan perubahan kode di komputer baru Anda dan ingin memperbaruinya secara online:

### 1. Memperbarui Frontend (Vercel)
Cukup lakukan push git di folder `frontend`:
```bash
cd frontend
git add .
git commit -m "Deskripsi perubahan Anda"
git push
```
Vercel akan mendeteksi push baru di repositori GitHub Anda dan memperbarui aplikasi secara otomatis.

### 2. Memperbarui Backend AI (Hugging Face)
Lakukan push git di folder `backend`:
```bash
cd backend
git add .
git commit -m "Deskripsi perubahan Anda"
git push hf main
```
Hugging Face akan merestart kontainer Docker mereka secara otomatis untuk menerapkan kode baru Anda.
