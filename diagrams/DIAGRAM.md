# Diagram Sistem - Inheartz Studio

Dokumen ini menampilkan seluruh diagram sistem dalam format **Mermaid** agar mudah dibaca, dipresentasikan, dan dirender di GitHub, GitLab, VS Code, dan viewer Markdown lain.

> Sumber asli juga tersedia: PlantUML (`.puml`) untuk UML & HIPO, serta DBML (`.dbml`) untuk ERD. Lihat tabel [Berkas Sumber](#berkas-sumber) di bawah.
>
> **Versi Dokumen: 0.2.0**
>
> **Catatan:** Diagram ini disusun untuk tampilan yang lebih rapi dan mudah dicerna saat dipakai untuk review produk, demo, atau laporan tugas.

## Overview Arsitektur

```mermaid
flowchart LR
    Guest[Guest / Calon Pelanggan] --> Web[Website Inheartz]
    Web --> Booking[Booking & Jadwal]
    Booking --> Midtrans[Midtrans Snap]
    Midtrans --> Payment[Status Pembayaran]
    Payment --> Pesanan[Pesanan & Progress]
    Web --> Admin[Admin Dashboard]
    Web --> Staff[Staff / Produksi]
    Admin --> Mgmt[Booking, User, Paket, Portofolio]
    Staff --> Kanban[Kanban Produksi]
    Mgmt --> Notif[Notifikasi Web + WhatsApp]
    Kanban --> Notif
```

Daftar isi:
1. [Use Case Diagram](#1-use-case-diagram)
2. [Activity Diagram](#2-activity-diagram)
3. [Class Diagram](#3-class-diagram)
4. [ERD (Entity Relationship Diagram)](#4-erd-entity-relationship-diagram)
5. [State Diagram Status Booking](#5-state-diagram-status-booking)
6. [State Diagram Status Pembayaran](#6-state-diagram-status-pembayaran)
7. [Flowchart Alur Web (Navigasi, Booking, Pembayaran, Peran)](#7-flowchart-alur-web-navigasi-booking-pembayaran-peran)
8. [Flowchart Penanganan Gagal Database](#8-flowchart-penanganan-gagal-database)
9. [HIPO - Hierarchy Chart](#9-hipo---hierarchy-chart)
10. [HIPO - Input / Process / Output (IPO)](#10-hipo---input--process--output-ipo)

---

## 1. Use Case Diagram

```mermaid
flowchart LR
    guest(("Guest /<br/>Calon Pelanggan"))
    client(("Pelanggan<br/>Terdaftar (Client)"))
    admin(("Admin<br/>Studio"))
    worker(("Pekerja<br/>Produksi"))
    midtrans[["Midtrans Snap"]]
    fonnte[["WhatsApp<br/>(Fonnte)"]]
    notif[["Notifikasi<br/>In-App"]]

    subgraph SYS["Inheartz Studio"]
        uc01(["Lihat beranda & hero"])
        uc02(["Lihat paket & FAQ"])
        uc03(["Lihat portofolio<br/>(filter kategori/tanggal & detail)"])
        uc04(["Lihat ketersediaan jadwal"])
        uc05(["Buat booking 5 langkah<br/>(kategori → paket → jadwal → data → konfirmasi)"])
        uc06(["Bayar via Midtrans Snap"])
        uc07(["Lihat tagihan belum dibayar"])
        uc08(["Batalkan pembayaran"])
        uc09(["Cek status pembayaran"])
        uc10(["Daftar akun"])
        uc11(["Verifikasi OTP WhatsApp"])
        uc12(["Login / Logout"])
        uc13(["Reset password via OTP"])
        uc14(["Lihat pesanan & progres produksi"])
        uc15(["Setujui hasil / minta revisi"])
        uc16(["Terima notifikasi in-app"])
        uc17(["Monitoring & statistik"])
        uc18(["Kelola booking<br/>(status, kategori, catatan, link Drive, preview, hapus)"])
        uc19(["Kelola papan produksi (kanban)"])
        uc20(["Kelola paket layanan"])
        uc21(["Kelola portofolio"])
        uc22(["Kelola user & role"])
        uc23(["Lihat saldo & kas studio"])
        uc24(["Verifikasi / cek pembayaran Midtrans"])
        uc25(["Lihat audit log"])
        uc26(["Ubah tahapan produksi & preview"])
        uc27(["Kelola status booking"])
        uc28(["Lihat data pelanggan"])
        uc29(["Terima notifikasi pesanan<br/>(web + WhatsApp)"])
        uc30(["Terima notifikasi pesanan baru<br/>(web + WhatsApp)"])
        uc31(["Terima rekomendasi paket<br/>(web + WhatsApp)"])
    end

    guest --> uc01
    guest --> uc02
    guest --> uc03
    guest --> uc04
    guest --> uc05
    guest --> uc06
    guest --> uc10
    guest --> uc11
    guest --> uc12
    guest --> uc13

    client --> uc07
    client --> uc08
    client --> uc09
    client --> uc12
    client --> uc13
    client --> uc14
    client --> uc15
    client --> uc16
    client --> uc29
    client --> uc31

    admin --> uc12
    admin --> uc16
    admin --> uc17
    admin --> uc18
    admin --> uc19
    admin --> uc20
    admin --> uc21
    admin --> uc22
    admin --> uc23
    admin --> uc24
    admin --> uc25
    admin --> uc26
    admin --> uc28
    admin --> uc30

    worker --> uc12
    worker --> uc16
    worker --> uc19
    worker --> uc26
    worker --> uc27
    worker --> uc28
    worker --> uc30

    uc06 --> midtrans
    uc09 --> midtrans
    uc24 --> midtrans
    uc11 --> fonnte
    uc13 --> fonnte
    uc29 --> fonnte
    uc30 --> fonnte
    uc31 --> fonnte
    uc16 --> notif
    uc29 --> notif
    uc31 --> notif

    uc05 -.->|include| uc04
    uc06 -.->|extend| uc07
    uc10 -.->|include| uc11
    uc13 -.->|include| uc11
    uc09 -.->|extend| uc14
    uc15 -.->|extend| uc14
    uc26 -.->|extend| uc19
    uc27 -.->|extend| uc18
    uc29 -.->|extend| uc14
    uc31 -.->|extend| uc14
    uc30 -.->|extend| uc18
```

---

## 2. Activity Diagram

Activity diagram dipisah per aktor agar alurnya 1-1 sesuai aksi yang dilakukan aktor dan fitur yang tersedia. Versi gabungan (swimlane) tetap tersedia di `activity.puml`.

### 2.1 Activity Diagram - Guest / Client

Alur: jelajah publik → autentikasi/OTP → booking → pembayaran Midtrans → pesanan/review → notifikasi web + WhatsApp → rekomendasi paket.

```mermaid
flowchart TD
    start((Mulai)) --> browse["Buka situs & jelajahi<br/>Home, Layanan, Portofolio/Kategori, Jadwal"]
    browse --> wantBook{"Ingin memesan sesi?"}
    wantBook -- tidak --> seeOrders["Lihat pesanan & rekomendasi<br/>(jika sudah login)"] --> stop0((Selesai))
    wantBook -- ya --> loggedIn{"Sudah login?"}
    loggedIn -- tidak --> auth["Daftar / Masuk / Lupa Password<br/>OTP WhatsApp via Fonnte"]
    auth --> authDone["Backend: autentikasi + OTP<br/>redirect sesuai peran"]
    loggedIn -- ya --> token["Sistem: validasi token Sanctum"]
    authDone --> book["/booking<br/>pilih kategori, paket, tanggal & jam"]
    token --> book
    book --> avail{"Slot tersedia?"}
    avail -- tidak --> full["Tampilkan 'slot penuh'"] --> stop0
    avail -- ya --> data["Isi data pemesan & konfirmasi"]
    data --> create["Backend: booking awaiting_payment<br/>kuota dikurangi"]
    create --> notifyNew["Backend: notif pesanan baru<br/>ke admin/staff (web + WhatsApp)"]
    notifyNew --> pay["/pembayaran?booking=KODE"]
    pay --> cancel{"Batalkan pembayaran?"}
    cancel -- ya --> void["booking=cancelled<br/>kuota dikembalikan, catat log<br/>notif pembatalan ke client"] --> stop0
    cancel -- tidak --> charge["Bayar via Midtrans Snap"]
    charge --> mid["Midtrans: proses pembayaran"]
    mid --> sync["Backend: webhook / sync status"]
    sync --> sig{"Signature valid?"}
    sig -- tidak --> reject["Tolak notifikasi (403)"] --> stop0
    sig -- ya --> success{"Pembayaran berhasil?"}
    success -- tidak --> failed["payment=rejected<br/>notif gagal ke client<br/>tampilkan gagal"] --> stop0
    success -- ya --> paid["payment=verified; booking=paid<br/>notif pembayaran ke client (web + WhatsApp)"]
    paid --> orders["Client: /pesanan<br/>progres produksi, notifikasi,<br/>rekomendasi paket"]
    orders --> preview{"Ada preview hasil?"}
    preview -- tidak --> stop0
    preview -- ya --> approve{"Setujui hasil?"}
    approve -- ya --> approved["review_status=approved"] --> stop0
    approve -- tidak --> revision["Minta revisi + catatan<br/>stage=revision, revision_count+1<br/>notif ke admin/worker (web + WhatsApp)"] --> stop0
```

### 2.2 Activity Diagram - Admin

Alur: login → notifikasi pesanan baru → dashboard → kelola booking → produksi → pelanggan → user → paket → portofolio → audit log.

```mermaid
flowchart TD
    start((Mulai)) --> login["Admin: /masuk"]
    login --> auth["Backend: autentikasi Sanctum<br/>role=admin"]
    auth --> redirect["Sistem: redirect /admin"]
    redirect --> dash["Buka dashboard monitoring<br/>statistik, revenue, saldo & kas"]
    dash --> notify["Terima notifikasi pesanan baru<br/>(bell/toast + WhatsApp)"]
    notify --> bookingQ{"Kelola booking?"}
    bookingQ -- ya --> bookings["/admin/bookings<br/>filter/cari, ubah status, kategori, catatan,<br/>link Drive, preview, hapus"]
    bookings --> save["Backend: simpan perubahan<br/>catat audit log + notif status<br/>ke client (web + WhatsApp)"]
    save --> verify["Admin: verifikasi / cek pembayaran Midtrans"]
    verify --> prodQ{"Kelola produksi?"}
    bookingQ -- tidak --> prodQ
    prodQ -- ya --> prod["/admin/production<br/>kanban queued → transfer → culling →<br/>editing → review → revision → delivered"]
    prod --> preview["Unggah preview hasil & estimasi"]
    preview --> notif["Backend: simpan booking_progress<br/>notif progres ke client (web + WhatsApp)"]
    notif --> custQ{"Kelola pelanggan?"}
    prodQ -- tidak --> custQ
    custQ -- ya --> cust["/admin/customers<br/>lihat data pelanggan"]
    cust --> userQ{"Kelola user?"}
    custQ -- tidak --> userQ
    userQ -- ya --> users["/admin/users<br/>kelola user & role"]
    users --> pkgQ{"Kelola paket?"}
    userQ -- tidak --> pkgQ
    pkgQ -- ya --> pkgs["/admin/packages<br/>CRUD paket layanan"]
    pkgs --> portQ{"Kelola portofolio?"}
    pkgQ -- tidak --> portQ
    portQ -- ya --> ports["/admin/portfolios<br/>CRUD portofolio"]
    ports --> auditQ{"Lihat audit log?"}
    portQ -- tidak --> auditQ
    auditQ -- ya --> audit["/admin/audit-logs<br/>riwayat perubahan"]
    audit --> stop0((Selesai))
    auditQ -- tidak --> stop0
```

### 2.3 Activity Diagram - Worker Produksi

Alur: login → notifikasi pesanan baru → dashboard produksi → kanban → status booking → data pelanggan.

```mermaid
flowchart TD
    start((Mulai)) --> login["Worker: /masuk"]
    login --> auth["Backend: autentikasi Sanctum<br/>role=production"]
    auth --> redirect["Sistem: redirect /worker"]
    redirect --> dash["Buka dashboard produksi"]
    dash --> notify["Terima notifikasi pesanan baru<br/>(bell/toast + WhatsApp)"]
    notify --> prodQ{"Kelola produksi?"}
    prodQ -- ya --> kanban["/worker (kanban)<br/>lihat kartu per tahap"]
    kanban --> move["Pindahkan tahap<br/>queued → transfer → culling →<br/>editing → review → revision → delivered"]
    move --> preview["Unggah preview hasil & estimasi"]
    preview --> notif["Backend: simpan booking_progress<br/>notif progres ke client (web + WhatsApp)"]
    notif --> statusQ{"Kelola status booking?"}
    prodQ -- tidak --> statusQ
    statusQ -- ya --> status["/worker/bookings<br/>ubah status booking"]
    status --> save["Backend: simpan perubahan, catat log<br/>notif status ke client (web + WhatsApp)"]
    save --> custQ{"Lihat pelanggan?"}
    statusQ -- tidak --> custQ
    custQ -- ya --> cust["/worker/customers<br/>lihat data pelanggan"]
    cust --> stop0((Selesai))
    custQ -- tidak --> stop0
```

### 2.4 Overview Gabungan (Swimlane)

Alur web end-to-end semua aktor dalam satu diagram. Ini versi ringkas; untuk alur per aktor lihat 2.1–2.3.

```mermaid
flowchart TD
    start((Mulai)) --> online{"Perangkat online?"}
    online -- tidak --> offline["Sistem: tampilkan /offline<br/>tombol 'Coba Lagi'"] --> stop0((Selesai))
    online -- ya --> db{"API & database dapat diakses?"}
    db -- tidak --> dberr["Sistem: popup 'Koneksi Database Bermasalah'<br/>Tombol Tutup / Muat Ulang"] --> stop0
    db -- ya --> browse["Guest/Client: buka situs & jelajahi<br/>Home, Layanan, Portofolio/Kategori, Jadwal"]

    browse --> login{"Sudah login?"}
    login -- ya --> role{"Peran pengguna?"}
    role -- admin --> admin["Admin: /admin<br/>Monitoring, Booking, Produksi, Pelanggan,<br/>User, Paket, Portofolio, Audit Log<br/>+ notif pesanan baru (web + WhatsApp)"] --> stopA((Selesai))
    role -- production --> worker["Worker: /worker<br/>Produksi (kanban), Booking, Pelanggan<br/>+ notif pesanan baru (web + WhatsApp)"] --> stopW((Selesai))
    role -- client --> orders["Client: /pesanan<br/>progres produksi, notifikasi,<br/>rekomendasi paket, cek status,<br/>setujui / minta revisi"]

    login -- tidak --> auth["Guest/Client: /daftar, /masuk, /lupa-password"]
    auth --> otp["Backend: autentikasi + OTP WhatsApp<br/>via Fonnte"]
    otp --> role

    browse --> booking{"Ingin memesan sesi?"}
    orders --> booking
    booking -- tidak --> stopB((Selesai))
    booking -- ya --> book["Booking 5 langkah:<br/>kategori → paket → jadwal → data → konfirmasi"]
    book --> avail{"Slot tersedia?"}
    avail -- tidak --> full["Tampilkan 'slot penuh'"] --> stopB
    avail -- ya --> create["Backend: buat booking awaiting_payment<br/>kuota slot dikurangi"]
    create --> notifyNew["Backend: notif pesanan baru<br/>ke admin/staff (web + WhatsApp)"]
    notifyNew --> paypage["/pembayaran?booking=KODE<br/>rincian booking & total"]
    paypage --> cancel{"Batalkan pembayaran?"}
    cancel -- ya --> void["booking=cancelled<br/>kuota dikembalikan, catat log<br/>notif pembatalan ke client"] --> stopB
    cancel -- tidak --> charge["Klik 'Bayar Sekarang'<br/>→ Midtrans Snap"]
    charge --> mid["Midtrans: proses pembayaran"]
    mid --> sync["Backend: webhook ATAU tarik status"]
    sync --> sig{"Signature SHA512 valid?"}
    sig -- tidak --> reject["Tolak notifikasi (403)"] --> stopB
    sig -- ya --> success{"Pembayaran berhasil<br/>settlement/capture?"}
    success -- tidak --> failed["payment=rejected<br/>notif gagal ke client<br/>tampilkan pembayaran gagal"] --> stopB
    success -- ya --> paid["payment=verified; booking=paid<br/>notif pembayaran ke client (web + WhatsApp)"]

    paid --> prod["Admin/Worker: kelola kanban<br/>queued → transfer → culling → editing →<br/>review → revision → delivered<br/>unggah preview hasil"]
    prod --> notif["Backend: simpan booking_progress<br/>notif progres ke client (web + WhatsApp)"]
    notif --> review["Client: tinjau preview hasil"]
    review --> approve{"Setujui hasil?"}
    approve -- tidak --> revision["Minta revisi + catatan<br/>stage=revision, revision_count+1<br/>notif ke admin/worker (web + WhatsApp)"]
    revision --> prod
    approve -- ya --> approved["review_status=approved"]
    approved --> delivered["Admin/Worker: unggah link hasil (Drive)<br/>booking=completed"]
    delivered --> finish["Backend: production_stage=delivered<br/>catat kas masuk, notif 'Pesanan Selesai'<br/>+ rekomendasi paket (web + WhatsApp)"] --> stopB
```

---

## 3. Class Diagram

```mermaid
classDiagram
    class User {
        +bigint id
        +string name
        +string email
        +string phone
        +string role
        +isAdmin() bool
        +isProduction() bool
        +isStaff() bool
    }

    class Category {
        +bigint id
        +string name
        +string slug
        +string description
        +string image
        +bool is_active
    }

    class Package {
        +bigint id
        +bigint category_id
        +string name
        +string slug
        +decimal price
        +string duration
        +string photo_count
        +string unit
        +json features
        +bool is_popular
        +bool is_active
    }

    note for Package "is_popular dipertahankan untuk kompatibilitas backend, tetapi tidak lagi ditampilkan di UI (badge Populer dihapus)."

    class Portfolio {
        +bigint id
        +bigint category_id
        +bigint package_id
        +string title
        +string slug
        +string image
        +text description
        +date shoot_date
        +bool is_published
    }

    class Availability {
        +bigint id
        +date date
        +time time
        +int quota
        +int booked
        +bool is_open
    }

    class Booking {
        +bigint id
        +string booking_code
        +bigint user_id
        +bigint package_id
        +bigint availability_id
        +bigint assigned_to
        +string customer_name
        +string customer_email
        +string customer_phone
        +enum booking_category
        +string location
        +text notes
        +date booking_date
        +time booking_time
        +enum status
        +string production_stage
        +tinyint production_percent
        +date estimated_finish
        +timestamp production_started_at
        +timestamp production_finished_at
        +enum review_status
        +tinyint revision_count
        +decimal total_price
        +text admin_note
        +string drive_url
        +string preview_url
        +timestamp completed_at
        +timestamp cancelled_at
    }

    class BookingProgress {
        +bigint id
        +bigint booking_id
        +bigint user_id
        +string stage
        +enum status
        +text note
    }

    class PaymentMethod {
        +bigint id
        +string name
        +string code
        +enum group
        +string account_number
        +string account_name
        +text instructions
        +bool is_active
    }

    class Payment {
        +bigint id
        +bigint booking_id
        +bigint payment_method_id
        +decimal amount
        +enum type
        +string provider
        +string midtrans_order_id
        +string snap_token
        +text snap_url
        +string transaction_status
        +string fraud_status
        +json payload
        +string proof_path
        +enum status
        +timestamp paid_at
        +bigint verified_by
    }

    class CashTransaction {
        +bigint id
        +bigint booking_id
        +enum type
        +decimal amount
        +string description
        +timestamp occurred_at
        +recordForBooking()
        +reverseForBooking()
    }

    class RegistrationOtp {
        +bigint id
        +string email
        +string phone
        +string otp_hash
        +tinyint attempts
        +timestamp expires_at
        +timestamp used_at
        +isExpired() bool
        +isUsed() bool
    }

    class PasswordResetOtp {
        +bigint id
        +string email
        +string phone
        +string otp_hash
        +tinyint attempts
        +timestamp expires_at
        +timestamp used_at
        +isExpired() bool
        +isUsed() bool
    }

    class ContactMessage {
        +bigint id
        +string name
        +string email
        +string subject
        +text message
        +bool is_read
    }

    class Notification {
        +uuid id
        +string type
        +string notifiable_type
        +bigint notifiable_id
        +text data
        +timestamp read_at
    }

    class ActivityLog {
        +bigint id
        +bigint user_id
        +string action
        +text description
        +string model_type
        +bigint model_id
        +json meta
        +string ip_address
    }

    note for Notification "Notifikasi in-app (bell/toast/suara). WhatsApp via Fonnte untuk pesanan baru, perubahan status, progres produksi, dan rekomendasi paket."
    note "Rekomendasi paket dihitung dari riwayat booking/kategori/harga (GET /recommendations); tidak memiliki tabel khusus."

    User "1" --> "0..*" Booking : membuat
    User "1" --> "0..*" Booking : ditugaskan (assigned_to)
    User "1" --> "0..*" Payment : memverifikasi
    User "1" --> "0..*" Notification : menerima
    User "1" --> "0..*" ActivityLog : menghasilkan
    Category "1" --> "0..*" Package
    Category "1" --> "0..*" Portfolio
    Package "1" --> "0..*" Portfolio
    Package "1" --> "0..*" Booking : dipesan
    Availability "1" --> "0..*" Booking
    Booking "1" --> "0..*" Payment : memiliki
    PaymentMethod "1" --> "0..*" Payment
    Booking "1" --> "0..*" CashTransaction
    Booking "1" --> "0..*" BookingProgress : riwayat tahapan
    User "1" --> "0..*" BookingProgress : memperbarui
```

---

## 4. ERD (Entity Relationship Diagram)

Struktur mengikuti migrasi Laravel. Versi interaktif (dbdiagram.io): [`erd.dbml`](./erd.dbml).

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "membuat"
    USERS ||--o{ BOOKINGS : "ditugaskan (assigned_to)"
    USERS ||--o{ PAYMENTS : "memverifikasi"
    USERS ||--o{ ACTIVITY_LOGS : "menghasilkan"
    USERS ||--o{ NOTIFICATIONS : "menerima"
    USERS ||--o{ PERSONAL_ACCESS_TOKENS : "memiliki token"
    CATEGORIES ||--o{ PACKAGES : "menaungi"
    CATEGORIES ||--o{ PORTFOLIOS : "mengelompokkan"
    PACKAGES ||--o{ PORTFOLIOS : "terkait"
    PACKAGES ||--o{ BOOKINGS : "dipesan"
    AVAILABILITIES ||--o{ BOOKINGS : "menyediakan slot"
    BOOKINGS ||--o{ PAYMENTS : "memiliki"
    PAYMENT_METHODS ||--o{ PAYMENTS : "dipakai"
    BOOKINGS ||--o{ CASH_TRANSACTIONS : "menghasilkan kas"
    BOOKINGS ||--o{ BOOKING_PROGRESS : "memiliki riwayat tahapan"
    USERS ||--o{ BOOKING_PROGRESS : "memperbarui"

    USERS {
        bigint id PK
        string name
        string email UK
        string phone
        enum role "admin | production | client"
        timestamp created_at
    }
    CATEGORIES {
        bigint id PK
        string name
        string slug UK
        text description
        string image
        bool is_active
    }
    PACKAGES {
        bigint id PK
        bigint category_id FK
        string name
        string slug UK
        text description
        decimal price
        string duration
        string photo_count
        string unit
        json features
        bool is_popular
        bool is_active
    }
    PORTFOLIOS {
        bigint id PK
        bigint category_id FK
        bigint package_id FK
        string title
        string slug UK
        string image
        text description
        date shoot_date
        bool is_published
    }
    AVAILABILITIES {
        bigint id PK
        date date
        time time
        int quota
        int booked
        bool is_open
    }
    BOOKINGS {
        bigint id PK
        string booking_code UK
        bigint user_id FK
        bigint package_id FK
        bigint availability_id FK
        bigint assigned_to FK
        string customer_name
        string customer_email
        string customer_phone
        enum booking_category
        string location
        text notes
        text admin_note
        string drive_url
        string preview_url
        date booking_date
        time booking_time
        enum status
        string production_stage
        tinyint production_percent
        date estimated_finish
        timestamp production_started_at
        timestamp production_finished_at
        enum review_status
        tinyint revision_count
        decimal total_price
    }
    BOOKING_PROGRESS {
        bigint id PK
        bigint booking_id FK
        bigint user_id FK
        string stage
        enum status
        text note
        timestamp created_at
    }
    PAYMENT_METHODS {
        bigint id PK
        string name
        string code UK
        enum group
        string account_number
        string account_name
        text instructions
        bool is_active
    }
    PAYMENTS {
        bigint id PK
        bigint booking_id FK
        bigint payment_method_id FK
        decimal amount
        enum type
        string provider
        string midtrans_order_id
        string snap_token
        text snap_url
        string transaction_status
        string fraud_status
        json payload
        string proof_path
        enum status
        timestamp paid_at
        bigint verified_by FK
    }
    CASH_TRANSACTIONS {
        bigint id PK
        bigint booking_id FK
        enum type
        decimal amount
        string description
        timestamp occurred_at
    }
    NOTIFICATIONS {
        uuid id PK
        string type
        string notifiable_type
        bigint notifiable_id FK
        text data
        timestamp read_at
    }
    ACTIVITY_LOGS {
        bigint id PK
        bigint user_id FK
        string action
        text description
        string model_type
        bigint model_id
        json meta
        string ip_address
    }
    REGISTRATION_OTPS {
        bigint id PK
        string email
        string phone
        string otp_hash
        tinyint attempts
        timestamp expires_at
        timestamp used_at
    }
    PASSWORD_RESET_OTPS {
        bigint id PK
        string email
        string phone
        string otp_hash
        tinyint attempts
        timestamp expires_at
        timestamp used_at
    }
    CONTACT_MESSAGES {
        bigint id PK
        string name
        string email
        string subject
        text message
        bool is_read
    }
    PERSONAL_ACCESS_TOKENS {
        bigint id PK
        string tokenable_type
        bigint tokenable_id
        string name
        string token UK
        text abilities
        timestamp last_used_at
        timestamp expires_at
    }
```

> Catatan: kolom `PACKAGES.is_popular` tetap ada untuk kompatibilitas backend, tetapi sejak versi 0.1.7 tidak lagi digunakan/ditampilkan di UI. Kolom `BOOKINGS.booking_category` (`personal` | `event` | `corporate_umkm`, default `personal`) membagi pesanan menjadi Personal, Event, serta Corporate & UMKM; pelanggan memilihnya di langkah pertama booking dan admin dapat mengubahnya. Rekomendasi paket (`GET /recommendations`) bersifat turunan dan tidak memerlukan tabel baru. Notifikasi WhatsApp dikirim via Fonnte tanpa tabel terpisah.

---

## 5. State Diagram Status Booking

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> awaiting_payment
    awaiting_payment --> paid : pembayaran terverifikasi
    paid --> confirmed : admin konfirmasi
    confirmed --> ongoing : sesi berjalan
    ongoing --> completed : sesi selesai (+catat kas masuk, notif client)
    pending --> cancelled
    awaiting_payment --> cancelled
    paid --> cancelled : refund / chargeback
    confirmed --> cancelled
    ongoing --> cancelled
    completed --> [*]
    cancelled --> [*]
```

> Setiap perubahan status mengirim notifikasi ke pelanggan melalui web (bell/toast) dan WhatsApp (Fonnte).

---

## 6. State Diagram Status Pembayaran

```mermaid
stateDiagram-v2
    [*] --> pending : transaksi Midtrans dibuat
    pending --> verified : settlement / capture (accept)
    pending --> rejected : deny / cancel / expire / failure
    verified --> refunded : refund / chargeback
    verified --> [*]
    rejected --> [*]
    refunded --> [*]

    note right of verified
        Idempoten & anti-regresi:
        status verified tidak turun
        karena data basi/duplikat.
    end note

    note right of refunded
        Booking menjadi cancelled
        + koreksi saldo (expense).
    end note
```

---

## 7. Flowchart Alur Web (Navigasi, Booking, Pembayaran, Peran)

Alur navigasi web: halaman publik → booking/pembayaran → pesanan client, serta redirect berbasis peran ke dashboard admin atau produksi. Alur produksi internal dirinci pada Activity Diagram.

```mermaid
flowchart TD
    start((Mulai)) --> online{"Perangkat online?"}
    online -- tidak --> offline["/offline<br/>tombol 'Coba Lagi'"] --> stop0((Selesai))
    online -- ya --> db{"API & database OK?"}
    db -- tidak --> dberr["Popup 'Koneksi Database Bermasalah'<br/>Tutup / Muat Ulang"] --> stop0
    db -- ya --> home["Guest: buka /<br/>Home, /layanan, /kategori, /kategori/:slug"]

    home --> menu{"Pilih menu utama?"}

    menu -->|Booking| book["/booking<br/>kategori → paket → jadwal → data → konfirmasi"]
    book --> create["Buat booking awaiting_payment<br/>kuota dikurangi + notif pesanan baru<br/>ke admin/staff (web + WhatsApp)"]
    create --> pay["/pembayaran?booking=KODE"]
    pay --> cancel{"Batalkan pembayaran?"}
    cancel -- ya --> cancelled["booking=cancelled<br/>kuota dikembalikan<br/>notif pembatalan ke client"] --> stop0
    cancel -- tidak --> snap["Bayar via Midtrans Snap"]
    snap --> sync["Webhook / sync status"]
    sync --> paid{"Pembayaran berhasil?"}
    paid -- tidak --> failed["Gagal / pending<br/>notif gagal ke client"] --> stop0
    paid -- ya --> orders["Client: /pesanan<br/>progres produksi, notifikasi,<br/>rekomendasi paket"]
    orders --> review{"Ada preview hasil?"}
    review -- ya --> decide["Setujui hasil / minta revisi<br/>notif ke admin/worker"] --> stop0
    review -- tidak --> stop0

    menu -->|Pesanan Saya| ordersAuth{"Sudah login?"}
    ordersAuth -- tidak --> login["/masuk"] --> orders
    ordersAuth -- ya --> orders

    menu -->|Akun| auth["/daftar (OTP WhatsApp), /masuk, /lupa-password"]
    auth --> role{"Peran pengguna?"}
    role -->|admin| admin["/admin<br/>Monitoring, Booking, Produksi, Pelanggan,<br/>User, Paket, Portofolio, Audit Log<br/>+ notif pesanan baru"] --> stop0
    role -->|production| worker["/worker<br/>Produksi, Booking, Pelanggan<br/>+ notif pesanan baru"] --> stop0
    role -->|client| client["/ atau /pesanan"] --> stop0

    menu -->|Jelajah| explore["Lihat paket & FAQ,<br/>portofolio filter kategori/tanggal, detail karya"] --> stop0
```

---

## 8. Flowchart Penanganan Gagal Database

Alur ketika frontend gagal mengakses API/database. Berlaku untuk seluruh dashboard admin, produksi, dan halaman publik yang memuat data.

```mermaid
flowchart TD
    start((Mulai)) --> request["Frontend meminta data ke API"]
    request --> result{"Respons berhasil?"}
    result -->|ya| render["Tampilkan data"]
    result -->|tidak| type{"Jenis kegagalan?"}
    type -->|"HTTP 5xx"| db["Database/backend bermasalah"]
    type -->|"Koneksi gagal"| net["Backend tidak dapat dihubungi"]
    db --> popup["Tampilkan popup<br/>'Koneksi Database Bermasalah'"]
    net --> popup
    popup --> action{"Pilihan pengguna"}
    action -->|"Tutup"| fallback["Tampilkan data fallback / empty state<br/>'Data tidak tersedia'"]
    action -->|"Muat Ulang"| reload["Muat ulang halaman"]
    reload --> request
    fallback --> stop((Selesai))
    render --> stop
```

Catatan implementasi:
- Event global `inheartz:db-error` dikirim oleh `services/http.js` saat HTTP 5xx atau koneksi gagal.
- Komponen `components/DatabaseAlert.jsx` menampilkan popup dengan tombol **Tutup** dan **Muat Ulang**.
- Service tetap memakai fallback `data/store.js` / `data/mock.js`, dan halaman menampilkan empty state bila data kosong.

---

## 9. HIPO - Hierarchy Chart

Hierarchy Chart (H Chart) menunjukkan dekomposisi modul sistem dari level tertinggi ke submodul. Versi PlantUML: [`hipo-hierarchy.puml`](./hipo-hierarchy.puml).

```mermaid
flowchart TD
    ROOT["Inheartz Studio<br/>(Sistem Web)"]

    ROOT --> M1["1. Modul Publik"]
    ROOT --> M2["2. Modul Akun & Autentikasi"]
    ROOT --> M3["3. Modul Booking"]
    ROOT --> M4["4. Modul Pembayaran & Kas"]
    ROOT --> M5["5. Modul Produksi"]
    ROOT --> M6["6. Modul Pesanan & Review"]
    ROOT --> M7["7. Modul Notifikasi & Rekomendasi"]
    ROOT --> M8["8. Modul Dashboard Admin"]
    ROOT --> M9["9. Modul Dashboard Produksi"]
    ROOT --> M10["10. Modul Infrastruktur & Ketahanan"]

    M1 --> M1a["1.1 Beranda & Hero"]
    M1 --> M1b["1.2 Layanan / Paket & FAQ"]
    M1 --> M1c["1.3 Portofolio & Kategori"]
    M1 --> M1d["1.4 Jadwal & Ketersediaan"]

    M2 --> M2a["2.1 Login"]
    M2 --> M2b["2.2 Daftar Akun + OTP WhatsApp"]
    M2 --> M2c["2.3 Lupa Password + OTP WhatsApp"]
    M2 --> M2d["2.4 Profil & Logout"]
    M2 --> M2e["2.5 RBAC & Proteksi Rute"]

    M3 --> M3a["3.1 Pilih Kategori Booking"]
    M3 --> M3b["3.2 Pilih Paket"]
    M3 --> M3c["3.3 Kalender & Slot Jam"]
    M3 --> M3d["3.4 Data Pemesan"]
    M3 --> M3e["3.5 Konfirmasi & Buat Booking"]
    M3 --> M3f["3.6 Batalkan Booking"]

    M4 --> M4a["4.1 Tagihan Menunggu Pembayaran"]
    M4 --> M4b["4.2 Midtrans Snap"]
    M4 --> M4c["4.3 Webhook / Sync / Rekonsiliasi"]
    M4 --> M4d["4.4 Cek Status Pembayaran"]
    M4 --> M4e["4.5 Ledger Kas (Income / Expense)"]

    M5 --> M5a["5.1 Papan Kanban"]
    M5 --> M5b["5.2 Update Tahapan & Persentase"]
    M5 --> M5c["5.3 Estimasi Selesai"]
    M5 --> M5d["5.4 Preview Hasil"]
    M5 --> M5e["5.5 Riwayat Progres"]

    M6 --> M6a["6.1 Progress Pesanan"]
    M6 --> M6b["6.2 Setujui Hasil"]
    M6 --> M6c["6.3 Minta Revisi"]
    M6 --> M6d["6.4 Hasil Akhir (Google Drive)"]

    M7 --> M7a["7.1 Notifikasi In-App (Bell / Toast / Suara)"]
    M7 --> M7b["7.2 Notifikasi WhatsApp (Fonnte)"]
    M7 --> M7c["7.3 Rekomendasi Paket"]

    M8 --> M8a["8.1 Monitoring & Statistik"]
    M8 --> M8b["8.2 Finance / Saldo"]
    M8 --> M8c["8.3 Booking"]
    M8 --> M8d["8.4 Pelanggan"]
    M8 --> M8e["8.5 User & Role"]
    M8 --> M8f["8.6 Paket"]
    M8 --> M8g["8.7 Portofolio"]
    M8 --> M8h["8.8 Audit Log"]

    M9 --> M9a["9.1 Kanban Produksi"]
    M9 --> M9b["9.2 Booking (Ubah Status)"]
    M9 --> M9c["9.3 Pelanggan"]

    M10 --> M10a["10.1 Offline Gate"]
    M10 --> M10b["10.2 Database Alert"]
    M10 --> M10c["10.3 Polling & Sinkronisasi"]
    M10 --> M10d["10.4 Fallback Mock / Local Store"]
```

---

## 10. HIPO - Input / Process / Output (IPO)

IPO Chart memisahkan **Input → Process → Output** untuk setiap modul. Versi PlantUML: [`hipo-ipo.puml`](./hipo-ipo.puml).

```mermaid
flowchart TB
    subgraph M1["1. Modul Publik"]
        direction LR
        I1["INPUT<br/>Konten paket, kategori,<br/>portofolio, FAQ<br/>Tanggal pencarian jadwal"] --> P1["PROCESS<br/>Render katalog & hero<br/>Filter kategori / tanggal<br/>Cek ketersediaan slot"] --> O1["OUTPUT<br/>Halaman publik<br/>Daftar paket & galeri<br/>Slot jadwal tersedia"]
    end

    subgraph M2["2. Modul Akun & Autentikasi"]
        direction LR
        I2["INPUT<br/>Nama, email, password<br/>Nomor WhatsApp<br/>Kode OTP"] --> P2["PROCESS<br/>Validasi kredensial<br/>Kirim / verifikasi OTP via Fonnte<br/>Buat sesi token & cek role"] --> O2["OUTPUT<br/>Token Sanctum<br/>Sesi login<br/>Redirect sesuai peran<br/>Akun client baru"]
    end

    subgraph M3["3. Modul Booking"]
        direction LR
        I3["INPUT<br/>Kategori booking<br/>Paket, tanggal, jam<br/>Data pemesan<br/>Kuota slot"] --> P3["PROCESS<br/>Validasi kategori & kuota<br/>Buat booking awaiting_payment<br/>Kurangi kuota slot"] --> O3["OUTPUT<br/>Kode booking + kategori<br/>Status awaiting_payment<br/>Tagihan pembayaran<br/>Notif pesanan baru"]
    end

    subgraph M4["4. Modul Pembayaran & Kas"]
        direction LR
        I4["INPUT<br/>Booking ID & nominal<br/>Transaksi Midtrans<br/>Webhook & signature<br/>Status order"] --> P4["PROCESS<br/>Charge Midtrans Snap<br/>Verifikasi signature SHA512<br/>Sync / rekonsiliasi status<br/>Idempoten & anti-regresi"] --> O4["OUTPUT<br/>Payment verified / rejected / refunded<br/>Booking paid / cancelled<br/>Kas income / expense<br/>Notif pembayaran"]
    end

    subgraph M5["5. Modul Produksi"]
        direction LR
        I5["INPUT<br/>Booking berstatus paid<br/>Tahapan & catatan<br/>Estimasi selesai<br/>Preview URL"] --> P5["PROCESS<br/>Update stage / progress<br/>Hitung persentase<br/>Simpan riwayat booking_progress"] --> O5["OUTPUT<br/>Kanban ter-update<br/>Riwayat progres<br/>Notif progres ke client"]
    end

    subgraph M6["6. Modul Pesanan & Review"]
        direction LR
        I6["INPUT<br/>User login & daftar booking<br/>Preview hasil<br/>Keputusan review<br/>Catatan revisi"] --> P6["PROCESS<br/>Tampilkan progress<br/>Setujui hasil / minta revisi<br/>Hitung revision_count<br/>Pindah stage revisi"] --> O6["OUTPUT<br/>review_status approved / revision<br/>Notif ke admin/worker<br/>Progress & hasil akhir"]
    end

    subgraph M7["7. Modul Notifikasi & Rekomendasi"]
        direction LR
        I7["INPUT<br/>Event pesanan / status / progres<br/>Riwayat booking, kategori, harga"] --> P7["PROCESS<br/>Buat notifikasi in-app<br/>Kirim WhatsApp via Fonnte<br/>Hitung rekomendasi paket"] --> O7["OUTPUT<br/>Bell / toast / suara<br/>Pesan WhatsApp<br/>Daftar rekomendasi di /pesanan"]
    end

    subgraph M8["8. Modul Dashboard Admin"]
        direction LR
        I8["INPUT<br/>Data booking & pembayaran<br/>Data user, paket, portofolio<br/>Audit trail"] --> P8["PROCESS<br/>Agregasi statistik & saldo<br/>Filter / cari<br/>CRUD & verifikasi pembayaran<br/>Catat audit log"] --> O8["OUTPUT<br/>Monitoring & grafik<br/>Saldo / kas studio<br/>Tabel kelola & audit log"]
    end

    subgraph M9["9. Modul Dashboard Produksi"]
        direction LR
        I9["INPUT<br/>Antrean produksi<br/>Data booking<br/>Data pelanggan<br/>Role production"] --> P9["PROCESS<br/>Drag & drop tahapan<br/>Ubah status booking<br/>Lihat data pelanggan"] --> O9["OUTPUT<br/>Progres ter-update<br/>Status tersinkron ke admin<br/>Notif perubahan ke client"]
    end

    subgraph M10["10. Modul Infrastruktur & Ketahanan"]
        direction LR
        I10["INPUT<br/>Status online perangkat<br/>Respons API / database<br/>Event error"] --> P10["PROCESS<br/>Deteksi offline<br/>Tangkap HTTP 5xx / koneksi gagal<br/>Fallback mock & polling"] --> O10["OUTPUT<br/>Halaman /offline<br/>Popup database<br/>Empty state & data tersinkron"]
    end
```

---

## Berkas Sumber

| Diagram | Berkas sumber | Format / Cara render |
| --- | --- | --- |
| Use Case | [`usecase.puml`](./usecase.puml) | PlantUML — <https://www.plantuml.com/plantuml/uml> |
| Activity (overview) | [`activity.puml`](./activity.puml) | PlantUML |
| Activity Guest/Client | [`activity-client.puml`](./activity-client.puml) | PlantUML |
| Activity Admin | [`activity-admin.puml`](./activity-admin.puml) | PlantUML |
| Activity Worker | [`activity-worker.puml`](./activity-worker.puml) | PlantUML |
| Class | [`class.puml`](./class.puml) | PlantUML |
| Flowchart | [`flowchart.puml`](./flowchart.puml) | PlantUML |
| ERD | [`erd.dbml`](./erd.dbml) | dbdiagram.io — **Import → DBML** |
| HIPO Hierarchy | [`hipo-hierarchy.puml`](./hipo-hierarchy.puml) | PlantUML |
| HIPO IPO | [`hipo-ipo.puml`](./hipo-ipo.puml) | PlantUML |
| EERD (Mermaid) | [`../eerd.md`](../eerd.md) | Mermaid |

Petunjuk render lengkap: [README.md](./README.md). Dokumen terkait: [../prd.md](../prd.md).
