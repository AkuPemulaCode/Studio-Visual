import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import NotificationBell from "./NotificationBell";

const navLinkClass = ({ isActive }) =>
  `block py-2 px-3 uppercase tracking-widest text-xs md:text-sm transition-colors md:p-0 ${
    isActive ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900"
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { isAuthenticated, isAdmin, isWorker, user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenus = () => {
    setIsOpen(false);
    setIsServiceOpen(false);
    setIsAccountOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/");
  };

  const initials = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 md:px-8 h-20">
        <Link
          to="/"
          onClick={closeMenus}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="font-display self-center text-xl md:text-2xl font-extrabold whitespace-nowrap text-gray-900 tracking-tighter uppercase">
            Inheartz<span className="text-gray-400"> Studio</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 md:order-2">
          <Link
            to="/booking"
            onClick={closeMenus}
            className="hidden sm:inline-flex btn-primary"
          >
            Booking
          </Link>

          {isAuthenticated && <NotificationBell />}

          <div className="relative hidden md:block">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white text-sm font-bold uppercase hover:bg-gray-700 transition-colors"
                  aria-label="Akun"
                >
                  {initials}
                </button>
                <div
                  className={`${
                    isAccountOpen ? "block" : "hidden"
                  } absolute right-0 top-full z-10 mt-3 w-56 border border-gray-100 bg-white py-2 shadow-lg`}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  {isWorker && !isAdmin && (
                    <Link
                      to="/worker"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard Produksi
                    </Link>
                  )}
                  <Link
                    to="/pesanan"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Pesanan Saya
                  </Link>
                  <Link
                    to="/pembayaran"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Pembayaran Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <Link to="/masuk" onClick={closeMenus} className="btn-outline">
                Masuk
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex md:hidden items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Buka menu utama</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <NavLink to="/" end onClick={closeMenus} className={navLinkClass}>
                Home
              </NavLink>
            </li>

            <li className="relative">
              <button
                onClick={() => setIsServiceOpen(!isServiceOpen)}
                className="flex items-center justify-between w-full py-2 px-3 md:py-0 md:px-0 text-gray-500 uppercase tracking-widest text-xs md:text-sm hover:text-gray-900 md:w-auto transition-colors"
              >
                Layanan
                <svg
                  className={`w-2.5 h-2.5 ms-2.5 transition-transform ${
                    isServiceOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              <div
                className={`${
                  isServiceOpen ? "block" : "hidden"
                } md:absolute top-full left-0 z-10 font-normal bg-white divide-y divide-gray-100 shadow-lg w-48 mt-2 border border-gray-100`}
              >
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <Link
                      to="/layanan"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-50 uppercase tracking-wider text-xs transition-colors"
                    >
                      Paket & Harga
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/kategori"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-50 uppercase tracking-wider text-xs transition-colors"
                    >
                      Colections
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <NavLink to="/booking" onClick={closeMenus} className={navLinkClass}>
                Booking
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/pembayaran"
                onClick={closeMenus}
                className={navLinkClass}
              >
                Pembayaran
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/pesanan"
                onClick={closeMenus}
                className={navLinkClass}
              >
                Pesanan Saya
              </NavLink>
            </li>

            <li className="pt-2 md:hidden">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full btn-outline"
                >
                  Keluar
                </button>
              ) : (
                <Link to="/masuk" onClick={closeMenus} className="w-full btn-primary">
                  Masuk
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
