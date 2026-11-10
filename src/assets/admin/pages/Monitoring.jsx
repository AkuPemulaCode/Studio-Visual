import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import StatusChart from "../components/StatusChart";
import AdminPageHeader from "../components/AdminPageHeader";
import Reveal from "../../components/Reveal";
import { usePolling } from "../../hooks/usePolling";
import {
  formatIDR,
  formatShortDate,
  statusLabel,
  statusStyle,
} from "../../utils/format";

export default function Monitoring() {
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [finance, setFinance] = useState({});

  const load = useCallback(async () => {
    const [statData, bookingData, revenueData, financeData] = await Promise.all([
      adminService.stats(),
      adminService.bookings(),
      adminService.revenue(),
      adminService.finance(),
    ]);
    setStats(statData || {});
    setBookings(bookingData || []);
    setRevenue(revenueData || []);
    setFinance(financeData || {});
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.stats(),
      adminService.bookings(),
      adminService.revenue(),
      adminService.finance(),
    ]).then(([statData, bookingData, revenueData, financeData]) => {
      if (!active) return;
      setStats(statData || {});
      setBookings(bookingData || []);
      setRevenue(revenueData || []);
      setFinance(financeData || {});
    });
    return () => {
      active = false;
    };
  }, []);

  usePolling(load, 20000, true);

  const breakdown = useMemo(
    () =>
      bookings.reduce((acc, booking) => {
        const status = booking.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    [bookings]
  );

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Monitoring"
        description="Ringkasan performa studio: booking, pendapatan, dan pelanggan aktif."
        action={
          <Link to="/admin/bookings" className="btn-outline self-start">
            Semua Booking
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Reveal delay={0}>
          <StatCard
            label="Total Booking"
            value={stats.totalBookings ?? "-"}
            hint="Sepanjang periode"
          />
        </Reveal>
        <Reveal delay={80}>
          <StatCard
            label="Menunggu"
            value={stats.pendingBookings ?? "-"}
            hint="Perlu ditindaklanjuti"
          />
        </Reveal>
        <Reveal delay={160}>
          <StatCard
            label="Pendapatan"
            value={stats.totalRevenue != null ? formatIDR(stats.totalRevenue) : "-"}
            hint="Total terealisasi"
          />
        </Reveal>
        <Reveal delay={240}>
          <StatCard
            label="Pelanggan Aktif"
            value={stats.activeCustomers ?? "-"}
            hint="Total pelanggan unik"
          />
        </Reveal>
        <Reveal delay={320}>
          <StatCard
            label="Saldo Studio"
            value={
              finance.balance != null ? formatIDR(finance.balance) : "-"
            }
            hint="Kas dari pesanan selesai"
          />
        </Reveal>
        <Reveal delay={400}>
          <StatCard
            label="Pesanan Selesai"
            value={stats.completedBookings ?? "-"}
            hint="Sudah masuk kas"
          />
        </Reveal>
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Reveal className="xl:col-span-2">
          <RevenueChart data={revenue} />
        </Reveal>
        <Reveal delay={120}>
          <StatusChart breakdown={breakdown} />
        </Reveal>
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
            Kas Masuk Terbaru
          </h2>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Saldo: {finance.balance != null ? formatIDR(finance.balance) : "-"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Keterangan</th>
                <th className="px-6 py-4 font-bold">Booking</th>
                <th className="px-6 py-4 font-bold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(finance.transactions || []).slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">
                    {formatShortDate(tx.occurredAt)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{tx.description}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {tx.bookingId || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    +{formatIDR(tx.amount)}
                  </td>
                </tr>
              ))}
              {(!finance.transactions || finance.transactions.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-gray-400"
                  >
                    Belum ada kas masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
            Booking Terbaru
          </h2>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Pelanggan</th>
                <th className="px-6 py-4 font-bold">Paket</th>
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{booking.package}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatShortDate(booking.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusStyle(booking.status)}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    {formatIDR(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
