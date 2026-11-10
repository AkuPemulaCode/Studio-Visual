import { useMemo } from "react";
import { statusLabel } from "../../utils/format";

const COLORS = {
  pending: "#f59e0b",
  awaiting_payment: "#fb923c",
  paid: "#3b82f6",
  confirmed: "#10b981",
  ongoing: "#6366f1",
  completed: "#6b7280",
  cancelled: "#ef4444",
};

const SIZE = 180;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StatusChart({ breakdown = {} }) {
  const segments = useMemo(() => {
    const entries = Object.entries(breakdown).filter(([, value]) => value > 0);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    let offset = 0;
    const parts = entries.map(([status, value]) => {
      const ratio = total ? value / total : 0;
      const dash = ratio * CIRCUMFERENCE;
      const segment = {
        status,
        value,
        ratio,
        dash,
        offset,
        color: COLORS[status] || "#9ca3af",
      };
      offset += dash;
      return segment;
    });
    return { parts, total };
  }, [breakdown]);

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
          Status Pesanan
        </h2>
        <span className="eyebrow">Distribusi</span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex-shrink-0">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label="Distribusi status pesanan"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={STROKE}
            />
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              {segments.parts.map((segment) => (
                <circle
                  key={segment.status}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                  strokeDashoffset={-segment.offset}
                  strokeLinecap="butt"
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-extrabold">
              {segments.total}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400">
              Pesanan
            </span>
          </div>
        </div>

        <ul className="w-full space-y-2">
          {segments.parts.length === 0 && (
            <li className="text-sm text-gray-400">Belum ada data status.</li>
          )}
          {segments.parts.map((segment) => (
            <li
              key={segment.status}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-600">
                  {statusLabel(segment.status)}
                </span>
              </span>
              <span className="font-bold text-gray-900">
                {segment.value}
                <span className="ml-1 text-xs font-normal text-gray-400">
                  ({(segment.ratio * 100).toFixed(0)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
