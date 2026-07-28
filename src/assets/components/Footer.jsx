import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-8 md:px-8 lg:py-12">
        <div className="md:flex md:justify-between">
          
          {/* Brand Info */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="self-center text-2xl font-extrabold whitespace-nowrap text-gray-900 tracking-tighter">
                STUDIO.VISUAL
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed">
              Menangkap setiap detail. Studio fotografi profesional untuk personal, produk, dan komersial.
            </p>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">Navigasi</h2>
              <ul className="text-gray-500 text-sm font-medium">
                <li className="mb-4">
                  <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/kategori" className="hover:text-gray-900 transition-colors">Kategori</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">Sosial Media</h2>
              <ul className="text-gray-500 text-sm font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:text-gray-900 transition-colors">Instagram</a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
        
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2026 <Link to="/" className="hover:underline text-gray-900">Studio Visual™</Link>. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}