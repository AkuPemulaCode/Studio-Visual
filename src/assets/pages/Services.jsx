import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import packageService from "../services/packageService";
import Reveal from "../components/Reveal";
import { packages as mockPackages } from "../data/mock";
import { formatIDR } from "../utils/format";

const faqs = [
  {
    q: "Berapa lama proses pengerjaan hasil edit?",
    a: "Rata-rata 3 sampai 7 hari kerja setelah sesi, tergantung paket dan jumlah foto. Paket prioritas dapat diproses lebih cepat.",
  },
  {
    q: "Apakah bisa melakukan reschedule?",
    a: "Bisa. Reschedule dapat dilakukan maksimal 2 hari sebelum jadwal selama slot tersedia, tanpa biaya tambahan.",
  },
  {
    q: "Bagaimana sistem pembayarannya?",
    a: "Anda dapat membayar DP 50% untuk mengunci jadwal, lalu pelunasan dilakukan sebelum atau saat hari sesi.",
  },
  {
    q: "Apakah menyediakan layanan di luar kota?",
    a: "Ya. Untuk lokasi di luar kota akan ditambahkan biaya akomodasi dan transportasi sesuai jarak tempuh tim.",
  },
];

export default function Services() {
  const [packages, setPackages] = useState(mockPackages);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    packageService.list().then((list) => {
      if (active) setPackages(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="relative h-[300px] md:h-[380px] bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop"
          alt="Layanan Inheartz Studio"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-screen-xl mx-auto w-full">
          <p className="text-white/70 text-xs md:text-sm tracking-widest mb-2 uppercase font-medium">
            Home / Layanan
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-extrabold uppercase tracking-tighter">
            Paket & Harga
          </h1>
        </div>
      </section>

      <section className="container-editorial py-14 md:py-20">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-3">Informasi Paket</p>
          <h2 className="section-title">Layanan Media Kreatif</h2>
          <p className="mt-4 text-sm md:text-base text-gray-500 leading-relaxed">
            Pilih paket yang paling sesuai dengan kebutuhan Anda. Semua paket
            sudah termasuk konsultasi konsep, pengarahan sesi, dan hasil edit
            profesional.
          </p>
        </div>

        <Reveal className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map((item) => (
            <article
              key={item.id}
              id={item.slug}
              className="card flex flex-col p-8 scroll-mt-28"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="eyebrow">{item.category}</span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight leading-tight">
                {item.name}
              </h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-6 flex items-end gap-2 border-y border-gray-200 py-5">
                <span className="font-display text-3xl font-extrabold">
                  {formatIDR(item.price)}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest pb-1">
                  / {item.unit}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <dt className="uppercase tracking-widest text-gray-400">Durasi</dt>
                  <dd className="mt-1 font-bold text-gray-900">{item.duration}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest text-gray-400">Hasil</dt>
                  <dd className="mt-1 font-bold text-gray-900">{item.photos}</dd>
                </div>
              </dl>

              <ul className="mt-5 space-y-3 text-sm text-gray-600 flex-1">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(`/booking?paket=${item.slug}`)}
                className="btn-outline mt-8"
              >
                Pilih Paket
              </button>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="border-y border-gray-300 bg-gray-50">
        <div className="container-editorial py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div>
              <p className="eyebrow mb-3">FAQ</p>
              <h2 className="section-title">Pertanyaan Umum</h2>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                Belum menemukan jawaban? Hubungi tim kami melalui halaman kontak
                atau saat proses booking.
              </p>
              <Link to="/booking" className="btn-primary mt-6">
                Booking Sekarang
              </Link>
            </div>

            <div className="lg:col-span-2 divide-y divide-gray-200 border-t border-gray-200">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-display text-base md:text-lg font-bold text-gray-900">
                      {faq.q}
                    </span>
                    <span className="text-2xl leading-none text-gray-400 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-2xl">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
