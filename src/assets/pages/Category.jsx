import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import portfolioService from "../services/portfolioService";
import packageService from "../services/packageService";
import Reveal from "../components/Reveal";
import { portfolios as mockPortfolios, categories as mockCategories } from "../data/mock";
import { formatDate } from "../utils/format";

const banners = {
  semua:
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop",
  produk:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
  prewedding:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop",
  portrait:
    "https://images.unsplash.com/photo-1554046920-90dc5f3ac6ed?q=80&w=1974&auto=format&fit=crop",
  event:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
  desain:
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2070&auto=format&fit=crop",
  video:
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop",
};

export default function Category() {
  const { slug } = useParams();
  const currentCategory = slug || "semua";

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [items, setItems] = useState(mockPortfolios);
  const [cats, setCats] = useState(mockCategories);

  useEffect(() => {
    let active = true;
    Promise.all([portfolioService.list(), packageService.categories()]).then(
      ([portfolioList, categoryList]) => {
        if (!active) return;
        setItems(portfolioList);
        setCats(categoryList);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const banner =
    banners[currentCategory] || banners.semua;
  const title =
    currentCategory === "semua"
      ? "ALL COLLECTIONS"
      : currentCategory.toUpperCase();

  let displayPortfolios =
    currentCategory === "semua"
      ? items
      : items.filter((item) => item.category === currentCategory);

  displayPortfolios = displayPortfolios.slice();

  if (filterDate) {
    displayPortfolios = displayPortfolios.filter(
      (item) => item.date === filterDate
    );
  } else {
    displayPortfolios.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return (
    <div className="w-full bg-white relative">
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900">
        <img
          src={banner}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Category Banner"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-screen-xl mx-auto w-full">
          <p className="text-white text-xs md:text-sm tracking-widest mb-2 uppercase font-medium">
            HOME / PORTFOLIO / {currentCategory}
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl font-extrabold uppercase tracking-tighter">
            {title}
          </h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/4">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tighter mb-8 text-gray-900">
            FILTERS
          </h2>

          <div className="mb-6">
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex justify-between items-center mb-4 cursor-pointer"
            >
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                CATEGORIES
              </h3>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isCategoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-4 text-sm text-gray-700 pb-4">
                <li>
                  <Link
                    to="/kategori"
                    className={`hover:text-black hover:font-bold transition-all ${
                      currentCategory === "semua" ? "font-bold text-black" : ""
                    }`}
                  >
                    All Collections
                  </Link>
                </li>
                {cats.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/kategori/${cat.slug}`}
                      className={`hover:text-black hover:font-bold transition-all ${
                        currentCategory === cat.slug ? "font-bold text-black" : ""
                      }`}
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link to="/booking" className="btn-primary w-full">
            Booking Sesi
          </Link>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-8 pb-4 border-b border-gray-200 gap-4">
            <span className="text-gray-500">
              {displayPortfolios.length} Collections
            </span>
            <div className="flex items-center">
              <span className="font-bold mr-3 text-gray-700 uppercase tracking-widest text-xs">
                Filter Tanggal:
              </span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 outline-none cursor-pointer hover:border-gray-500 focus:border-black transition-colors"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="ml-3 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {displayPortfolios.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              Belum ada koleksi foto untuk tanggal tersebut.
            </div>
          ) : (
            <Reveal className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
              {displayPortfolios.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedPhoto(item)}
                >
                  <div className="relative bg-gray-100 overflow-hidden mb-4">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-[250px] md:h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest text-xs font-bold">
                      Lihat Detail
                    </div>
                  </div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white max-w-4xl w-full flex flex-col md:flex-row shadow-2xl animate-fade-in">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-black hover:text-white rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full md:w-1/2 h-[300px] md:h-[500px] bg-gray-100">
              <img
                src={selectedPhoto.img}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
                Kategori {selectedPhoto.category}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-gray-900 leading-tight mb-4">
                {selectedPhoto.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(selectedPhoto.date)}
              </div>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {selectedPhoto.description}
              </p>
              <Link
                to="/booking"
                onClick={() => setSelectedPhoto(null)}
                className="btn-primary mt-8 self-start"
              >
                Booking Sesi Serupa
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
