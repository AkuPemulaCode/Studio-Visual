import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Category() {
  const { slug } = useParams();
  const currentCategory = slug || 'semua';
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const categoryData = {
    semua: {
      title: "ALL COLLECTIONS",
      banner: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop",
    },
    produk: {
      title: "PRODUCT",
      banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
    },
    prewedding: {
      title: "PRE-WEDDING",
      banner: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop",
    },
    portrait: {
      title: "PORTRAIT",
      banner: "https://images.unsplash.com/photo-1554046920-90dc5f3ac6ed?q=80&w=1974&auto=format&fit=crop",
    }
  };

  const currentData = categoryData[currentCategory] || categoryData.semua;

  const portfolios = [
    { 
      id: 1, 
      title: "Katalog Fashion Minimalist", 
      date: "2026-07-20", 
      category: "produk", 
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
      description: "Sesi pemotretan produk jam tangan untuk brand fashion lokal dengan konsep minimalis dan dominasi warna putih abu-abu." 
    },
    { 
      id: 2, 
      title: "Cinematic Outdoor R&D", 
      date: "2026-07-15", 
      category: "prewedding", 
      img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
      description: "Sesi pre-wedding bertema petualangan cinematic yang dilakukan di luar ruangan dengan memanfaatkan cahaya natural matahari terbenam." 
    },
    { 
      id: 3, 
      title: "Neon Studio Portrait", 
      date: "2026-06-10", 
      category: "portrait", 
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
      description: "Eksplorasi potret personal menggunakan pencahayaan studio kreatif dengan perpaduan gel warna biru dan ungu (cyberpunk vibes)." 
    },
    { 
      id: 4, 
      title: "Komersial Kuliner", 
      date: "2026-05-22", 
      category: "produk", 
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
      description: "Foto komersial untuk buku menu restoran kelas atas, menonjolkan detail tekstur makanan dan tata letak meja yang elegan." 
    },
    { 
      id: 5, 
      title: "Classic Elegance Pre-Wed", 
      date: "2026-07-25", 
      category: "prewedding", 
      img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
      description: "Konsep pre-wedding klasik dan elegan di dalam ruangan bergaya Eropa klasik dengan gaun pengantin tradisional." 
    },
    { 
      id: 6, 
      title: "Corporate Headshot", 
      date: "2026-04-18", 
      category: "portrait", 
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
      description: "Pemotretan profil profesional untuk jajaran direksi perusahaan startup teknologi, menggunakan latar belakang abu-abu netral." 
    },
  ];

  let displayPortfolios = currentCategory === 'semua' 
    ? portfolios 
    : portfolios.filter(item => item.category === currentCategory);

  if (filterDate) {
    displayPortfolios = displayPortfolios.filter(item => item.date === filterDate);
  } else {
    displayPortfolios = displayPortfolios.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return (
    <div className="w-full bg-white relative">
      
      <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900">
        <img 
          src={currentData.banner} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          alt="Category Banner" 
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-screen-xl mx-auto w-full">
          <p className="text-white text-xs md:text-sm tracking-widest mb-2 uppercase font-medium">
            HOME / COLLECTIONS / {currentCategory}
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold uppercase tracking-tighter">
            {currentData.title}
          </h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-10">
        
        <div className="w-full lg:w-1/4">
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter mb-8 text-gray-900">FILTERS</h2>
          
          <div className="mb-6">
            <div 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex justify-between items-center mb-4 cursor-pointer"
            >
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">CATEGORIES</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${isCategoryOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="space-y-4 text-sm text-gray-700 pb-4">
                <li>
                  <Link to="/kategori" className={`hover:text-black hover:font-bold transition-all ${currentCategory === 'semua' ? 'font-bold text-black' : ''}`}>
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link to="/kategori/produk" className={`hover:text-black hover:font-bold transition-all ${currentCategory === 'produk' ? 'font-bold text-black' : ''}`}>
                    Product Photography
                  </Link>
                </li>
                <li>
                  <Link to="/kategori/prewedding" className={`hover:text-black hover:font-bold transition-all ${currentCategory === 'prewedding' ? 'font-bold text-black' : ''}`}>
                    Pre-Wedding
                  </Link>
                </li>
                <li>
                  <Link to="/kategori/portrait" className={`hover:text-black hover:font-bold transition-all ${currentCategory === 'portrait' ? 'font-bold text-black' : ''}`}>
                    Personal Portrait
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-8 pb-4 border-b border-gray-200 gap-4">
            <span className="text-gray-500">{displayPortfolios.length} Collections</span>
            <div className="flex items-center">
              <span className="font-bold mr-3 text-gray-700 uppercase tracking-widest text-xs">Filter Tanggal:</span>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 outline-none cursor-pointer hover:border-gray-500 focus:border-black transition-colors"
              />
              {filterDate && (
                <button 
                  onClick={() => setFilterDate('')}
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
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
                  <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1 leading-tight">{item.title}</h3>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="relative bg-white max-w-4xl w-full flex flex-col md:flex-row shadow-2xl animate-[fadeIn_0.3s_ease-out]">
            
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-black hover:text-white rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-gray-900 leading-tight mb-4">
                {selectedPhoto.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(selectedPhoto.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {selectedPhoto.description}
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}