import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=2070&auto=format&fit=crop",
      title: "VISUALLY CRAFTED.",
      link: "/kategori"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop",
      title: "THE SEED SERIES.",
      link: "/kategori"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
      title: "MADE TO MOVE WITH YOU.",
      link: "/kategori"
    }
  ];

  const newArrivals = [
    {
      id: 1,
      name: "Foto Produk Profesional",
      price: "IDR 499,000",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Sesi Pre-Wedding Outdoor",
      price: "IDR 699,000",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Personal Portrait Studio",
      price: "IDR 566,100",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Commercial Event Coverage",
      price: "IDR 1,299,000",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"
    }
  ];

  const categories = [
    {
      id: 1,
      title: "PRODUCT",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "PRE-WEDDING",
      image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "PORTRAIT",
      image: "https://images.unsplash.com/photo-1554046920-90dc5f3ac6ed?q=80&w=1974&auto=format&fit=crop"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="relative h-[80vh] w-full overflow-hidden bg-black group">
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center px-4 max-w-screen-md mx-auto">
                  <h1 className="mb-6 text-5xl font-extrabold tracking-tighter leading-none text-white md:text-7xl uppercase drop-shadow-xl">
                    {slide.title}
                  </h1>
                  <Link 
                    to={slide.link} 
                    className="pointer-events-auto inline-flex justify-center items-center py-3 px-8 text-sm font-bold text-center text-gray-900 rounded-none bg-white hover:bg-gray-200 uppercase tracking-widest transition-transform hover:scale-105"
                  >
                    Lihat Karya Kami
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          onClick={nextSlide}
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
              className={`transition-all duration-300 rounded-full ${
                currentSlide === idx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col md:flex-row border-y border-gray-300 bg-white">
        <div className="w-full md:w-1/4 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-center items-start">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase leading-none tracking-tighter mb-4">
            New<br/>Arrivals
          </h2>
          <Link to="/kategori" className="text-sm font-bold uppercase underline underline-offset-4 hover:text-gray-500 transition-colors">
            Discover Products
          </Link>
        </div>

        <div className="w-full md:w-3/4 flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar border-gray-300">
          {newArrivals.map((item) => (
            <div key={item.id} className="min-w-[280px] md:min-w-[350px] flex-shrink-0 snap-start border-r border-gray-300 p-6 group cursor-pointer">
              <div className="relative overflow-hidden mb-6 bg-gray-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-center py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest text-sm font-bold">
                  Quick Look
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
              <p className="font-extrabold text-xl mt-2">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col md:flex-row border-b border-gray-300 bg-white">
        <div className="w-full md:w-1/4 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase leading-none tracking-tighter">
            Categories
          </h2>
        </div>

        <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-300 border-gray-300">
          {categories.map((cat) => (
            <Link key={cat.id} to="/kategori" className="relative group block h-[300px] md:h-[500px] overflow-hidden">
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-widest uppercase">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}