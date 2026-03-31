import React, { useEffect, useState } from "react";
import StatsPanel from "../components/StatsPanel";
import { getAttendanceData } from "../services/userViewsService";

function parseMonthlyData(data = "") {
  const match = String(data).match(/(\d+)\/(\d+)\s*\((\d+)%\)/);
  if (!match) {
    return { done: 0, total: 0, percent: 0 };
  }

  return {
    done: Number(match[1]),
    total: Number(match[2]),
    percent: Number(match[3])
  };
}

export default function MyAttendance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;

    getAttendanceData().then(data => {
      if (!mounted) return;
      setStats(data.stats);
      setMonthly(data.monthly);
      setHistory(data.history);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mi asistencia</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Monitorea tu avance mensual y revisa el detalle de asistencias registradas.</p>
      </header>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1rem] font-semibold text-[var(--text)]">Indicadores principales</h2>
        {loading ? <div className="min-h-[140px] rounded-xl border border-[#d8e3dc] bg-[linear-gradient(180deg,#f9fcfa_0%,#f2f8f4_100%)]" /> : <StatsPanel stats={stats} />}
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1rem] font-semibold text-[var(--text)]">Asistencia mensual</h2>
        <div className="grid gap-3">
          {monthly.map(item => (
            <article key={item.month} className="rounded-xl border border-[#d6e2da] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] px-4 pb-3.5 pt-3.5 shadow-[0_8px_20px_-26px_rgba(10,40,25,0.45)]">
              <div className="flex flex-col items-start justify-between gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <strong className="text-[0.95rem] font-semibold text-[var(--text)]">{item.month}</strong>
                <span className="text-[0.85rem] text-[var(--text-muted)]">{item.data}</span>
              </div>
              <div className="mt-2.5 h-[0.44rem] w-full overflow-hidden rounded-full bg-[#d9e4dc]" aria-hidden="true">
                <span className="block h-full rounded-[inherit] bg-[linear-gradient(90deg,#138d4f,#3bad72)]" style={{ width: `${parseMonthlyData(item.data).percent}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1rem] font-semibold text-[var(--text)]">Historial detallado</h2>
        <div className="overflow-x-auto rounded-xl border border-[#d8e6dd] bg-white shadow-sm">
          <table className="min-w-[680px] w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Actividad</th>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Tipo</th>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Fecha</th>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Hora</th>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Lugar</th>
                <th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fbfdfb]"}>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] font-semibold text-[var(--text)]">{row.name}</td>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">
                    <span className="inline-flex items-center justify-center rounded-lg border border-[#d7e5dc] bg-[#f2f8f4] px-2 py-1 text-[0.75rem] font-semibold text-[#2f5c46]">{row.type || "Actividad"}</span>
                  </td>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{new Date(row.date).toLocaleDateString("es-CL")}</td>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{row.time || "-"}</td>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{row.place || "-"}</td>
                  <td className="border-b border-[#d8e6dd] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">
                    <span className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${row.status === "Asistido" ? "border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--primary-strong)]" : "border-[var(--status-miss-border)] bg-[var(--status-miss-bg)] text-[#7a2d1f]"}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
