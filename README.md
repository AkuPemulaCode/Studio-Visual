# Inheartz Studio

Frontend studio media kreatif & fotografi dibangun dengan React 19, Vite, Tailwind CSS v4, dan React Router v7. Struktur kode sudah dipisahkan per layer agar mudah disambungkan ke backend Laravel.

> **Versi Dokumen: 0.2.0**

## Scripts

```
npm run dev      # jalankan development server
npm run build    # build produksi
npm run lint     # eslint
npm run preview  # preview hasil build
```

## Environment

Salin `.env.example` menjadi `.env` lalu sesuaikan base URL API Laravel.

```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Struktur Folder

```
src/assets/
  config/api.js        -> base URL, key localStorage, daftar endpoint
  services/            -> lapisan pemanggilan API (http.js + service per domain)
  context/             -> AuthProvider, authContext (state login)
  hooks/               -> useOnlineStatus (deteksi koneksi)
  utils/               -> format.js (format harga/tanggal), jwt.js (generate & download JWT)
  data/mock.js         -> data fallback saat backend belum tersedia
  data/store.js        -> penyimpanan lokal (localStorage) untuk CRUD tanpa backend
  layouts/             -> SiteLayout (kerangka situs publik)
  components/          -> Navbar, Footer, ProtectedRoute, OfflineGate, OfflineScreen, DatabaseAlert, dll
  pages/               -> Home, Services, Category, Booking, Payment, Orders, Login, Register, Offline, NotFound
  admin/               -> area admin terpisah
    layout/            -> AdminLayout (sidebar + outlet), WorkerLayout (khusus produksi)
    components/        -> StatCard, RevenueChart, StatusChart, Modal, AdminPageHeader
    pages/             -> Monitoring, Production, Bookings, Customers, Users, Packages, Portfolios, AuditLogs
```

Dokumentasi produk & data: [prd.md](./prd.md) (product requirements) dan [eerd.md](./eerd.md) (model data / EERD).

## Titik Sambung Backend (Laravel)

Semua request melewati `src/assets/config/api.js` (endpoint + base URL) dan `src/assets/services/http.js` (fetch wrapper, otomatis menambahkan header `Authorization: Bearer <token>`). Ubah endpoint di `API_ENDPOINTS` bila route Laravel berbeda.

| Bagian | File service | Fungsi | Endpoint (default) | Method |
| --- | --- | --- | --- | --- |
| Login | `services/authService.js` | `login()` | `/login` | POST |
| Kirim OTP daftar | `services/authService.js` | `requestRegisterOtp()` | `/register/request-otp` | POST |
| Register | `services/authService.js` | `register()` | `/register` | POST |
| Lupa password | `services/authService.js` | `forgotPassword()`, `verifyOtp()`, `resetPassword()` | `/forgot-password`, `/verify-otp`, `/reset-password` | POST |
| Profil user | `services/authService.js` | `me()` | `/me` | GET |
| Logout | `services/authService.js` | `logout()` | `/logout` | POST |
| Paket layanan | `services/packageService.js` | `list()`, `detail()`, `create()`, `update()`, `remove()`, `categories()` | `/packages`, `/packages/{slug}`, `/categories` | GET/POST/PUT/DELETE |
| Portofolio | `services/portfolioService.js` | `list()`, `adminList()`, `detail()`, `create()`, `update()`, `remove()` | `/portfolios`, `/portfolios/{id}` | GET/POST/PUT/DELETE |
| Ketersediaan jadwal | `services/bookingService.js` | `availability()` | `/availability?date=` | GET |
| Buat booking | `services/bookingService.js` | `create()` | `/bookings` | POST |
| Booking saya | `services/bookingService.js` | `mine()`, `detail()`, `updateStatus()`, `remove()` | `/bookings`, `/bookings/{id}` | GET/PATCH/DELETE |
| Status pelanggan | `services/adminService.js` | `customers()` | `/admin/customers` | GET |
| Ubah status booking | `services/adminService.js` | `updateBookingStatus()`, `removeBooking()` | `/bookings/{id}` | PATCH (admin/staff) / DELETE (admin) |
| User & role | `services/adminService.js` | `users()`, `createUser()`, `updateUser()`, `removeUser()` | `/admin/users`, `/admin/users/{id}` | GET/POST/PUT/DELETE |
| Metode pembayaran | `services/paymentService.js` | `methods()` | `/payment-methods` | GET |
| Buat pembayaran | `services/paymentService.js` | `create()` | `/payments` | POST |
| Upload bukti bayar | `services/paymentService.js` | `uploadProof()` | `/payments/proof` | POST (multipart) |
| Monitoring admin | `services/adminService.js` | `stats()`, `bookings()`, `revenue()`, `monitoring()` | `/admin/stats`, `/admin/bookings`, `/admin/revenue`, `/admin/monitoring` | GET |
| Progres produksi | `services/adminService.js` | `production()`, `updateProgress()` | `/production`, `/bookings/{id}/progress` | GET/PATCH |
| Review klien | `services/bookingService.js` | `review()` | `/bookings/{id}/review` | POST |
| Rekomendasi paket | `services/recommendationService.js` | `list()` | `/recommendations` | GET |
| Kontak | `config/api.js` | `ENDPOINTS.contact` | `/contact` | POST |

Catatan: selama backend belum berjalan, setiap service otomatis jatuh ke data `data/mock.js` sehingga UI tetap tampil. Begitu endpoint Laravel aktif dan mengembalikan JSON (format `{ data: ... }` atau array langsung), data backend akan otomatis dipakai.

### Autentikasi & Token

- `http.js` menyimpan token dari hasil login ke `localStorage` (`inheartz_token`) dan mengirimnya sebagai `Authorization: Bearer <token>`.
- Login/register menerima respons Laravel Sanctum / JWT selama mengembalikan `token` atau `access_token` dan `user`.
- **Register wajib OTP**: panggil `/register/request-otp` (nama, email, phone, password, password_confirmation) untuk mengirim kode ke WhatsApp, lalu `/register` dengan tambahan field `otp`. Kode **tidak** ditampilkan di UI, hanya dikirim via WhatsApp (Fonnte).
- Panduan route: gunakan middleware `auth:sanctum` (atau JWT) untuk endpoint booking/pembayaran yang butuh login, dan middleware admin untuk endpoint `/admin/*`.

### Akun Demo (tanpa backend)

- Admin: `admin@inheartz.test` / `admin123`
- Produksi: `staff@inheartz.test` / `staff123`
- Client: `client@inheartz.test` / `client123`

### Download JWT (Admin > Tools)

Buka `/admin` lalu tab **Tools**. Tersedia generator JWT (HS256) untuk pengujian: isi payload JSON, secret (samakan dengan `JWT_SECRET` backend), masa berlaku, lalu **Generate Token**. Token dapat **disalin** atau **diunduh** sebagai `inheartz-token.jwt`. Tersedia juga tombol **Download Token Aktif** untuk mengunduh token sesi login saat ini. Terapkan di frontend dengan menaruh token ke header:

```
Authorization: Bearer <token>
```

## Fitur

- Booking bertahap 5 langkah (kategori, paket, jadwal, data, konfirmasi) dengan kalender penjadwalan dan pemilihan jam.
- Halaman informasi paket layanan beserta FAQ.
- Halaman pembayaran dengan pilihan metode dan unggah bukti.
- Halaman **Progress Pesanan** (`/pesanan`) untuk client memantau tahapan pesanan.
- Login & register, dilindungi `ProtectedRoute`.
- Dashboard admin untuk monitoring (statistik, grafik pendapatan gaya SaaS, donut status, booking, pelanggan, paket, portofolio).
- **Monitoring progres produksi**: tahapan `antrean → transfer → seleksi → editing → review → revisi → hasil dikirim`, persentase, estimasi selesai, riwayat, dan notifikasi ke pelanggan.
- **Review hasil interaktif**: pelanggan melihat preview hasil saat tahap *Review Klien* lalu **Setujui Hasil** atau **Minta Revisi** (catatan wajib) langsung dari halaman Progress Pesanan.
- **Papan produksi kanban** dengan **drag & drop** antar tahapan di dashboard admin, plus **live update** (polling) dan animasi/toast feedback.
- **Dashboard pekerja produksi** (`/worker`) untuk peran `production` — akses terpisah dari area admin, dengan menu **Produksi**, **Booking**, dan **Pelanggan**. Perubahan status booking oleh pekerja langsung tercermin di dashboard admin (polling).
- **Notifikasi pesanan baru & perubahan status** via web (bell + toast) dan **WhatsApp**: admin/staff menerima pesanan baru, pelanggan menerima perubahan status, pembayaran, dan progres produksi.
- **Sistem notifikasi rekomendasi paket**: paket direkomendasikan berdasarkan riwayat/kategori/harga, dikirim via web + WhatsApp, dan ditampilkan di halaman Pesanan.
- **Popup error database**: bila API/database tidak dapat diakses (HTTP 5xx/koneksi gagal), tampil popup "Koneksi Database Bermasalah" dengan tombol Tutup/Muat Ulang.
- **Tanda "Populer" dihapus** dari kartu paket di Home, Layanan, dan dashboard Paket.
- CRUD admin: kelola **Paket**, **Portofolio**, dan **User** (akun admin/produksi/client beserta role) serta ubah status progress booking & produksi.
- **Interaksi halus**: modal dengan animasi masuk, kartu produksi responsif terhadap hover/klik, dan indikator kolom tujuan drop.
- Halaman offline otomatis saat perangkat tidak terhubung internet.

## Penyimpanan Data (tanpa backend)

Saat backend belum berjalan, data disimpan di `localStorage` melalui `src/assets/data/store.js`
(ter-seed dari `src/assets/data/mock.js`). Semua perubahan admin (paket, portofolio) dan
status booking akan tersimpan dan langsung tampil di situs publik maupun halaman progress
client. Hapus key `inheartz_store_*` di `localStorage` untuk mengembalikan data awal.
