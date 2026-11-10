export default function Loader({ label = "Memuat data" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-10 w-10 animate-spin border-2 border-gray-300 border-t-gray-900 rounded-full" />
      <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}
