import { useMemo, useState } from "react";
import { formatIDR } from "../../utils/format";

const W = 760;
const H = 260;
const PAD = { top: 28, right: 28, bottom: 40, left: 64 };

function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    d += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
}

function formatCompact(value) {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
  if (value >= 1000) return `${Math.round(value / 1000)}rb`;
  return String(value);
}

export default function RevenueChart({ data = [] }) {
  const [hover, setHover] = useState(null);

  const chart = useMemo(() => {
    const values = data.map((item) => Number(item.value) || 0);
    const max = Math.max(...values, 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    const points = data.map((item, index) => {
      const value = Number(item.value) || 0;
      return {
        ...item,
        value,
        x: PAD.left + step * index,
        y: PAD.top + innerH - (value / max) * innerH,
      };
    });
    const line = buildSmoothPath(points);
    const area = points.length
      ? `${line} L ${points[points.length - 1].x} ${
          PAD.top + innerH
        } L ${points[0].x} ${PAD.top + innerH} Z`
      : "";
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      y: PAD.top + innerH * ratio,
      label: formatCompact(max * (1 - ratio)),
    }));
    const total = values.reduce((sum, value) => sum + value, 0);
    const last = values[values.length - 1] || 0;
    const prev = values[values.length - 2] || 0;
    const growth = prev ? ((last - prev) / prev) * 100 : 0;
    return { points, line, area, gridLines, total, growth, innerH };
  }, [data]);

  const active = hover != null ? chart.points[hover] : null;
  const tooltipX = active
    ? Math.min(Math.max(active.x - 70, PAD.left), W - PAD.right - 140)
    : 0;
  const tooltipY = active ? Math.max(active.y - 78, 6) : 0;

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
            Pendapatan Bulanan
          </h2>
          <p className="mt-1 text-xs text-gray-400">6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="eyebrow mb-1">Total</p>
            <p className="font-display text-xl font-extrabold">
              {formatIDR(chart.total)}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Pertumbuhan</p>
            <p
              className={`font-display text-xl font-extrabold ${
                chart.growth >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {chart.growth >= 0 ? "+" : ""}
              {chart.growth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-64 w-full"
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Grafik pendapatan bulanan"
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111827" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#111827" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.gridLines.map((line) => (
            <g key={line.y}>
              <line
                x1={PAD.left}
                y1={line.y}
                x2={W - PAD.right}
                y2={line.y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 12}
                y={line.y + 4}
                textAnchor="end"
                className="fill-gray-300"
                fontSize="11"
              >
                {line.label}
              </text>
            </g>
          ))}

          <path d={chart.area} fill="url(#revenueFill)" />
          <path
            d={chart.line}
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {chart.points.map((point, index) => (
            <g key={point.month}>
              <rect
                x={point.x - 30}
                y={PAD.top}
                width="60"
                height={chart.innerH}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={hover === index ? 5.5 : 3.5}
                fill="#ffffff"
                stroke="#111827"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={H - 14}
                textAnchor="middle"
                className="fill-gray-400"
                fontSize="11"
                fontWeight="700"
              >
                {point.month}
              </text>
            </g>
          ))}

          {active && (
            <g pointerEvents="none">
              <line
                x1={active.x}
                y1={PAD.top}
                x2={active.x}
                y2={PAD.top + chart.innerH}
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect
                  width="140"
                  height="58"
                  rx="6"
                  fill="#111827"
                  opacity="0.95"
                />
                <text x="12" y="22" fill="#9ca3af" fontSize="10">
                  {active.month}
                </text>
                <text
                  x="12"
                  y="43"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="700"
                >
                  {formatIDR(active.value)}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
