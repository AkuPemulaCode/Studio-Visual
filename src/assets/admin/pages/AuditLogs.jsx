import { useEffect, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import adminService from '../../services/adminService';
import { formatDate, formatShortDate } from '../../utils/format';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    adminService.auditLogs().then((data) => {
      if (active) {
        setLogs(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const filtered = logs.filter((log) => {
    if (!query) return true;
    const keyword = query.toLowerCase();
    return (
      log.action?.toLowerCase().includes(keyword) ||
      log.description?.toLowerCase().includes(keyword) ||
      log.user?.name?.toLowerCase().includes(keyword) ||
      log.ip_address?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className='animate-fade-in'>
      <AdminPageHeader
        title='Audit Log'
        description='Riwayat aktivitas sistem: siapa, kapan, dan tindakan apa yang dilakukan.'
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Cari aktivitas'
            className='input md:max-w-xs'
          />
        }
      />

      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400'>
              <tr>
                <th className='px-6 py-4 font-bold'>Waktu</th>
                <th className='px-6 py-4 font-bold'>Pengguna</th>
                <th className='px-6 py-4 font-bold'>Aksi</th>
                <th className='px-6 py-4 font-bold'>Deskripsi</th>
                <th className='px-6 py-4 font-bold'>IP</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {loading && (
                <tr><td colSpan={5} className='px-6 py-12 text-center text-gray-400'>Memuat audit log...</td></tr>
              )}
              {!loading && filtered.map((log) => (
                <tr key={log.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-gray-600'>{formatShortDate(log.created_at)} {formatDate(log.created_at, { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className='px-6 py-4 text-gray-900'>{log.user?.name || log.user_id || '-'}</td>
                  <td className='px-6 py-4'><span className='badge bg-gray-100 text-gray-700'>{log.action}</span></td>
                  <td className='px-6 py-4 text-gray-600'>{log.description || '-'}</td>
                  <td className='px-6 py-4 font-mono text-xs text-gray-500'>{log.ip_address || '-'}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className='px-6 py-12 text-center text-gray-400'>Belum ada audit log.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
