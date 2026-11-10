import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import NotificationBell from "../../components/NotificationBell";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    label: "Monitoring",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-4H4v4zm10-11h6V4h-6v5z" />
      </svg>
    ),
  },
  {
    to: "/admin/bookings",
    label: "Booking",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm0-8h14" />
      </svg>
    ),
  },
  {
    to: "/admin/production",
    label: "Produksi",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5h6a2 2 0 012 2v3m0 4v3a2 2 0 01-2 2h-3m-4 0H7a2 2 0 01-2-2v-3m0-4V7a2 2 0 012-2h3M3 12h18" />
      </svg>
    ),
  },
  {
    to: "/admin/customers",
    label: "Pelanggan",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "User",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: "/admin/packages",
    label: "Paket",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/admin/portfolios",
    label: "Portofolio",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: "/admin/audit-logs",
    label: "Audit Log",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = (user?.name || "A").charAt(0).toUpperCase();

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
          <Link to="/admin" onClick={() => setOpen(false)}>
            <span className="font-display text-lg font-extrabold uppercase tracking-tighter">
              Inheartz<span className="text-gray-500"> Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={navClass}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
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
            <span className="eyebrow">Dashboard Admin</span>
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
