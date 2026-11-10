export default function StatCard({ label, value, hint }) {
  return (
    <div className="card p-6">
      <p className="eyebrow mb-3">{label}</p>
      <p className="font-display text-3xl font-extrabold tracking-tight">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
