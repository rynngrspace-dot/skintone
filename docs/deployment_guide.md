# Panduan Deployment GlowTone AI

Dokumen ini berisi panduan langkah demi langkah (*step-by-step*) untuk mendeploy aplikasi GlowTone AI ke internet secara gratis menggunakan kombinasi layanan berikut:
1. **Database:** Supabase (PostgreSQL) - *Sudah dikonfigurasi*
2. **Backend AI:** Hugging Face Spaces (Docker Space)
3. **Frontend:** Vercel (Next.js)

---

## Bagian 1: Persiapan Database (Supabase)
Karena database Anda sudah menggunakan Supabase dan Prisma, Anda hanya perlu memastikan URL database sudah disiapkan untuk digunakan oleh Vercel.

1. Buka dashboard [Supabase](https://supabase.com/) Anda.
2. Pergi ke **Project Settings** > **Database**.
3. Salin **Connection String** bagian **URI** (biasanya berformat `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`).
4. Simpan URI ini, karena akan digunakan sebagai `DATABASE_URL` di Vercel nanti.

---

## Bagian 2: Deploy Backend AI (Hugging Face Spaces)
Hugging Face Spaces menyediakan RAM gratis hingga **16 GB**, yang sangat cocok untuk memuat model YOLOv5 (`best.pt` dan `yolov5s.pt`) serta pustaka PyTorch yang cukup berat.

### Langkah 1: Buat Space di Hugging Face
1. Daftarkan diri Anda di [Hugging Face](https://huggingface.com/) jika belum memiliki akun.
2. Klik tombol **New** (di pojok kanan atas) > **Space**.
3. Isi detail Space Anda:
   * **Space Name:** `glowtone-backend` (atau nama lain pilihan Anda).
   * **License:** `mit` (atau bebas).
   * **Select the Space SDK:** Pilih **Docker** (bukan Streamlit/Gradio).
   * **Choose a Docker template:** Pilih **Blank** (kosong).
   * **Space Visibility:** Pilih **Public** (agar API dapat diakses oleh frontend Next.js).
4. Klik **Create Space**.

### Langkah 2: Unggah Kode Backend ke Hugging Face
Setelah Space dibuat, Hugging Face akan memberikan repositori Git khusus untuk Space Anda. Anda bisa mengunggah file backend menggunakan Git:

1. Di terminal komputer Anda (di folder `/backend`), lakukan inisialisasi Git dan tambahkan remote Hugging Face:
   *(Ganti `username` dan `space-name` sesuai dengan akun Anda)*
   ```bash
   # Masuk ke folder backend
   cd backend

   # Hapus folder venv dan __pycache__ agar tidak ikut terunggah (buat file .gitignore jika belum ada)
   echo "venv/" > .gitignore
   echo "__pycache__/" >> .gitignore
   echo ".env" >> .gitignore

   # Inisialisasi Git
   git init
   git add .
   git commit -m "Initial commit for Hugging Face Space"

   # Hubungkan ke repositori Hugging Face
   git remote add hf https://huggingface.co/spaces/username/space-name
   
   # Push kode Anda (Anda mungkin diminta memasukkan token akses Hugging Face sebagai password)
   git push -f hf master
   ```
   > [!TIP]
   > Anda bisa mendapatkan token akses di [Hugging Face Access Tokens Settings](https://huggingface.co/settings/tokens). Buat token baru dengan hak akses **Write**.

2. **Selesai!** Hugging Face akan mendeteksi `Dockerfile` yang telah kita buat dan mulai melakukan *building* kontainer Docker secara otomatis.
3. Setelah status Space berubah menjadi **Running**, Anda akan mendapatkan URL publik backend Anda. URL ini biasanya berformat:
   `https://username-space-name.hf.space` (Ganti dengan HTTPS).
4. Tes backend dengan membuka URL tersebut di browser. Jika berhasil, Anda akan melihat respons JSON:
   `{"status": "Backend AI siap menerima gambar!"}`.
5. Catat URL publik ini untuk digunakan di konfigurasi Vercel (Frontend).

---

## Bagian 3: Deploy Frontend (Vercel)
Vercel adalah platform terbaik untuk mendeploy aplikasi Next.js Anda secara instan.

### Langkah 1: Push Frontend ke GitHub
1. Buat repositori baru di GitHub (misal: `glowtone-frontend`).
2. Di komputer Anda, masuk ke folder `frontend` dan lakukan inisialisasi Git untuk push ke GitHub Anda:
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Prepare frontend for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/username/glowtone-frontend.git
   git push -u origin main
   ```

### Langkah 2: Deploy di Vercel
1. Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik **Add New** > **Project**.
3. Cari repositori `glowtone-frontend` yang baru Anda push, lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan variabel-variabel penting berikut:

| Key | Value | Keterangan |
|---|---|---|
| `DATABASE_URL` | *[Salinan URI dari Supabase]* | Digunakan oleh Prisma untuk mencatat riwayat pemindaian ke database. |
| `NEXT_PUBLIC_BACKEND_URL` | `https://username-space-name.hf.space` | URL backend Hugging Face yang Anda dapatkan di Bagian 2. |
| `NEXTAUTH_SECRET` | *[String Acak Bebas]* | Kunci enkripsi untuk sesi login (Anda bisa buat string acak, misal lewat perintah `openssl rand -base64 32` di terminal). |
| `NEXTAUTH_URL` | `https://glowtone-frontend.vercel.app` | URL proyek Vercel Anda sendiri (bisa disesuaikan setelah deploy selesai). |

5. Klik **Deploy** dan tunggu proses build selesai (biasanya kurang dari 2 menit).
6. **Aplikasi Anda sekarang online!** Anda bisa mengakses URL yang diberikan oleh Vercel untuk menguji pendaftaran akun, masuk, pemindaian wajah secara langsung (kamera/unggah), dan melihat halaman riwayat secara online.
