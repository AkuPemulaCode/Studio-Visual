import { useCallback, useEffect, useRef, useState } from "react";
import adminService from "../../services/adminService";
import AdminPageHeader from "../components/AdminPageHeader";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import Reveal from "../../components/Reveal";
import { usePolling } from "../../hooks/usePolling";
import { useToast } from "../../hooks/useToast";
import ToastStack from "../../components/Toast";
import {
  formatIDR,
  formatShortDate,
  PRODUCTION_STAGES,
  productionPercent,
  productionStageLabel,
  productionStageStyle,
} from "../../utils/format";

const EMPTY_FORM = {
  stage: "queued",
  note: "",
  estimatedFinish: "",
  previewUrl: "",
};

function isOverdue(booking) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const stage = booking.productionStage || "queued";
  return (
    stage !== "delivered" &&
    booking.estimatedFinish &&
    new Date(booking.estimatedFinish) < today
  );
}

export default function Production() {
  const [data, setData] = useState({
    summary: {},
    breakdown: {},
    bookings: [],
  });
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const { toasts, push, remove } = useToast();
  const firstLoad = useRef(true);

  const load = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    const res = await adminService.production();
    setData(res || { summary: {}, breakdown: {}, bookings: [] });
    setLoading(false);
    firstLoad.current = false;
  }, []);

  useEffect(() => {
    let active = true;
    adminService.production().then((res) => {
      if (!active) return;
      setData(res || { summary: {}, breakdown: {}, bookings: [] });
      setLoading(false);
      firstLoad.current = false;
    });
    return () => {
      active = false;
    };
  }, []);

  usePolling(
    () => {
      if (firstLoad.current || draggingId) return;
      load(true);
    },
    20000,
    true
  );

  const openManage = (booking) => {
    setManaging(booking);
    setForm({
      stage: booking.productionStage || "queued",
      note: "",
      estimatedFinish: booking.estimatedFinish || "",
      previewUrl: booking.previewUrl || "",
    });
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!managing) return;
    setSaving(true);
    await adminService.updateProgress(managing.id, {
      stage: form.stage,
      note: form.note.trim(),
      estimatedFinish: form.estimatedFinish || null,
      previewUrl: form.previewUrl.trim(),
    });
    push(`${managing.id} diperbarui ke ${productionStageLabel(form.stage)}.`, "success");
    await load(false);
    setSaving(false);
    setManaging(null);
  };

  const handleDrop = async (stage) => {
    setDropTarget(null);
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;

    const booking = (data.bookings || []).find((item) => item.id === id);
    if (!booking || (booking.productionStage || "queued") === stage) return;

    setData((prev) => ({
      ...prev,
      bookings: (prev.bookings || []).map((item) =>
        item.id === id
          ? {
              ...item,
              productionStage: stage,
              productionPercent: productionPercent(stage),
            }
          : item
      ),
    }));
    push(`${id} dipindah ke ${productionStageLabel(stage)}.`);

    await adminService.updateProgress(id, { stage });
    await load(true);
  };

  const { summary = {}, bookings = [] } = data;

  const byStage = (key) =>
    bookings.filter((booking) => (booking.productionStage || "queued") === key);

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Progres Produksi"
        description="Papan kanban produksi — seret kartu antar tahapan untuk memindahkan progres pesanan."
        action={
          <button onClick={() => load(false)} className="btn-outline self-start">
            Muat Ulang
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Reveal delay={0}>
          <StatCard
            label="Total Produksi"
            value={summary.total ?? "-"}
            hint="Pesanan layak produksi"
          />
        </Reveal>
        <Reveal delay={80}>
          <StatCard
            label="Sedang Diproses"
            value={summary.active ?? "-"}
            hint="Belum terkirim"
          />
        </Reveal>
        <Reveal delay={160}>
          <StatCard
            label="Hasil Terkirim"
            value={summary.delivered ?? "-"}
            hint="Produksi tuntas"
          />
        </Reveal>
        <Reveal delay={240}>
          <StatCard
            label="Terlambat"
            value={summary.overdue ?? "-"}
            hint="Lewat estimasi selesai"
          />
        </Reveal>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold uppercase tracking-tight">
          Papan Produksi
        </h2>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Rata-rata {summary.averagePercent ?? 0}%
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Memuat data produksi...</p>
      ) : (
        <div className="kanban-scroll mt-4 flex gap-4 overflow-x-auto pb-4">
          {PRODUCTION_STAGES.map((stage) => {
            const items = byStage(stage.key);
            const isTarget = dropTarget === stage.key;
            return (
              <div
                key={stage.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget(stage.key);
                }}
                onDragLeave={() =>
                  setDropTarget((prev) => (prev === stage.key ? null : prev))
                }
                onDrop={() => handleDrop(stage.key)}
                className={`kanban-col flex w-72 flex-shrink-0 flex-col border bg-gray-50 transition-all duration-200 ${
                  isTarget
                    ? "drop-active scale-[1.01] border-gray-900 bg-white shadow-lg"
                    : draggingId
                      ? "border-dashed border-gray-300"
                      : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {stage.label}
                  </span>
                  <span
                    className={`badge transition-colors ${
                      isTarget
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {items.length}
                  </span>
                </div>

                <div className="flex min-h-[120px] flex-1 flex-col gap-3 p-3">
                  {items.map((booking) => {
                    const overdue = isOverdue(booking);
                    return (
                      <article
                        key={booking.id}
                        draggable
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openManage(booking);
                          }
                        }}
                        onDragStart={(e) => {
                          setDraggingId(booking.id);
                          e.dataTransfer.effectAllowed = "move";
                          try {
                            e.dataTransfer.setData("text/plain", booking.id);
                          } catch {
                            /* abaikan */
                          }
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        onClick={() => openManage(booking)}
                        className={`animate-pop-in group relative cursor-grab border bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] ${
                          draggingId === booking.id ? "dragging" : ""
                        } ${overdue ? "border-red-300" : "border-gray-200"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono text-[11px] text-gray-400">
                            {booking.id}
                          </p>
                          {booking.revisionCount > 0 && (
                            <span className="badge bg-amber-100 text-amber-700">
                              Rev {booking.revisionCount}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {booking.customer}
                        </p>
                        <p className="text-xs text-gray-500">{booking.package}</p>

                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gray-900 transition-all duration-500 ease-out"
                            style={{ width: `${booking.productionPercent || 0}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className={overdue ? "text-red-600" : "text-gray-400"}>
                            {booking.estimatedFinish
                              ? formatShortDate(booking.estimatedFinish)
                              : "Tanpa estimasi"}
                          </span>
                          <span className="text-gray-500">
                            {booking.productionPercent || 0}%
                          </span>
                        </div>
                        {booking.previewUrl && (
                          <span className="badge mt-2 bg-violet-100 text-violet-700">
                            Preview siap
                          </span>
                        )}
                      </article>
                    );
                  })}

                  {items.length === 0 && (
                    <p
                      className={`py-6 text-center text-[11px] transition-colors ${
                        isTarget
                          ? "font-semibold text-gray-900"
                          : "text-gray-300"
                      }`}
                    >
                      {isTarget ? "Lepaskan di sini" : "Kosong"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(managing)}
        onClose={() => setManaging(null)}
        title={`Update Progres Produksi${managing ? ` · ${managing.id}` : ""}`}
        footer={
          <>
            <button onClick={() => setManaging(null)} className="btn-outline">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Menyimpan..." : "Simpan Progres"}
            </button>
          </>
        }
      >
        {managing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 border border-gray-100 bg-gray-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1">Pelanggan</p>
                <p className="font-bold text-gray-900">{managing.customer}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Paket</p>
                <p className="font-bold text-gray-900">{managing.package}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Nilai</p>
                <p className="font-bold text-gray-900">
                  {formatIDR(managing.amount)}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Progres Saat Ini</p>
                <p className="font-bold text-gray-900">
                  <span className={`badge ${productionStageStyle(managing.productionStage)}`}>
                    {productionStageLabel(managing.productionStage)}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="label">Tahapan Produksi</label>
              <select
                className="input"
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
              >
                {PRODUCTION_STAGES.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label} ({stage.percent}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Estimasi Selesai</label>
              <input
                type="date"
                className="input"
                value={form.estimatedFinish}
                onChange={(e) => update("estimatedFinish", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Link Preview Hasil (untuk review klien)</label>
              <input
                type="url"
                className="input"
                value={form.previewUrl}
                onChange={(e) => update("previewUrl", e.target.value)}
                placeholder="https://drive.google.com/... atau https://.../preview.jpg"
              />
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Muncul di halaman pelanggan saat tahap <b>Review Klien</b> agar
                mereka bisa menyetujui atau meminta revisi.
              </p>
            </div>

            <div>
              <label className="label">Catatan Progres</label>
              <textarea
                className="input min-h-[110px] resize-y"
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                placeholder="Contoh: Preview 30 foto siap ditinjau klien."
              />
            </div>
          </div>
        )}
      </Modal>

      <ToastStack toasts={toasts} remove={remove} />
    </div>
  );
}
