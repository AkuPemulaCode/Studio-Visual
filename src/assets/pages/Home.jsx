import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import packageService from "../services/packageService";
import portfolioService from "../services/portfolioService";
import Reveal from "../components/Reveal";
import { packages as mockPackages, categories as mockCategories } from "../data/mock";
import { formatIDR, formatShortDate } from "../utils/format";

const heroSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=2070&auto=format&fit=crop",
    eyebrow: "Creative Media Studio",
    title: "VISUALLY CRAFTED.",
    link: "/booking",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop",
    eyebrow: "Product & Commercial",
    title: "THE SEED SERIES.",
    link: "/layanan",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
    eyebrow: "Pre-Wedding & Portrait",
    title: "MADE TO MOVE WITH YOU.",
    link: "/booking",
  },
];

const steps = [
  {
    no: "01",
    title: "Pilih Paket",
    text: "Tentukan paket layanan yang paling sesuai dengan kebutuhan Anda.",
  },
  {
    no: "02",
    title: "Atur Jadwal",
    text: "Pilih tanggal dan jam sesi melalui kalender booking kami.",
  },
  {
    no: "03",
    title: "Lakukan Pembayaran",
    text: "Bayar DP atau lunas melalui transfer, VA, e-wallet, atau QRIS.",
  },
  {
    no: "04",
    title: "Terima Hasil",
    text: "Sesi berlangsung, hasil edit dikirim melalui galeri digital.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [services, setServices] = useState(mockPackages.slice(0, 4));
  const [cats, setCats] = useState(mockCategories);
  const [works, setWorks] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      packageService.list(),
      packageService.categories(),
      portfolioService.list(),
    ]).then(([packageList, categoryList, portfolioList]) => {
      if (!active) return;
      setServices(packageList.slice(0, 4));
      setCats(categoryList);
      setWorks(portfolioList.slice(0, 4));
    });
    return () => {
      active = false;
    };
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="relative h-[78vh] w-full overflow-hidden bg-black group">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover opacity-60 animate-kenburns"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center px-4 max-w-screen-md mx-auto">
                  <p className="mb-4 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/70">
                    {slide.eyebrow}
                  </p>
                  <h1 className="font-display mb-8 text-4xl md:text-7xl font-extrabold tracking-tighter leading-none text-white uppercase drop-shadow-xl">
                    {slide.title}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-3 pointer-events-auto">
                    <Link to={slide.link} className="btn-light">
                      Booking Sekarang
                    </Link>
                    <Link
                      to="/layanan"
                      className="inline-flex items-center justify-center gap-2 border border-white/70 text-white px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors hover:bg-white hover:text-gray-900"
                    >
                      Lihat Layanan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          aria-label="Slide sebelumnya"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          aria-label="Slide berikutnya"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ke slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === idx
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="border-b border-gray-300 bg-white">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-center items-start">
            <p className="eyebrow mb-3">Layanan Kami</p>
            <h2 className="section-title mb-4">
              Paket
              <br />
              Kreatif
            </h2>
            <Link
              to="/layanan"
              className="text-sm font-bold uppercase underline underline-offset-4 hover:text-gray-500 transition-colors"
            >
              Semua Paket
            </Link>
          </div>

          <Reveal className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 divide-gray-300 sm:divide-x border-gray-300">
            {services.map((item) => (
              <Link
                key={item.id}
                to={`/layanan#${item.slug}`}
                className="group p-6 flex flex-col justify-between min-h-[240px] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{item.category}</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-gray-900 leading-tight mb-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {item.duration} · {item.photos}
                  </p>
                  <p className="font-extrabold text-lg">{formatIDR(item.price)}</p>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-gray-300 bg-gray-50">
        <div className="container-editorial py-14 md:py-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Cara Kerja</p>
              <h2 className="section-title">Alur Pemesanan</h2>
            </div>
            <Link to="/booking" className="btn-primary self-start">
              Mulai Booking
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-gray-200 bg-white divide-y sm:divide-y-0 divide-gray-200 sm:divide-x">
            {steps.map((step) => (
              <div key={step.no} className="p-8">
                <span className="font-display text-5xl font-extrabold text-gray-200">
                  {step.no}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-b border-gray-300 bg-white">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-center items-start">
            <p className="eyebrow mb-3">Portofolio</p>
            <h2 className="section-title mb-4">
              Selected
              <br />
              Works
            </h2>
            <Link
              to="/kategori"
              className="text-sm font-bold uppercase underline underline-offset-4 hover:text-gray-500 transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          <Reveal className="w-full md:w-3/4 flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar">
            {works.map((item) => (
              <Link
                key={item.id}
                to="/kategori"
                className="min-w-[280px] md:min-w-[350px] flex-shrink-0 snap-start border-r border-gray-300 p-6 group"
              >
                <div className="relative overflow-hidden mb-6 bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-center py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest text-xs font-bold">
                    Lihat Detail
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatShortDate(item.date)}
                </p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="flex flex-col md:flex-row border-b border-gray-300 bg-white">
        <div className="w-full md:w-1/4 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-center">
          <p className="eyebrow mb-3">Spesialisasi</p>
          <h2 className="section-title">Categories</h2>
        </div>

        <Reveal className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-300 border-gray-300">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              to={`/kategori/${cat.slug}`}
              className="relative group block h-[280px] md:h-[460px] overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-widest uppercase">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </Reveal>
      </section>

      <section className="bg-gray-900 text-white">
        <Reveal className="container-editorial py-16 md:py-24 text-center">
          <p className="eyebrow mb-4 text-gray-400">Siap Memulai?</p>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase tracking-tighter leading-none">
            Wujudkan Visual
            <br />
            Terbaik Anda
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm md:text-base text-gray-300 leading-relaxed">
            Jadwalkan sesi Anda hari ini dan biarkan tim Inheartz Studio
            menghadirkan konten visual yang berkesan untuk brand Anda.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/booking" className="btn-light">
              Booking Jadwal
            </Link>
            <Link
              to="/layanan"
              className="inline-flex items-center justify-center gap-2 border border-white/60 text-white px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors hover:bg-white hover:text-gray-900"
            >
              Lihat Paket
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
