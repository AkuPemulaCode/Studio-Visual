# Diagrams - Inheartz Studio

Kumpulan source code diagram (UML, ERD & HIPO) untuk dokumentasi sistem Inheartz Studio.

> **Versi Dokumen: 0.1.8**
>
> **Lihat semua diagram langsung dalam Markdown:** [DIAGRAM.md](./DIAGRAM.md) (format Mermaid, render otomatis di GitHub/VS Code).

| File | Jenis | Tool / Cara render |
| --- | --- | --- |
| `DIAGRAM.md` | Semua diagram dalam **Mermaid** | Markdown viewer (GitHub/VS Code) |
| `usecase.puml` | UML Use Case Diagram | PlantUML |
| `class.puml` | UML Class Diagram (domain) | PlantUML |
| `activity.puml` | Activity Diagram overview gabungan semua aktor (swimlane) | PlantUML |
| `activity-client.puml` | Activity Diagram Guest/Client (publik → auth/OTP → booking → Midtrans → pesanan/review → notifikasi & rekomendasi) | PlantUML |
| `activity-admin.puml` | Activity Diagram Admin (login → notifikasi → dashboard → booking/produksi/pelanggan/user/paket/portofolio/audit) | PlantUML |
| `activity-worker.puml` | Activity Diagram Worker Produksi (login → notifikasi → kanban → status booking → pelanggan) | PlantUML |
| `flowchart.puml` | Flowchart alur web (navigasi rute publik, booking/pembayaran, redirect peran admin/produksi, notifikasi) | PlantUML |
| `hipo-hierarchy.puml` | **HIPO - Hierarchy Chart** (dekomposisi modul sistem) | PlantUML |
| `hipo-ipo.puml` | **HIPO - Input / Process / Output** per modul | PlantUML |
| `hipo-sederhana.md` | **HIPO sederhana** (hierarki + IPO ringkas, siap tempel ke Bab 2) | Markdown (Mermaid) |
| `hipo-sederhana-hierarchy.puml` | **HIPO sederhana** - Hierarchy Chart | PlantUML |
| `hipo-sederhana-ipo.puml` | **HIPO sederhana** - Input / Process / Output (Modul Booking) | PlantUML |
| `erd.dbml` | Entity Relationship Diagram | **dbdiagram.io** (DBML) |

## Cara Render

### PlantUML (`.puml`)
Pilih salah satu:
- **Online**: buka <https://www.plantuml.com/plantuml/uml>, tempel isi file.
- **VS Code**: ekstensi **PlantUML** (`jebbs.plantuml`) → buka `.puml` → `Alt+D` untuk preview.
- **CLI** (butuh Java + `plantuml.jar`): `java -jar plantuml.jar diagrams/usecase.puml`

### ERD dbdiagram.io (`.dbml`)
1. Buka <https://dbdiagram.io/d>.
2. Menu **Import → DBML** (atau tempel isi `erd.dbml` pada editor kiri).
3. Diagram akan muncul otomatis; bisa **Export** ke PNG/PDF.

## Catatan
- Struktur ERD mengikuti migrasi Laravel di `be_photograph/database/migrations`.
- Skema database (EERD, Mermaid) juga ada di [../eerd.md](../eerd.md).
- HIPO dipisah menjadi dua diagram: **Hierarchy Chart** (`hipo-hierarchy.puml`) dan **Input/Process/Output** (`hipo-ipo.puml`).
- Fitur v0.1.8 yang tercermin di diagram: notifikasi WhatsApp (pesanan baru, perubahan status, progres produksi, rekomendasi paket) dan sistem rekomendasi paket (`GET /recommendations`).
- PRD terkait: [../prd.md](../prd.md).
