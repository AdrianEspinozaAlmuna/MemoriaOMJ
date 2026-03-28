import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCards from "../components/DashboardCards";
import ActivityCard from "../components/ActivityCard";
import { getDashboardData } from "../services/userViewsService";

const quickActions = [
  { label: "Ver calendario", subtitle: "Todas las actividades", to: "/user/calendario", icon: "calendar", iconClass: "bg-emerald-500" },
  { label: "Crear actividad", subtitle: "Propon una nueva", to: "/user/dashboard", icon: "plus", iconClass: "bg-emerald-800" },
  { label: "Mis actividades", subtitle: "Ver mis inscripciones", to: "/user/mis-actividades", icon: "list", iconClass: "bg-emerald-700" },
  { label: "Mi asistencia", subtitle: "Historial completo", to: "/user/asistencia", icon: "check", iconClass: "bg-emerald-600" }
];

function QuickActionIcon({ name }) {
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "list") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 6h9M10 12h9M10 18h9M5 6h.01M5 12h.01M5 18h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m7.5 12 2.8 2.8L16.8 8.3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  useEffect(() => {
    let mounted = true;

    getDashboardData().then(data => {
      if (!mounted) return;
      setMetrics(data.metrics);
      setUpcomingActivities(data.upcomingActivities);
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
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Inicio</h1>
        <span className="mt-3.5 block h-1 w-[min(190px,44vw)] rounded-full bg-[var(--header-accent)] opacity-45" />
      </header>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Metricas principales</h2>
        <DashboardCards items={metrics} loading={loading} />
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Acciones rapidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => (
            <Link
              key={action.label}
              to={action.to}
              className="relative grid min-h-[100px] content-center gap-1 rounded-xl border border-[#d6e2da] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] px-4 py-5 font-semibold shadow-[0_10px_24px_-24px_rgba(7,42,25,0.5)] transition-[border-color,background,box-shadow] duration-200 before:absolute before:left-0 before:right-0 before:top-0 before:h-[3px] before:rounded-t-xl before:bg-[linear-gradient(90deg,rgba(15,143,78,0.7),rgba(242,215,66,0.62))] before:opacity-65 hover:border-[var(--primary)] hover:bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf7_100%)] hover:shadow-[0_16px_34px_-26px_rgba(11,52,31,0.45)]"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_8px_16px_-14px_rgba(15,143,78,0.72)] ${action.iconClass}`}>
                <QuickActionIcon name={action.icon} />
              </span>
              <span className="text-[0.96rem] text-[var(--text)]">{action.label}</span>
              <small className="text-[0.8rem] font-medium text-[var(--text-muted)]">{action.subtitle}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Proximas actividades</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} actionLabel="Ver mas" />
          ))}
        </div>
      </section>
    </section>
  );
}
