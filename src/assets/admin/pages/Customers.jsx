import { useEffect, useMemo, useState } from "react";
import adminService from "../../services/adminService";
import AdminPageHeader from "../components/AdminPageHeader";
import { usePolling } from "../../hooks/usePolling";
import { formatIDR, statusLabel, statusStyle } from "../../utils/format";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");

  const load = () =>
    adminService.customers().then((data) => setCustomers(data || []));

  usePolling(load, 15000, true);

  useEffect(() => {
    let active = true;
    adminService.customers().then((data) => {
      if (active) setCustomers(data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword)
    );
  }, [customers, query]);

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Pelanggan"
        description="Daftar pelanggan beserta jumlah booking dan total transaksi."
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pelanggan"
            className="input self-start md:max-w-xs"
          />
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Pelanggan</th>
                <th className="px-6 py-4 font-bold">Kontak</th>
                <th className="px-6 py-4 font-bold">Jumlah Booking</th>
                <th className="px-6 py-4 font-bold">Status Terakhir</th>
                <th className="px-6 py-4 font-bold text-right">
                  Total Transaksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => (
                <tr key={customer.email || customer.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="block">{customer.email || "-"}</span>
                    <span className="block text-xs text-gray-400">
                      {customer.phone || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {customer.bookings}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusStyle(customer.lastStatus)}`}>
                      {statusLabel(customer.lastStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    {formatIDR(customer.total)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Belum ada pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
