import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import NotificationBell from "../../components/NotificationBell";

export default function WorkerLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = (user?.name || "P").charAt(0).toUpperCase();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
      isActive
        ? "bg-white text-gray-900"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 lg:flex">
      {open && (
        <button
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center border-b border-gray-800 px-6">
          <Link to="/worker" onClick={() => setOpen(false)}>
            <span className="font-display text-lg font-extrabold uppercase tracking-tighter">
              Inheartz<span className="text-gray-500"> Produksi</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <NavLink to="/worker" end onClick={() => setOpen(false)} className={navClass}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-4H4v4zm10-11h6V4h-6v5z" />
            </svg>
            Monitoring
          </NavLink>
          <NavLink
            to="/worker/production"
            onClick={() => setOpen(false)}
            className={navClass}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5h6a2 2 0 012 2v3m0 4v3a2 2 0 01-2 2h-3m-4 0H7a2 2 0 01-2-2v-3m0-4V7a2 2 0 012-2h3M3 12h18" />
            </svg>
            Produksi
          </NavLink>
          <NavLink
            to="/worker/bookings"
            onClick={() => setOpen(false)}
            className={navClass}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm0-8h14" />
            </svg>
            Booking
          </NavLink>
          <NavLink
            to="/worker/booking-baru"
            onClick={() => setOpen(false)}
            className={navClass}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Booking
          </NavLink>
          <NavLink
            to="/worker/customers"
            onClick={() => setOpen(false)}
            className={navClass}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3" />
            </svg>
            Pelanggan
          </NavLink>
        </nav>

        <div className="border-t border-gray-800 p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-white text-sm font-bold uppercase text-gray-900">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.name}</p>
              <p className="truncate text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="block w-full border border-gray-700 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors hover:bg-gray-800"
          >
            Lihat Situs
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 block w-full px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-red-400 transition-colors hover:bg-gray-800"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              className="flex h-10 w-10 items-center justify-center border border-gray-200 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="eyebrow">Dashboard Staff</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/"
              className="hidden text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 sm:block"
            >
              Kembali ke Situs
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
