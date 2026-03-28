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
    <section className="container relative animate-[revealUp_0.7s_ease_both]">
      <header className="pt-1.5 pb-0.5">
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-primary">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Mi asistencia</h1>
        <span className="mt-3.5 block h-1 w-[min(190px,44vw)] rounded-full bg-[var(--header-accent)] opacity-45" />
      </header>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Indicadores principales</h2>
        {loading ? <div className="min-h-[140px] rounded-xl border border-[#d8e3dc] bg-[linear-gradient(180deg,#f9fcfa_0%,#f2f8f4_100%)]" /> : <StatsPanel stats={stats} />}
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Asistencia mensual</h2>
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

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Historial detallado</h2>
        <div className="overflow-x-auto rounded-xl border border-[#d6e2da] bg-white">
          <table className="min-w-[680px] w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Actividad</th>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Tipo</th>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Fecha</th>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Hora</th>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Lugar</th>
                <th className="border-b border-[#e5ece7] bg-[#f5faf7] px-3.5 py-3 text-left text-[0.8rem] font-semibold tracking-[0.01em] text-[#375849]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map(row => (
                <tr key={row.id}>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] font-semibold text-[var(--text)]">{row.name}</td>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">
                    <span className="inline-flex items-center justify-center rounded-lg border border-[#d7e5dc] bg-[#f2f8f4] px-2 py-1 text-[0.75rem] font-semibold text-[#2f5c46]">{row.type || "Actividad"}</span>
                  </td>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{new Date(row.date).toLocaleDateString("es-CL")}</td>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{row.time || "-"}</td>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">{row.place || "-"}</td>
                  <td className="border-b border-[#e5ece7] px-3.5 py-3 text-[0.86rem] text-[var(--text-muted)]">
                    <span className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${row.status === "Asistio" ? "border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--primary-strong)]" : "border-[var(--status-miss-border)] bg-[var(--status-miss-bg)] text-[#7a2d1f]"}`}>{row.status}</span>
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
