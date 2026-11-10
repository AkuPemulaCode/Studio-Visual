export default function OfflineScreen({ onRetry }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border border-gray-200">
          <svg
            className="h-12 w-12 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 00-5.656 0M3.05 3.05l17.9 17.9M12 20h.01"
            />
          </svg>
        </div>

        <p className="eyebrow mb-3">Koneksi Terputus</p>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-gray-900 leading-none">
          No Internet
          <br />
          Connection
        </h1>
        <p className="mt-6 text-sm md:text-base text-gray-500 leading-relaxed">
          Sepertinya perangkat Anda sedang tidak terhubung ke internet.
          Periksa kembali koneksi Wi-Fi atau data seluler Anda, lalu coba lagi.
        </p>

        <button onClick={onRetry} className="btn-primary mt-8">
          Coba Lagi
        </button>

        <p className="mt-6 text-xs text-gray-400 uppercase tracking-widest">
          Inheartz Studio
        </p>
      </div>
    </div>
  );
}
