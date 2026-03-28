import React, { useEffect, useState } from "react";
import DashboardCards from "../components/DashboardCards";
import ActivityCard from "../components/ActivityCard";
import { getMyActivitiesData, getMyActivitiesSummary } from "../services/userViewsService";

function CompletedActivity({ activity }) {
  return (
    <article className="rounded-xl border border-[#d7e3db] bg-[linear-gradient(180deg,#ffffff_0%,#f9fcfa_100%)] p-4 shadow-[0_10px_24px_-26px_rgba(8,38,23,0.5)]">
      <h3 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">{activity.title}</h3>
      <p className="mt-2 text-[0.85rem] text-[var(--text-muted)]">{new Date(activity.date).toLocaleDateString("es-CL")}</p>
      <p className="mt-2 text-[0.85rem] text-[var(--text-muted)]">{activity.place}</p>
      <span className={`mt-3 inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${activity.attended ? "border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--primary-strong)]" : "border-[var(--status-miss-border)] bg-[var(--status-miss-bg)] text-[#7a2d1f]"}`}>
        {activity.attended ? "Asistio" : "No asistio"}
      </span>
    </article>
  );
}

export default function MyActivities() {
  const [loading, setLoading] = useState(true);
  const [summaryCards, setSummaryCards] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getMyActivitiesSummary(), getMyActivitiesData()]).then(([summaryData, activitiesData]) => {
      if (!mounted) return;
      setSummaryCards(summaryData.cards);
      setUpcoming(activitiesData.upcoming);
      setCompleted(activitiesData.completed);
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
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Mis actividades</h1>
        <span className="mt-3.5 block h-1 w-[min(190px,44vw)] rounded-full bg-[var(--header-accent)] opacity-45" />
      </header>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Resumen</h2>
        <DashboardCards items={summaryCards} loading={loading} />
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Proximas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map(activity => (
            <ActivityCard key={activity.id} activity={activity} actionLabel="Ver mas" />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Completadas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {completed.map(activity => (
            <CompletedActivity key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </section>
  );
}
