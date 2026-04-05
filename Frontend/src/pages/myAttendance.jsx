import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Filter, Search, Star, TrendingUp, UserRound, XCircle } from "lucide-react";
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

function getMonthlyLevel(percent) {
  if (percent >= 85) return "Alto";
  if (percent >= 60) return "Medio";
  return "Bajo";
}

function getProgressColor(percent) {
  const p = Number(percent || 0);
  // Rangos solicitados: 0-29 rojo, 30-69 amarillo, >=70 verde
  if (p <= 29) return "#c42f2f"; // rojo
  if (p <= 69) return "#d97706"; // amarillo más llamativo
  return "var(--primary)"; // primary verde
}

function getDotStatusClass(status = "") {
  const normalized = String(status).toLowerCase();

  if (normalized.includes("asist") || normalized.includes("alto") || normalized.includes("exitos")) {
    return "text-[#1f7c48] before:bg-[#23a45a]";
  }

  if (normalized.includes("medio") || normalized.includes("pend")) {
    return "text-[#9b6a1c] before:bg-[#d8a040]";
  }

  return "text-[#9e3b2f] before:bg-[#db5b4b]";
}

function isAttendedStatus(status = "") {
  const normalized = String(status).toLowerCase();
  return normalized.includes("asist") && !normalized.includes("inasist");
}

function isMissedStatus(status = "") {
  const normalized = String(status).toLowerCase();
  return normalized.includes("inasist") || normalized.includes("ausent");
}

function getAttendanceLabel(status = "") {
  if (isAttendedStatus(status)) return "Asistido";
  if (isMissedStatus(status)) return "No asistido";
  return status || "-";
}

function getFinalStatus(status = "") {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("cancel")) return "Cancelado";
  if (isAttendedStatus(status)) return "Completado";
  return "Finalizado";
}

function getAttendancePillClass(status = "") {
  if (isAttendedStatus(status)) {
    return "border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--primary-strong)]";
  }

  if (isMissedStatus(status)) {
    return "border-[var(--status-miss-border)] bg-[var(--status-miss-bg)] text-[#7a2d1f]";
  }

  return "border-[#d4dbe1] bg-[#f3f4f6] text-[#475569]";
}

function getRowRating(status = "") {
  if (isAttendedStatus(status)) return 5;
  if (isMissedStatus(status)) return 1;
  return 3;
}

function getAttendanceTextClass(status = "") {
  if (isAttendedStatus(status)) return "text-[var(--primary)]";
  if (isMissedStatus(status)) return "text-[#9e3b2f]";
  return "text-[#475569]";
}

function getStatusTextClass(status = "") {
  const final = getFinalStatus(status).toLowerCase();
  if (final.includes("cancel")) return "text-[#9e3b2f]";
  if (final.includes("complet")) return "text-[var(--primary)]";
  return "text-[#475569]";
}
function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-black">{label}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 mb-0 text-[1.7rem] font-bold leading-none text-[var(--primary)]">{value}</p>
      <p className="mt-2 mb-0 text-[0.87rem] text-[var(--text-muted)]">{helper}</p>
    </article>
  );
}

export default function MyAttendance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [history, setHistory] = useState([]);
  const [monthlyQuery, setMonthlyQuery] = useState("");
  const [monthlyFilter, setMonthlyFilter] = useState("todas");
  const [monthlyYear, setMonthlyYear] = useState("all");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("todos");
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;

    getAttendanceData().then(data => {
      if (!mounted) return;
      // Append demo examples if not present to illustrate low attendance and low ratings
      const currentYear = new Date().getFullYear();

      const incomingMonthly = Array.isArray(data.monthly) ? data.monthly.slice() : [];
      const demoMonthKey = "__demo_low_month";
      if (!incomingMonthly.some(m => m._demo === demoMonthKey)) {
        incomingMonthly.push({ month: "Noviembre", data: "1/5 (20%)", year: currentYear, _demo: demoMonthKey });
      }

      const incomingHistory = Array.isArray(data.history) ? data.history.slice() : [];
      const demoNoId = "__demo_no_1";
      const demoLowStarsId = "__demo_lowstars_1";
      if (!incomingHistory.some(h => String(h.id) === demoNoId)) {
        incomingHistory.push({ id: demoNoId, name: "Charla: No asistido (demo)", type: "Charla", date: `${currentYear}-03-10`, time: "10:00", hora_termino: "11:30", place: "Sala Demo", status: "inasistencia", participants: 0, capacity: 30 });
      }
      if (!incomingHistory.some(h => String(h.id) === demoLowStarsId)) {
        incomingHistory.push({ id: demoLowStarsId, name: "Taller: Poca calificación (demo)", type: "Taller", date: `${currentYear}-02-16`, time: "17:30", hora_termino: "19:30", place: "Aula Demo", status: "asistido", rating: 2, participants: 5, capacity: 20 });
      }

      setStats(data.stats || {});
      setMonthly(incomingMonthly);
      setHistory(incomingHistory);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const monthSummary = parseMonthlyData(stats.month);

  const attendanceSummary = useMemo(() => {
    const totalActivities = history.length;
    const attended = history.filter(item => isAttendedStatus(item.status)).length;
    const missed = history.filter(item => isMissedStatus(item.status)).length;

    const rateFromStats = Number.parseInt(String(stats.rate || "").replace("%", ""), 10);
    const computedRate = totalActivities > 0 ? Math.round((attended / totalActivities) * 100) : 0;
    const attendanceRate = Number.isFinite(rateFromStats) ? rateFromStats : computedRate;

    return {
      totalActivities,
      attended,
      missed,
      attendanceRate
    };
  }, [history, stats.rate]);

  const attendanceStatCards = [
    {
      label: "Total actividades",
      value: attendanceSummary.totalActivities,
      helper: "desde inicio del año",
      icon: CalendarDays
    },
    {
      label: "Tasa de asistencia",
      value: `${attendanceSummary.attendanceRate}%`,
      helper: "promedio general",
      icon: TrendingUp
    },
    {
      label: "Asistencias",
      value: attendanceSummary.attended,
      helper: "confirmadas",
      icon: CheckCircle2
    },
    {
      label: "Inasistencias",
      value: attendanceSummary.missed,
      helper: "total",
      icon: XCircle
    }
  ];

  const monthlyRows = useMemo(() => {
    return monthly.map(item => {
      const parsed = parseMonthlyData(item.data);
      return {
        ...item,
        parsed,
        level: getMonthlyLevel(parsed.percent)
      };
    });
  }, [monthly]);

  const filteredMonthlyRows = useMemo(() => {
    return monthlyRows.filter(row => {
      const queryMatch = !monthlyQuery || row.month.toLowerCase().includes(monthlyQuery.toLowerCase());
      const levelMatch = monthlyFilter === "todas" || row.level.toLowerCase() === monthlyFilter;
      const yearMatch = monthlyYear === "all" || String(row.year) === String(monthlyYear);
      return queryMatch && levelMatch && yearMatch;
    });
  }, [monthlyRows, monthlyQuery, monthlyFilter, monthlyYear]);

  const filteredHistory = useMemo(() => {
    return history.filter(row => {
      const searchBlob = `${row.name || ""} ${row.type || ""} ${row.place || ""}`.toLowerCase();
      const queryMatch = !historyQuery || searchBlob.includes(historyQuery.toLowerCase());
      const attendanceLabel = getAttendanceLabel(row.status).toLowerCase();
      const statusMatch = historyStatusFilter === "todos" || attendanceLabel === historyStatusFilter;
      return queryMatch && statusMatch;
    });
  }, [history, historyQuery, historyStatusFilter]);

  useEffect(() => {
    // Reset page when filters or source data change
    setHistoryPage(1);
  }, [historyQuery, historyStatusFilter, history.length]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const historyStartIndex = (historyPage - 1) * PAGE_SIZE;
  const historyEndIndex = Math.min(historyStartIndex + PAGE_SIZE, filteredHistory.length);
  const pagedHistory = filteredHistory.slice(historyStartIndex, historyEndIndex);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis asistencias</h1>
        <p className="mt-2 text-[1rem] text-[var(--text-muted)]">Monitorea tu avance mensual y revisa el detalle de asistencias registradas.</p>
        </div>
      </header>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1.08rem] font-semibold text-[var(--text)]">Indicadores principales</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={`stats-skeleton-${index}`} className="min-h-[100px] rounded-xl border border-[var(--panel-border)] bg-[var(--gray-soft)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {attendanceStatCards.map(item => (
              <StatCard key={item.label} label={item.label} value={item.value} helper={item.helper} icon={item.icon} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
          <h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Asistencia mensual</h2>
          <p className="text-[0.92rem] text-[var(--text-muted)]">Mostrando {filteredMonthlyRows.length} de {monthlyRows.length}</p>
        </div>

        <div className="mb-6 grid items-center gap-4 min-[761px]:grid-cols-[1.25fr_auto]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8176]" />
            <input
              value={monthlyQuery}
              onChange={event => setMonthlyQuery(event.target.value)}
              className="w-full rounded-lg border border-[#d8e6dd] bg-white py-2 pl-9 pr-3 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              placeholder="Buscar mes"
            />
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 min-[761px]:justify-end">
            <label className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text-muted)]">
              <Filter aria-hidden="true" className="h-3.5 w-3.5" />
              Rendimiento:
              <select
                value={monthlyFilter}
                onChange={event => setMonthlyFilter(event.target.value)}
                className="rounded-lg border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              >
                <option value="todas">Todas</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </label>

            <label className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text-muted)]">
              Año:
              <select
                value={monthlyYear}
                onChange={event => setMonthlyYear(event.target.value)}
                className="rounded-lg border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              >
                <option value="all">Todos</option>
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={`monthly-skeleton-${index}`} className="min-h-[64px] rounded-md border border-[#d8e6dd] bg-[#f3f4f6]" />
            ))}
          </div>
        ) : filteredMonthlyRows.length === 0 ? (
          <div className="grid min-h-[150px] place-items-center rounded-md border border-dashed border-[#d8e6dd] bg-[var(--gray-soft)] px-5 text-center">
            <p className="m-0 max-w-[48ch] text-[0.92rem] text-[var(--text-muted)]">Aún no hay datos mensuales de asistencia para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-auto rounded-md">
            <table className="min-w-[900px] w-full text-[0.89rem] bg-white rounded-sm">
              <thead>
                <tr>
                  <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Mes</th>
                  <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Año</th>
                  <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Avance</th>
                  <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonthlyRows.map(row => (
                  <tr key={row.month}>
                    <td className="border-b border-[#d8e6dd] px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                        <p className="m-0 text-[0.9rem] text-[var(--text)]">{row.month}</p>
                      </div>
                    </td>
                    <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.year || "-"}</td>
                    <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">
                      {row.parsed.done}/{row.parsed.total}
                    </td>
                    <td className="border-b border-[#d8e6dd] px-3 py-3">
                      <div className="max-w-[200px]">
                        <p className="m-0 text-[0.83rem] font-semibold text-[var(--text)]">{row.parsed.percent}%</p>
                        <div className="mt-1.5 h-[0.4rem] w-full overflow-hidden rounded-full bg-[#d9e4dc]" aria-hidden="true">
                          <span
                            className="block h-full rounded-[inherit]"
                            style={{ width: `${row.parsed.percent}%`, background: getProgressColor(row.parsed.percent) }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
          <h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Historial detallado</h2>
          <p className="text-[0.92rem] text-[var(--text-muted)]">Mostrando {filteredHistory.length} de {history.length}</p>
        </div>

        <div className="mb-6 grid items-center gap-4 min-[761px]:grid-cols-[1.25fr_auto]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8176]" />
            <input
              value={historyQuery}
              onChange={event => setHistoryQuery(event.target.value)}
              className="w-full rounded-lg border border-[#d8e6dd] bg-white py-2 pl-9 pr-3 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              placeholder="Buscar en historial"
            />
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 min-[761px]:justify-end">
            <label className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text-muted)]">
              <Filter aria-hidden="true" className="h-3.5 w-3.5" />
              Asistencia:
              <select
                value={historyStatusFilter}
                onChange={event => setHistoryStatusFilter(event.target.value)}
                className="rounded-lg border border-[#d8e6dd] bg-white px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              >
                <option value="todos">Todos</option>
                <option value="asistido">Asistido</option>
                <option value="no asistido">No asistido</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`history-skeleton-${index}`} className="min-h-[44px] rounded-md border border-[#d8e6dd] bg-[#f3f4f6]" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="grid min-h-[150px] place-items-center rounded-md border border-dashed border-[#d8e6dd] bg-[var(--gray-soft)] px-5 text-center">
            <p className="m-0 max-w-[50ch] text-[0.92rem] text-[var(--text-muted)]">Todavía no hay asistencias registradas en tu historial.</p>
          </div>
        ) : (
          <>
          <div className="overflow-auto rounded-md">
          <table className="min-w-[920px] w-full text-[0.89rem] bg-white rounded-sm">
            <thead>
                <tr>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Actividad</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Asistencia</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Estado</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Calificacion</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Fecha</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Hora</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Lugar</th>
                <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map(row => (
                <tr key={row.id}>
                  <td className="border-b border-[#d8e6dd] px-3 py-3">
                    <p className="m-0 text-[0.9rem] text-[var(--text)]">{row.name}</p>
                  </td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3">
                    <span className={`text-[0.9rem] ${getAttendanceTextClass(row.status)}`}>{getAttendanceLabel(row.status)}</span>
                  </td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{getFinalStatus(row.status)}</td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3">
                    <div className="inline-flex items-center gap-0.5" aria-label={`Calificacion ${getRowRating(row.status)} de 5`}>
                      {(() => {
                        const rating = Number.isFinite(Number(row.rating)) ? Number(row.rating) : getRowRating(row.status);
                        return Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${row.id}-star-${index}`}
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 ${index < rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#cbd5e1]"}`}
                          />
                        ));
                      })()}
                    </div>
                  </td>
                  
                  <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{new Date(row.date).toLocaleDateString("es-CL")}</td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.time || "-"}</td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.place || "-"}</td>
                  <td className="border-b border-[#d8e6dd] px-3 py-3">
                    <Link
                      to={`/user/actividad/${row.id}`}
                      className="inline-flex rounded-sm border border-transparent bg-[var(--primary)] px-3 py-1.5 text-[0.82rem] font-semibold transition-opacity duration-150 hover:opacity-90"
                      style={{ color: '#ffffff' }}
                    >
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
          <span>
            {filteredHistory.length === 0
              ? `Mostrando 0-0 de 0`
              : `Mostrando ${historyStartIndex + 1}-${historyEndIndex} de ${filteredHistory.length}`}
          </span>

          {filteredHistory.length > PAGE_SIZE && (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage <= 1}
                className={`cursor-pointer rounded-sm border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold ${historyPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'text-[#496053]'}`}
              >
                Anterior
              </button>

              <button
                type="button"
                className="cursor-default rounded-sm px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]"
                aria-current="page"
              >
                {historyPage}
              </button>

              <button
                type="button"
                onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                disabled={historyPage >= totalHistoryPages}
                className={`cursor-pointer rounded-sm border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold ${historyPage >= totalHistoryPages ? 'opacity-50 cursor-not-allowed' : 'text-[#496053]'}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        </>
        )}
      </section>
    </section>
  );
}
