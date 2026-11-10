import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <p className="font-display text-7xl md:text-9xl font-extrabold tracking-tighter text-gray-200">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-gray-900">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-4 text-sm md:text-base text-gray-500 leading-relaxed">
          Halaman yang Anda cari mungkin sudah dipindahkan atau tidak pernah ada.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Kembali ke Home
          </Link>
          <Link to="/layanan" className="btn-outline">
            Lihat Layanan
          </Link>
        </div>
      </div>
    </div>
  );
}
