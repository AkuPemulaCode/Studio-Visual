export const packages = [
  {
    id: 1,
    slug: "product-photography",
    name: "Product Photography",
    category: "produk",
    price: 499000,
    duration: "2 Jam",
    photos: "20 Foto Edit",
    unit: "sesi",
    description:
      "Sesi foto produk untuk katalog, marketplace, dan kebutuhan komersial dengan pencahayaan studio.",
    features: [
      "Studio & lighting profesional",
      "20 foto final retouch",
      "Konsep styling sesuai brief",
      "Background putih & kreatif",
      "File resolusi tinggi",
    ],
  },
  {
    id: 2,
    slug: "pre-wedding",
    name: "Pre-Wedding Session",
    category: "prewedding",
    price: 1899000,
    duration: "6 Jam",
    photos: "60 Foto Edit",
    unit: "sesi",
    description:
      "Paket pre-wedding indoor maupun outdoor dengan pendekatan cinematic dan storytelling.",
    features: [
      "2 lokasi pemotretan",
      "60 foto final retouch",
      "Directing & konsep oleh tim",
      "Makeup artist pendamping",
      "Album digital premium",
    ],
  },
  {
    id: 3,
    slug: "personal-portrait",
    name: "Personal Portrait",
    category: "portrait",
    price: 566000,
    duration: "1.5 Jam",
    photos: "15 Foto Edit",
    unit: "sesi",
    description:
      "Potret personal, headshot profesional, dan konten personal branding dengan gaya modern.",
    features: [
      "Konsultasi wardrobe",
      "15 foto final retouch",
      "Variasi background studio",
      "Cocok untuk LinkedIn & CV",
      "File siap unggah",
    ],
  },
  {
    id: 4,
    slug: "commercial-event",
    name: "Commercial Event",
    category: "event",
    price: 1299000,
    duration: "8 Jam",
    photos: "100+ Foto",
    unit: "acara",
    description:
      "Dokumentasi acara perusahaan, seminar, launching produk, dan gathering tim.",
    features: [
      "Tim 2 fotografer",
      "Dokumentasi penuh acara",
      "Same day editing pilihan",
      "Galeri online privat",
      "Liputan video highlight",
    ],
  },
  {
    id: 5,
    slug: "social-media-content",
    name: "Social Media Content",
    category: "konten",
    price: 899000,
    duration: "4 Jam",
    photos: "10 Foto + 3 Video Reels",
    unit: "paket",
    description:
      "Paket konten siap posting untuk Instagram dan TikTok, dari foto estetik hingga video reels.",
    features: [
      "10 foto feed estetik",
      "3 video reels vertikal",
      "Editing color grading",
      "Caption & copywriting",
      "Scheduling konten",
    ],
  },
  {
    id: 6,
    slug: "graphic-design",
    name: "Graphic Design",
    category: "desain",
    price: 749000,
    duration: "5 Hari Kerja",
    photos: "Logo + Brand Kit",
    unit: "proyek",
    description:
      "Perancangan identitas visual brand, mulai dari logo, palet warna, tipografi, hingga brand guideline siap pakai.",
    features: [
      "Konsep & moodboard",
      "Logo primer & sekunder",
      "Palet warna & tipografi",
      "Brand guideline PDF",
      "File sumber siap cetak",
    ],
  },
  {
    id: 7,
    slug: "social-media-design",
    name: "Social Media Design",
    category: "desain",
    price: 499000,
    duration: "3 Hari Kerja",
    photos: "10 Feed + 5 Story",
    unit: "paket",
    description:
      "Desain konten feed dan story yang konsisten dengan identitas brand untuk kebutuhan Instagram dan TikTok.",
    features: [
      "10 desain feed",
      "5 desain story",
      "Template editable",
      "Konsultasi visual brand",
      "File resolusi tinggi",
    ],
  },
  {
    id: 8,
    slug: "video-editing",
    name: "Video Editing",
    category: "video",
    price: 1299000,
    duration: "5 Hari Kerja",
    photos: "1 Video 1-3 Menit",
    unit: "proyek",
    description:
      "Editing video profesional dengan color grading, motion graphic, dan sound design untuk kebutuhan komersial maupun personal.",
    features: [
      "Cutting & storytelling",
      "Color grading sinematik",
      "Motion graphic & subtitle",
      "Sound design & mixing",
      "2x revisi",
    ],
  },
  {
    id: 9,
    slug: "short-video-reels",
    name: "Short Video & Reels",
    category: "video",
    price: 649000,
    duration: "3 Hari Kerja",
    photos: "5 Video Reels",
    unit: "paket",
    description:
      "Editing video pendek vertikal siap posting untuk Reels, TikTok, dan Shorts dengan hook yang menarik.",
    features: [
      "5 video vertikal",
      "Caption & subtitle otomatis",
      "Trending audio & effects",
      "Optimasi hook 3 detik",
      "Format siap unggah",
    ],
  },
];

export const packageSegments = {
  "product-photography": ["umkm", "corporate"],
  "pre-wedding": ["personal"],
  "personal-portrait": ["personal"],
  "commercial-event": ["event", "corporate"],
  "social-media-content": ["umkm"],
  "graphic-design": ["umkm", "corporate"],
  "social-media-design": ["umkm"],
  "video-editing": ["corporate", "personal"],
  "short-video-reels": ["umkm", "personal"],
};

export const categories = [
  {
    id: 1,
    slug: "produk",
    title: "PRODUCT",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    slug: "prewedding",
    title: "PRE-WEDDING",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    slug: "portrait",
    title: "PORTRAIT",
    image:
      "https://images.unsplash.com/photo-1554046920-90dc5f3ac6ed?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 4,
    slug: "event",
    title: "EVENT",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 5,
    slug: "desain",
    title: "DESIGN",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 6,
    slug: "video",
    title: "VIDEO",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop",
  },
];

export const portfolios = [
  {
    id: 1,
    title: "Katalog Fashion Minimalist",
    date: "2026-07-20",
    category: "produk",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    description:
      "Sesi pemotretan produk jam tangan untuk brand fashion lokal dengan konsep minimalis dan dominasi warna putih abu-abu.",
  },
  {
    id: 2,
    title: "Cinematic Outdoor R&D",
    date: "2026-07-15",
    category: "prewedding",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    description:
      "Sesi pre-wedding bertema petualangan cinematic yang dilakukan di luar ruangan dengan memanfaatkan cahaya natural matahari terbenam.",
  },
  {
    id: 3,
    title: "Neon Studio Portrait",
    date: "2026-06-10",
    category: "portrait",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    description:
      "Eksplorasi potret personal menggunakan pencahayaan studio kreatif dengan perpaduan gel warna biru dan ungu.",
  },
  {
    id: 4,
    title: "Komersial Kuliner",
    date: "2026-05-22",
    category: "produk",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    description:
      "Foto komersial untuk buku menu restoran kelas atas, menonjolkan detail tekstur makanan dan tata letak meja yang elegan.",
  },
  {
    id: 5,
    title: "Classic Elegance Pre-Wed",
    date: "2026-07-25",
    category: "prewedding",
    img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
    description:
      "Konsep pre-wedding klasik dan elegan di dalam ruangan bergaya Eropa klasik.",
  },
  {
    id: 6,
    title: "Corporate Headshot",
    date: "2026-04-18",
    category: "portrait",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    description:
      "Pemotretan profil profesional untuk jajaran direksi perusahaan startup teknologi dengan latar belakang netral.",
  },
  {
    id: 7,
    title: "Product Launch Coverage",
    date: "2026-07-28",
    category: "event",
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
    description:
      "Dokumentasi peluncuran produk teknologi dengan liputan panggung, booth, dan suasana pengunjung.",
  },
];

export const paymentMethods = [
  {
    id: "bank-transfer",
    label: "Transfer Bank",
    group: "bank",
    detail: "BCA 1234567890 a/n Inheartz Studio",
  },
  {
    id: "virtual-account",
    label: "Virtual Account",
    group: "va",
    detail: "Nomor VA dibuat otomatis setelah konfirmasi",
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    group: "ewallet",
    detail: "GoPay / OVO / DANA / ShopeePay",
  },
  {
    id: "qris",
    label: "QRIS",
    group: "qris",
    detail: "Scan QRIS dari aplikasi apa pun",
  },
];

export const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export const monitoring = {
  summary: {
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  },
  bookings: [],
  revenue: [],
};
