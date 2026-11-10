import { Link } from "react-router-dom";
import { APP_NAME } from "../config/api";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-8 md:px-8 lg:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="font-display self-center text-2xl font-extrabold whitespace-nowrap text-gray-900 tracking-tighter uppercase">
                Inheartz<span className="text-gray-400"> Studio</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed">
              Studio media kreatif untuk fotografi, videografi, dan produksi
              konten brand. Menangkap setiap detail dengan presisi.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
              Layanan
            </h2>
            <ul className="text-gray-500 text-sm font-medium space-y-4">
              <li>
                <Link to="/layanan" className="hover:text-gray-900 transition-colors">
                  Paket & Harga
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-gray-900 transition-colors">
                  Booking Jadwal
                </Link>
              </li>
              <li>
                <Link to="/pembayaran" className="hover:text-gray-900 transition-colors">
                  Pembayaran
                </Link>
              </li>
              <li>
                <Link to="/kategori" className="hover:text-gray-900 transition-colors">
                  Portofolio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
              Akun
            </h2>
            <ul className="text-gray-500 text-sm font-medium space-y-4">
              <li>
                <Link to="/masuk" className="hover:text-gray-900 transition-colors">
                  Masuk
                </Link>
              </li>
              <li>
                <Link to="/daftar" className="hover:text-gray-900 transition-colors">
                  Daftar
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gray-900 transition-colors">
                  Dashboard Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
              Kontak
            </h2>
            <ul className="text-gray-500 text-sm font-medium space-y-4">
              <li>
                <a href="mailto:hello@inheartzstudio.com" className="hover:text-gray-900 transition-colors">
                  hello@inheartzstudio.com
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © {new Date().getFullYear()}{" "}
            <Link to="/" className="hover:underline text-gray-900">
              {APP_NAME}
            </Link>
            . All Rights Reserved.
          </span>
          <span className="text-sm text-gray-400 mt-2 sm:mt-0">
            Creative Media & Photography
          </span>
        </div>
      </div>
    </footer>
  );
}
