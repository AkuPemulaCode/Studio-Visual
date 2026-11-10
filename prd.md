# PRD - Inheartz Studio

Product Requirements Document untuk website & dashboard Inheartz Studio, studio media kreatif dan fotografi.

> Status: **Fase 2 selesai** — backend Laravel sudah terintegrasi (auth Sanctum, booking, pembayaran Midtrans Snap, verifikasi OTP WhatsApp untuk pendaftaran & reset password, dashboard admin).
> **Versi Dokumen: 0.1.8** — lihat [Changelog](#16-changelog).
> Dokumen terkait: [eerd.md](./eerd.md) untuk model data, [README.md](./README.md) untuk titik integrasi, dan folder [diagrams/](./diagrams) untuk UML/ERD.

## 1. Ringkasan Produk

Inheartz Studio adalah platform digital yang menampilkan layanan media kreatif sekaligus memungkinkan pelanggan melakukan booking, penjadwalan sesi, pembayaran online, dan login akun secara mandiri. Situs publik bergaya editorial minimalis (referensi desain: Bodypack) dengan alur pemesanan seperti situs booking. Bagian internal menyediakan dashboard admin untuk monitoring operasional.

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + React Router v7.
- **Backend**: Laravel 12 (REST API) + MySQL, autentikasi Laravel Sanctum (Bearer token).
- **Pembayaran**: Midtrans Snap (sandbox/production) dengan rekonsiliasi status.
- **Notifikasi**: WhatsApp OTP via Fonnte untuk **pendaftaran akun** dan **reset password**; notifikasi in-app (bell + toast + suara) untuk pembayaran & pesanan; **notifikasi WhatsApp untuk pesanan baru, perubahan status, progres produksi, dan rekomendasi paket**.

## 2. Latar Belakang & Masalah

- Pemesanan sesi masih manual, tidak ada slot jadwal yang terlihat jelas.
- Tidak ada pencatatan pembayaran (DP/pelunasan) yang terpusat.
- Tidak ada akun pelanggan untuk memantau booking dan status pembayaran.
- Admin kesulitan memantau booking, pendapatan, dan pelanggan secara real-time.
- Pembayaran online rawan tidak tervalidasi bila notifikasi gateway telat/gagal.

## 3. Tujuan & Metrik Keberhasilan

| Tujuan | Metrik |
| --- | --- |
| Meningkatkan booking mandiri | > 60% booking dibuat melalui web |
| Mempercepat konfirmasi | Konfirmasi pembayaran otomatis < 5 menit |
| Transparansi jadwal | Ketersediaan slot terlihat real-time |
| Efisiensi admin | Monitoring + saldo studio dalam satu dashboard |
| Ketahanan pembayaran | 0 booking nyangkut berkat rekonsiliasi Midtrans |

## 4. Persona Pengguna

- **Calon Pelanggan (Client)**: individual atau brand yang ingin memesan sesi foto/konten.
- **Pelanggan Terdaftar**: memiliki akun untuk memantau booking dan pembayaran.
- **Admin**: staf studio yang mengelola paket, jadwal, booking, pembayaran, saldo studio, produksi, dan akun user.
- **Pekerja Produksi (Production)**: anggota tim produksi yang memindahkan tahapan/progres pesanan pada papan kanban, mengelola status booking, dan melihat data pelanggan dari dashboard produksi.

## 5. Lingkup

### In Scope
- Landing page, layanan/paket, portofolio, kategori.
- Booking 4 langkah dengan kalender & slot jam.
- **Pembayaran online via Midtrans Snap** (transfer bank, VA, e-wallet, QRIS, kartu).
- **Rekonsiliasi status pembayaran** (tarik status langsung dari Midtrans) + webhook.
- **Ledger saldo studio** (kas masuk dari booking selesai, koreksi refund/chargeback).
- Login & register (RBAC: admin, production, client) + proteksi rute.
- **Register dengan verifikasi OTP WhatsApp** (Fonnte).
- **Reset password via OTP WhatsApp** (Fonnte).
- Dashboard admin: monitoring, finance/saldo, booking, pelanggan, **user**, paket, portofolio.
- **Dashboard pekerja produksi** (`/worker`): papan kanban produksi, menu **Booking**, dan menu **Pelanggan** khusus peran `production`. Perubahan status booking oleh pekerja langsung tercermin di dashboard admin (data bersama + polling).
- **Penanganan gagal database**: popup error global saat API/database tidak dapat diakses (HTTP 5xx atau koneksi gagal) dengan opsi muat ulang.
- **Tanda "Populer" pada paket dihapus** dari halaman publik maupun dashboard admin.
- **Kelola user & role** (CRUD akun admin/produksi/client) termasuk proteksi akun sendiri & minimal satu admin.
- **Monitoring progres produksi**: tahapan produksi per pesanan (antrean → transfer file → seleksi → editing → review → revisi → hasil dikirim), estimasi selesai, dan riwayat progres.
- Halaman progress pesanan dengan tombol cek status pembayaran.
- **Notifikasi in-app real-time** (bell + toast bersuara): admin dapat notif pesanan baru, client dapat notif pembayaran berhasil & pesanan selesai.
- **Notifikasi pesanan baru ke admin & staff produksi** via web + WhatsApp.
- **Notifikasi perubahan status pesanan ke pelanggan** via web + WhatsApp.
- **Sistem notifikasi rekomendasi paket**: rekomendasi dihitung dari riwayat pesanan pelanggan lalu dikirim via web + WhatsApp; juga tampil di halaman Pesanan.
- Halaman offline & halaman 404.

### Out of Scope
- Multi-cabang/multi-studio.
- Aplikasi mobile native.
- Notifikasi email otomatis (WhatsApp hanya untuk OTP pendaftaran & reset password).
- Payout/penarikan saldo otomatis ke rekening bank.

## 6. Arsitektur & Tech Stack

- **Frontend**: React SPA, Vite, Tailwind v4, React Router v7.
- **State & data**: Context (auth), service layer per domain, fallback mock saat backend offline.
- **Base URL API**: `VITE_API_URL` (contoh `http://127.0.0.1:8000/api`).
- **Auth**: Bearer token (Sanctum) di localStorage; handler 401 global mengarahkan ke `/login`.
- **Backend**: Laravel 12 + MySQL, sesuai [eerd.md](./eerd.md).
- **Pembayaran**: Midtrans Snap (`Snap.js` di FE, Snap API + status API di BE).
- **Rekonsiliasi**: endpoint `POST /payments/midtrans/sync` + command terjadwal `midtrans:reconcile` (tiap 5 menit).
- **WhatsApp**: Fonnte API untuk OTP pendaftaran akun & reset password.

Struktur frontend:

```
src/assets/
  admin/            # area admin terpisah (layout, components, pages)
  components/       # komponen publik bersama
  config/           # api.js (base URL + endpoint)
  context/          # AuthProvider
  data/             # mock fallback
  hooks/            # useOnlineStatus
  layouts/          # SiteLayout
  pages/            # halaman publik
  services/         # pemanggilan API per domain
  utils/            # format, jwt, loadSnap
```

## 7. Kebutuhan Fungsional

Prioritas: **P0** wajib, **P1** penting, **P2** opsional. Status: ✅ selesai.

### 7.1 Situs Publik
- **FR-01 (P0)** ✅ Hero slider, layanan unggulan, alur pemesanan, portofolio, kategori, CTA booking.
- **FR-02 (P0)** ✅ Navigasi: Home, Layanan, Jadwal, Pembayaran, Masuk/Daftar.
- **FR-03 (P1)** ✅ Responsif di mobile, tablet, dan desktop.

### 7.2 Layanan / Paket
- **FR-10 (P0)** ✅ Daftar paket (nama, harga, durasi, jumlah hasil, fitur).
- **FR-11 (P0)** ✅ Tombol "Pilih Paket" mengarah ke booking dengan paket terpilih.
- **FR-12 (P1)** ✅ Bagian FAQ.
- **FR-13 (P1)** ✅ Tanda/badge **"Populer"** pada kartu paket dihapus dari halaman publik dan dashboard admin; field `is_popular` tetap disimpan untuk kompatibilitas backend namun tidak lagi digunakan UI.

### 7.3 Portofolio
- **FR-20 (P0)** ✅ Galeri karya dengan filter kategori (produk, pre-wedding, portrait, event).
- **FR-21 (P1)** ✅ Filter berdasarkan tanggal.
- **FR-22 (P1)** ✅ Modal detail karya.

### 7.4 Booking & Penjadwalan
- **FR-30 (P0)** ✅ Alur 4 langkah: pilih paket, jadwal, data pemesan, konfirmasi.
- **FR-31 (P0)** ✅ Kalender untuk memilih tanggal (tanggal lampau disabled).
- **FR-32 (P0)** ✅ Slot jam tersedia sesuai tanggal (endpoint `/availability`).
- **FR-33 (P0)** ✅ Form data pemesan dengan validasi (nama, email, telepon wajib).
- **FR-34 (P0)** ✅ Ringkasan booking sticky dan tombol konfirmasi menuju pembayaran.
- **FR-35 (P1)** ✅ Data pemesan terisi otomatis bila sudah login.
- **FR-36 (P1)** ✅ Mengurangi kuota slot saat booking berhasil.

### 7.5 Pembayaran (Midtrans)
- **FR-40 (P0)** ✅ Menampilkan rincian booking dan total (diambil dari booking terkait, fallback ke draft).
- **FR-40a (P0)** ✅ **Pembayaran hanya untuk booking yang sudah dibuat**: bila halaman `/pembayaran` dibuka tanpa `?booking=<kode>`, sistem **tidak** menampilkan konfirmasi pembayaran melainkan pesan "Belum Ada Pesanan untuk Dibayar" + langkah booking dan CTA ke `/booking`.
- **FR-40b (P1)** ✅ Bila pelanggan sudah login dan punya tagihan, halaman menampilkan **daftar pesanan menunggu pembayaran** (`awaiting_payment`) dengan tombol **Bayar** yang mengarah ke `/pembayaran?booking=<kode>`.
- **FR-40c (P0)** ✅ Rincian pembayaran hanya tampil bila booking **benar-benar ada** dan berstatus `awaiting_payment`; selain itu tampil pesan "Pesanan Tidak Ditemukan" / "Tidak Menunggu Pembayaran".
- **FR-40d (P0)** ✅ **Pelanggan dapat membatalkan pembayaran** (status `pending`/`awaiting_payment` → `cancelled`) dari halaman Pembayaran dan halaman Pesanan, dengan konfirmasi. Slot jadwal dikembalikan (`availability.booked` decrement).
- **FR-41 (P0)** ✅ Pembayaran **hanya** melalui Midtrans Snap (transfer bank, VA, e-wallet, QRIS, kartu). Metode manual lama dihapus.
- **FR-42 (P0)** ✅ Snap popup dengan fallback redirect ke halaman Midtrans bila popup gagal.
- **FR-43 (P0)** ✅ Update booking otomatis ke `paid` saat pembayaran berhasil.
- **FR-44 (P0)** ✅ **Rekonsiliasi**: FE menarik status dari Midtrans tepat setelah bayar; command terjadwal menyapu pembayaran pending.
- **FR-45 (P0)** ✅ Webhook notifikasi Midtrans dengan verifikasi signature `SHA512` (invalid → 403).
- **FR-46 (P0)** ✅ Refund/chargeback → booking `cancelled` + koreksi saldo.
- **FR-47 (P0)** ✅ Tombol **"Cek Status Pembayaran"** di halaman Pesanan (client) & kelola booking admin.
- **FR-48 (P1)** ✅ Idempoten & anti-regresi: status `verified` tidak turun karena data basi.

### 7.6 Autentikasi
- **FR-50 (P0)** ✅ Login (email + password) dengan penyimpanan token.
- **FR-51 (P0)** ✅ Register akun baru dengan **verifikasi OTP WhatsApp** (form 2 langkah: isi data → minta kode OTP ke nomor WhatsApp → masukkan kode → akun dibuat).
- **FR-51a (P0)** ✅ **Kirim OTP pendaftaran** via WhatsApp (6 digit, berlaku 10 menit, maks 5 percobaan, throttled) + tombol kirim ulang kode.
- **FR-52 (P0)** ✅ Proteksi rute: halaman butuh login, halaman khusus admin, dan halaman khusus staff produksi (`/worker`). Redirect login otomatis sesuai peran (admin → `/admin`, production → `/worker`).
- **FR-53 (P1)** ✅ Logout dan hapus sesi; auto-logout saat 401.
- **FR-54 (P0)** ✅ **Lupa password via OTP WhatsApp** (6 digit, berlaku 10 menit, maks 5 percobaan) + reset password.
- **FR-55 (P0)** ✅ Kode OTP hanya dikirim melalui **WhatsApp** (tidak ditampilkan di layar).

### 7.7 Dashboard Admin (Monitoring)
- **FR-60 (P0)** ✅ Ringkasan statistik: total booking, menunggu, pendapatan, pelanggan, **pesanan selesai**.
- **FR-61 (P0)** ✅ Grafik pendapatan bulanan.
- **FR-62 (P0)** ✅ Tabel booking dengan filter status + **cek status pembayaran**.
- **FR-63 (P0)** ✅ Daftar pelanggan beserta total transaksi.
- **FR-64 (P0)** ✅ Daftar paket aktif.
- **FR-65 (P1)** ✅ Tambah/edit/hapus paket, kelola portofolio, dan ubah status booking.
- **FR-66 (P0)** ✅ **Menu User**: daftar seluruh akun (nama, kontak, peran, jumlah booking, tanggal daftar).
- **FR-67 (P0)** ✅ **Finance/Saldo Studio**: kartu saldo + tabel kas masuk terbaru.
- **FR-68 (P1)** ✅ Log aktivitas (audit trail) tercatat di backend.
- **FR-69 (P0)** ✅ **CRUD user & role**: tambah/edit/hapus akun (admin, produksi, client) dengan validasi; tidak bisa menghapus/menurunkan peran akun sendiri dan selalu menyisakan minimal satu admin.
- **FR-70 (P0)** ✅ **Sinkronisasi status lintas dashboard**: perubahan status booking oleh pekerja produksi langsung tersimpan dan tercermin di dashboard admin (sumber data sama + polling 15–20 detik pada Monitoring, Booking, dan Pelanggan).

### 7.8 Penanganan Offline
- **FR-80 (P0)** ✅ Deteksi status online/offline perangkat.
- **FR-81 (P0)** ✅ Halaman offline otomatis, dengan tombol "Coba Lagi".
- **FR-82 (P1)** ✅ Rute `/offline` khusus.
- **FR-83 (P0)** ✅ **Popup error database global**: saat API mengembalikan HTTP 5xx atau koneksi ke backend gagal, aplikasi menampilkan popup "Koneksi Database Bermasalah" dengan tombol **Tutup** dan **Muat Ulang**.
- **FR-84 (P1)** ✅ **Empty state data tidak tersedia**: halaman tetap menampilkan pesan data kosong bila data gagal dimuat, sehingga pengguna tidak melihat halaman kosong tanpa penjelasan.

### 7.9 Notifikasi In-App
- **FR-85 (P0)** ✅ Admin menerima notifikasi saat ada **pesanan baru** masuk.
- **FR-86 (P0)** ✅ Client menerima notifikasi saat **pembayaran berhasil** (`paid`).
- **FR-87 (P0)** ✅ Client menerima notifikasi saat **pesanan selesai** (`completed`).
- **FR-88 (P0)** ✅ Bell notifikasi dengan **badge unread** + daftar notifikasi (Navbar & header admin).
- **FR-89 (P0)** ✅ **Toast bersuara** (Web Audio API) saat notifikasi baru; badge diperbarui tanpa reload.
- **FR-90 (P1)** ✅ Tandai dibaca (per item / semua) & klik notifikasi menuju halaman terkait.
- **FR-116 (P0)** ✅ **Notifikasi pesanan baru** dikirim ke seluruh **admin & staff produksi** melalui web (bell/toast) dan **WhatsApp** (nomor pada profil user).
- **FR-117 (P0)** ✅ **Notifikasi perubahan status pesanan** (pending, awaiting_payment, paid, confirmed, ongoing, completed, cancelled) dikirim ke **pelanggan** melalui web dan **WhatsApp**.
- **FR-118 (P0)** ✅ **Notifikasi progres produksi** juga dikirim via WhatsApp ke pelanggan selain notifikasi web.
- **FR-119 (P0)** ✅ **Sistem notifikasi rekomendasi paket**: setelah pesanan selesai, sistem memilih paket rekomendasi (kategori/harga/riwayat) lalu mengirim notifikasi web + WhatsApp; daftar rekomendasi juga tampil di halaman **Pesanan**.

### 7.10 Lain-lain
- **FR-91 (P0)** ✅ Halaman 404.
- **FR-92 (P1)** ✅ Form kontak (`/contact`).

### 7.11 Monitoring Progres Produksi
- **FR-95 (P0)** ✅ Tahapan produksi terpisah dari status booking: `queued → transfer → culling → editing → review → revision → delivered`.
- **FR-96 (P0)** ✅ Admin dapat memindahkan tahapan produksi tiap pesanan beserta catatan progres.
- **FR-97 (P0)** ✅ Persentase penyelesaian otomatis dihitung dari tahapan aktif.
- **FR-98 (P0)** ✅ Riwayat (timeline) tiap perubahan tahapan tersimpan di tabel `booking_progress`.
- **FR-99 (P1)** ✅ Estimasi tanggal selesai produksi + penanda pesanan terlambat.
- **FR-100 (P0)** ✅ Halaman **Progres Produksi** admin: kartu ringkasan (total, diproses, terkirim, terlambat), sebaran tahapan, dan antrean pesanan.
- **FR-101 (P0)** ✅ Pelanggan melihat progres produksi (persen, tahapan, catatan, estimasi) di halaman **Progress Pesanan**.
- **FR-102 (P0)** ✅ Notifikasi in-app ke pelanggan setiap perubahan tahapan produksi.
- **FR-103 (P1)** ✅ Status booking `completed` otomatis menandai produksi sebagai `delivered`.
- **FR-104 (P0)** ✅ **Preview hasil**: admin mengisi `preview_url`; pelanggan melihat preview saat tahap `review`.
- **FR-105 (P0)** ✅ **Review klien**: tombol **Setujui Hasil** / **Minta Revisi** (+ catatan) di halaman Progress Pesanan.
- **FR-106 (P0)** ✅ Permintaan revisi otomatis memindahkan tahap ke `revision` & memberi notifikasi ke admin.
- **FR-107 (P1)** ✅ Dashboard produksi berbentuk **kanban** dengan **drag & drop** antar tahapan.
- **FR-108 (P0)** ✅ **Live update** (polling) halaman Progress Pesanan & Papan Produksi; animasi & toast feedback.
- **FR-109 (P1)** ✅ **Interaktivitas papan produksi**: kartu responsif terhadap hover (lift + border), animasi masuk modal & backdrop, indikator kolom tujuan drop, dan dukungan keyboard (Enter/Space) untuk membuka detail.
- **FR-110 (P0)** ✅ **Dashboard pekerja produksi** (`/worker`): layout terpisah tanpa menu admin, menampilkan papan kanban produksi untuk peran `production`.
- **FR-111 (P0)** ✅ **Menu Booking pekerja produksi** (`/worker/bookings`): daftar booking, filter status, pencarian, detail, serta ubah status booking.
- **FR-112 (P0)** ✅ **Menu Pelanggan pekerja produksi** (`/worker/customers`): daftar pelanggan, kontak, jumlah booking, status terakhir, dan total transaksi.
- **FR-113 (P0)** ✅ **Ubah status booking oleh pekerja produksi**: tersimpan ke backend/lokal dan langsung tercermin di dashboard admin. Aksi destruktif (hapus booking) dan sinkronisasi pembayaran Midtrans tidak ditampilkan untuk peran produksi.
- **FR-114 (P0)** ✅ **Popup error database** dan fallback data kosong pada seluruh dashboard saat database/backend tidak tersedia.
- **FR-115 (P1)** ✅ **Penghapusan tanda populer** pada paket di seluruh tampilan (Home, Layanan, dan dashboard Paket).

## 8. Alur Pengguna

**Booking -> Pembayaran -> Konfirmasi**
1. Pengguna memilih paket di `/layanan` atau langsung ke `/booking`.
2. Mengisi langkah booking (paket, jadwal, data, konfirmasi) → booking `awaiting_payment`.
3. Diarahkan ke `/pembayaran?booking=<kode>` lalu klik **Bayar Sekarang**.
4. Sistem membuat transaksi Snap; pengguna membayar di jendela Midtrans (atau redirect).
5. FE memanggil `POST /payments/midtrans/sync` → status ditarik dari Midtrans → booking menjadi `paid`.
6. Bila webhook telat/gagal, command `midtrans:reconcile` menyapu pembayaran pending tiap 5 menit.

> Catatan UX: bila `/pembayaran` dibuka **tanpa** `?booking=<kode>` (mis. dari menu navigasi), halaman tidak menampilkan form pembayaran. Sistem menampilkan daftar tagihan `awaiting_payment` milik pelanggan (bila login) atau pesan "Belum Ada Pesanan untuk Dibayar" beserta langkah booking.

**Login -> Monitoring**
1. Admin login di `/masuk` → diarahkan ke `/admin` (monitoring + saldo).
2. Menavigasi tab Booking, Pelanggan, User, Paket, Portofolio.

**Login -> Dashboard Produksi**
1. Pekerja produksi login di `/masuk` → diarahkan ke `/worker` (papan kanban produksi).
2. Menavigasi menu **Produksi**, **Booking**, dan **Pelanggan**.
3. Mengubah status booking atau tahapan produksi → perubahan tersimpan dan dashboard admin ikut memperbarui data (polling).
4. Bila backend/database tidak dapat diakses, muncul popup error dengan tombol **Muat Ulang**.

**Daftar Akun (dengan OTP WhatsApp)**
1. Pengguna membuka `/daftar` → mengisi nama, email, nomor WhatsApp, password.
2. Klik **Kirim Kode OTP** → sistem membuat OTP (6 digit, berlaku 10 menit) dan mengirimnya via WhatsApp (Fonnte).
3. Pengguna memasukkan kode OTP → klik **Verifikasi & Daftar**.
4. OTP valid → akun dibuat (`role = client`) dan pengguna otomatis login.

**Lupa Password**
1. Pengguna klik "Lupa?" di `/masuk` → `/lupa-password`.
2. Masukkan email → OTP dikirim via WhatsApp (Fonnte).
3. Verifikasi OTP → set password baru → login.

## 9. Kebutuhan Non-Fungsional

- **Performa**: build produksi ringan, pemuatan halaman < 3 detik. **[UPG]** Penggunaan pagination, debounce, code-splitting, lazy load, optimasi query, caching (Redis) untuk load >1000 concurrent users.
- **Responsif**: breakpoint mobile-first.
- **Keamanan**: Bearer token; signature webhook SHA512; OTP di-hash; throttle endpoint OTP; role/permission check (Policy/Gate); audit log.
- **Aksesibilitas**: label pada input, `aria-label` pada tombol ikon.
- **Scalability**: rate limiting, eager loading, DB indexing, job queue (notif/WA), SSE/WebSocket untuk live update (opsional).
- **Maintainability**: pemisahan layer (config/service/context/layout/pages), area admin terpisah.
- **Resiliensi**: fallback mock saat backend offline; halaman offline; **popup error database** saat HTTP 5xx/koneksi gagal; rekonsiliasi pembayaran otomatis. Tanda populer paket tidak lagi ditampilkan.

## 10. Peta Endpoint API

| Modul | Endpoint | Method | Auth |
| --- | --- | --- | --- |
| Auth | `/login`, `/register` | POST | publik |
| Auth | `/register/request-otp` | POST | publik (throttled) |
| Auth | `/logout`, `/me` | POST/GET | bearer |
| Auth | `/forgot-password`, `/verify-otp`, `/reset-password` | POST | publik (throttled) |
| Paket | `/packages`, `/packages/{slug}` | GET | publik |
| Kategori | `/categories` | GET | publik |
| Portofolio | `/portfolios`, `/portfolios/{id}` | GET | publik |
| Jadwal | `/availability?date=` | GET | publik |
| Booking | `/bookings` | POST | publik |
| Booking | `/bookings`, `/bookings/{id}` | GET | bearer |
| Pembayaran | `/payment-methods` | GET | publik |
| Pembayaran | `/payments/midtrans/charge` | POST | publik |
| Pembayaran | `/payments/midtrans/sync` | POST | publik |
| Pembayaran | `/payments/midtrans/status/{orderId}` | GET | publik |
| Pembayaran | `/payments/midtrans/notification` | POST | publik (signature) |
| Admin | `/admin/stats`, `/admin/finance`, `/admin/users` | GET | admin |
| Admin/Produksi | `/admin/bookings`, `/admin/customers` (baca data booking & pelanggan untuk dashboard produksi) | GET | staff (admin/production, read-only untuk production) |
| Admin | `/admin/production` (antrean + ringkasan produksi) | GET | admin |
| Admin | `/admin/users`, `/admin/users/{user}` (CRUD user & role) | POST/PUT/DELETE | admin |
| Admin | `/packages`, `/portfolios` (CRUD), `/bookings/{id}` (DELETE) | - | admin |
| Admin/Produksi | `/bookings/{id}` (PATCH status booking dari dashboard produksi) | PATCH | staff (admin/production) |
| Produksi | `/production` (antrean produksi untuk pekerja) | GET | staff |
| Produksi | `/bookings/{id}/progress` (ubah tahapan + preview) | PATCH | staff |
| Produksi | `/bookings/{id}/review` (setujui / minta revisi) | POST | bearer |
| Pembayaran | `/bookings/{id}/cancel` (batalkan pembayaran) | POST | bearer |
| Notifikasi | `/notifications` | GET | bearer |
| Notifikasi | `/notifications/{id}/read`, `/notifications/read-all` | POST | bearer |
| Rekomendasi | `/recommendations` (paket rekomendasi untuk user login) | GET | bearer |
| Kontak | `/contact` | POST | publik |

## 11. Model Data

Ringkasan entitas: `users`, `categories`, `packages`, `portfolios`, `availabilities`, `bookings`, `booking_progress`, `payment_methods`, `payments`, `cash_transactions`, `notifications`, `contact_messages`, `activity_logs`, `registration_otps`, `password_reset_otps`, `personal_access_tokens`. Detail lengkap pada [eerd.md](./eerd.md) dan [diagrams/erd.dbml](./diagrams/erd.dbml).

Catatan penting:
- `users` memiliki `role` enum (`admin | production | client`); token Sanctum disimpan di `personal_access_tokens`.
- `payments` memiliki kolom gateway: `provider`, `midtrans_order_id`, `snap_token`, `snap_url`, `transaction_status`, `fraud_status`, `payload`; status: `pending | verified | rejected | refunded`.
- `cash_transactions` menyimpan `income`/`expense` per booking (unik per `booking_id + type`).
- `registration_otps` menyimpan OTP pendaftaran (`email`, `phone`, `otp_hash`, `attempts`, `expires_at`, `used_at`).
- `password_reset_otps` menyimpan `otp_hash`, `attempts`, `expires_at`, `used_at`.
- `notifications` (Laravel database notifications) menyimpan `type`, `data` (title, message, url, tipe), `read_at` per user.
- `bookings` memiliki kolom produksi: `production_stage`, `production_percent`, `estimated_finish`, `production_started_at`, `production_finished_at`.
- `bookings` juga menyimpan hasil review: `preview_url`, `review_status` (`pending | approved | revision`), `revision_count`.
- `booking_progress` menyimpan riwayat tahapan produksi (`stage`, `status`, `note`, `user_id`) per booking.
- `packages.is_popular` dipertahankan untuk kompatibilitas backend, tetapi tidak lagi digunakan atau ditampilkan di UI.

## 12. Peran & Hak Akses

| Peran | Hak |
| --- | --- |
| Guest | Melihat situs, layanan, portofolio; booking & bayar (Midtrans) tanpa login |
| Client | Semua akses guest + akun, riwayat booking, cek status pembayaran, reset password |
| Produksi (`production`) | Login, dashboard produksi (`/worker`), lihat antrean & ubah progres tahapan produksi, menu **Booking** (ubah status), menu **Pelanggan** (baca data). Perubahan status tersinkron ke dashboard admin. |
| Admin | Semua akses + dashboard monitoring, finance/saldo, kelola booking/paket/portofolio, **CRUD user & role**, modul produksi, notifikasi pesanan baru |

> Implementasi middleware: endpoint produksi dilindungi middleware `staff` (admin **atau** `production`); endpoint admin lain dilindungi middleware `admin`.

## 13. Asumsi & Ketergantungan

- Backend Laravel menyediakan autentikasi token dan endpoint sesuai peta di atas.
- Respons API mengikuti pola `{ data: ... }` atau array langsung.
- Kredensial Midtrans (server & client key) dan Fonnte (token) tersedia via `.env`.
- Webhook Midtrans memerlukan URL publik (ngrok saat pengembangan); rekonsiliasi menjadi jaring pengaman.
- Scheduler Laravel berjalan (`php artisan schedule:run` / `schedule:work`).
- Slot jadwal dikelola pada tabel `availabilities`.

## 14. Roadmap

1. **Fase 1** ✅ Frontend lengkap + mock fallback + struktur siap backend.
2. **Fase 2** ✅ Integrasi Laravel (auth, paket, booking, Midtrans, OTP, admin finance, notifikasi in-app).
3. **Fase 3** ⏳ Notifikasi email, CRUD penuh di admin (user & role ✅), laporan lanjutan.
4. **Fase 4** ⏳ Laporan saldo/laba periodik, optimasi SEO, hardening produksi.

## 15. Risiko & Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Perbedaan skema API vs frontend | Sentinel di layer `services/` + `config/api.js` |
| Slot jadwal bentrok | Validasi kuota di backend + status booking |
| Webhook Midtrans telat/gagal | Rekonsiliasi FE + command `midtrans:reconcile` terjadwal |
| Pembayaran dobel/status turun | `PaymentReconciler` idempoten & anti-regresi |
| Refund/chargeback | Booking `cancelled` + koreksi saldo otomatis |
| Kehilangan koneksi | Halaman offline + fallback mock |
| OTP disalahgunakan | Throttle + masa berlaku 10 menit + batas 5 percobaan + OTP hanya dikirim via WhatsApp (tidak ditampilkan) |
| Notifikasi tidak terdengar | Toast + badge tetap tampil walau audio diblokir browser (butuh gesture pertama) |

## 16. Changelog

### 0.1.8
- **Notifikasi pesanan baru via web + WhatsApp**: admin dan staff produksi menerima notifikasi bell/toast; pesan WhatsApp dikirim ke nomor pada profil masing-masing (tautan berbeda untuk admin & pekerja produksi).
- **Notifikasi perubahan status pesanan via web + WhatsApp**: pelanggan menerima notifikasi setiap status berubah (termasuk pembatalan), bukan hanya saat selesai. Notifikasi pembayaran & progres produksi juga disertai WhatsApp.
- **Sistem notifikasi rekomendasi paket**: rekomendasi dihitung dari kategori/harga/riwayat pesanan, dikirim via web + WhatsApp setelah pesanan selesai, dan ditampilkan di halaman Pesanan. Endpoint baru `GET /recommendations`.
- **Perubahan status booking oleh staff produksi** kini benar-benar diizinkan di backend (route `PATCH /bookings/{id}` dipindah ke middleware `staff`), sehingga notifikasi status ikut terkirim.
- Konfigurasi baru `FRONTEND_URL` untuk tautan di pesan WhatsApp.

### 0.1.7
- **Menu Booking & Pelanggan untuk pekerja produksi**: rute baru `/worker/bookings` dan `/worker/customers`; sidebar produksi kini memiliki menu Produksi, Booking, dan Pelanggan.
- **Sinkronisasi status lintas dashboard**: perubahan status booking oleh pekerja produksi selalu ditulis ke backend dan mirror lokal, lalu dashboard admin diperbarui lewat polling (Monitoring, Booking, Pelanggan). Aksi hapus booking & sinkronisasi Midtrans disembunyikan untuk peran produksi.
- **Popup error database global**: HTTP 5xx atau kegagalan koneksi backend memicu popup "Koneksi Database Bermasalah" dengan tombol Tutup/Muat Ulang, disertai fallback data kosong.
- **Tanda "Populer" dihapus** dari kartu paket di Home, Layanan, dan dashboard Paket; opsi centang populer di form paket juga dihapus. Kolom `is_popular` tetap ada di database untuk kompatibilitas.
- Sinkronisasi PRD, ERD, use case, activity, class, dan flowchart dengan menu produksi baru serta penanganan gagal database.

### 0.1.6
- **Verifikasi OTP WhatsApp saat pendaftaran akun**: alur daftar 2 langkah (isi data → kirim OTP → masukkan kode → akun dibuat). Endpoint baru `POST /register/request-otp`; `POST /register` kini mewajibkan `otp` yang valid.
- **Tabel `registration_otps`**: menyimpan OTP pendaftaran (`email`, `phone`, `otp_hash`, `attempts`, `expires_at`, `used_at`).
- **Kode OTP tidak ditampilkan di layar**: baik pendaftaran maupun lupa password kini hanya mengirim kode via WhatsApp (Fonnte), sesuai praktik keamanan.
- Sinkronisasi diagram (use case, class, ERD) & ERD dengan fitur OTP pendaftaran.

### 0.1.5
- **Peran `production` (pekerja produksi)** + dashboard terpisah `/worker`; redirect login otomatis sesuai peran.
- **CRUD user & role** untuk admin (`/admin/users`) dengan proteksi: tak bisa menghapus/menurunkan peran akun sendiri dan minimal satu akun admin. Middleware `staff` baru (admin + production) untuk modul produksi.
- **Papan produksi lebih interaktif**: animasi masuk modal & backdrop, hover lift pada kartu, indikator kolom tujuan drop, dukungan keyboard (Enter/Space), dan transisi progres.
- Perbaikan dokumentasi: sinkronisasi ERD/UML dengan skema nyata (`users.role = admin | production | client`), penambahan changelog & versi dokumen.

### 0.1.4
- Monitoring progres produksi (tahapan, persentase, estimasi, riwayat `booking_progress`).
- Preview hasil & review klien (setujui / minta revisi) + notifikasi in-app setiap perubahan tahapan.
- Papan produksi kanban dengan drag & drop serta live update (polling).

### 0.1.0
- Rilis awal: frontend publik, booking, pembayaran Midtrans Snap, OTP WhatsApp, dashboard admin & finance, notifikasi in-app.
