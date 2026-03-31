import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCards from "../components/DashboardCards";
import { getMyActivitiesData, getMyActivitiesSummary } from "../services/userViewsService";

function CompletedActivity({ activity }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[#d7e3db] bg-[linear-gradient(180deg,#ffffff_0%,#f9fcfa_100%)] p-4 shadow-[0_10px_24px_-26px_rgba(8,38,23,0.5)]">
      <h3 className="m-0 min-h-[2.8rem] text-[0.95rem] font-semibold leading-tight text-[var(--text)]">{activity.title}</h3>
      <p className="mt-2 text-[0.85rem] text-[var(--text-muted)]">{new Date(activity.date).toLocaleDateString("es-CL")}</p>
      <p className="mt-2 text-[0.85rem] text-[var(--text-muted)]">{activity.place}</p>
      <span className={`mt-auto inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${activity.attended ? "border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--primary-strong)]" : "border-[var(--status-miss-border)] bg-[var(--status-miss-bg)] text-[#7a2d1f]"}`}>
        {activity.attended ? "Asistio" : "No asistio"}
      </span>
      <Link to={`/user/actividad/${activity.id}`} className="mt-2 inline-flex justify-center rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-3 py-1.5 text-xs font-semibold text-[#1f5137] transition-colors duration-150 hover:bg-[#ebf7f0]">
        Ver detalle
      </Link>
    </article>
  );
}

export default function MyActivities() {
  const [loading, setLoading] = useState(true);
  const [summaryCards, setSummaryCards] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getMyActivitiesSummary(), getMyActivitiesData()]).then(([summaryData, activitiesData]) => {
      if (!mounted) return;
      setSummaryCards(summaryData.cards);
      setCompleted(activitiesData.completed);
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
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis actividades</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Consulta tus actividades inscritas, el historial completado y tu resumen general.</p>
      </header>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1rem] font-semibold text-[var(--text)]">Resumen</h2>
        <DashboardCards items={summaryCards} loading={loading} />
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <h2 className="mb-4 mt-0 text-[1rem] font-semibold text-[var(--text)]">Completadas</h2>
        {completed.length === 0 && !loading ? (
          <div className="grid min-h-[128px] place-items-center rounded-lg border border-dashed border-[#d8e6dd] bg-[#f9fbfa] text-center">
            <p className="max-w-[44ch] px-4 text-[0.9rem] text-[var(--text-muted)]">Aun no hay actividades completadas para mostrar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completed.map(activity => (
              <CompletedActivity key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
