import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  
  const [isOpen, setIsOpen] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeMenus = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 md:px-8 h-20">
        
       
        <Link to="/" onClick={closeMenus} className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-extrabold whitespace-nowrap text-gray-900 tracking-tighter">
            STUDIO<span className="text-gray-400">.VISUAL</span>
          </span>
        </Link>

        <div className="flex md:hidden md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            type="button" 
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Buka menu utama</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
     
            <li>
              <Link to="/" onClick={closeMenus} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-gray-500 md:p-0 uppercase tracking-widest text-sm transition-colors">
                Home
              </Link>
            </li>
            
            <li className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-gray-500 md:p-0 md:w-auto uppercase tracking-widest text-sm transition-colors"
              >
                Kategori
                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              <div className={`${isDropdownOpen ? 'block' : 'hidden'} md:absolute top-full left-0 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 mt-2 border border-gray-100`}>
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <Link to="/kategori" onClick={closeMenus} className="block px-4 py-3 hover:bg-gray-50 text-gray-900 uppercase tracking-widest text-xs font-bold border-b border-gray-100">
                      Lihat Semua
                    </Link>
                  </li>
                  <li>
                    <Link to="/kategori" onClick={closeMenus} className="block px-4 py-2 hover:bg-gray-50 uppercase tracking-wider text-xs transition-colors">
                      Foto Produk
                    </Link>
                  </li>
                  <li>
                    <Link to="/kategori" onClick={closeMenus} className="block px-4 py-2 hover:bg-gray-50 uppercase tracking-wider text-xs transition-colors">
                      Pre-Wedding
                    </Link>
                  </li>
                  <li>
                    <Link to="/kategori" onClick={closeMenus} className="block px-4 py-2 hover:bg-gray-50 uppercase tracking-wider text-xs transition-colors">
                      Potret Personal
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}