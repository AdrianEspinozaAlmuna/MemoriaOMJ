import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import { getDashboardData } from "../services/userViewsService";

const quickActions = [
  {
    label: "Agenda al dia",
    subtitle: "Revisa fechas clave y reserva tu proximo lugar en segundos.",
    cta: "Ir al calendario",
    to: "/user/calendario",
    icon: "calendar"
  },
  {
    label: "Crea algo nuevo",
    subtitle: "Quieres crear una actividad? Publicala ahora y suma participantes.",
    cta: "Crear una actividad",
    to: "/user/crear-actividad",
    icon: "plus"
  },
  {
    label: "Impulsa tus planes",
    subtitle: "Gestiona tus inscripciones y sigue cada actividad desde un solo lugar.",
    cta: "Ir a mis actividades",
    to: "/user/mis-actividades",
    icon: "list"
  },
  {
    label: "Tu progreso real",
    subtitle: "Controla tu asistencia completa y mantente siempre al dia.",
    cta: "Ver mi asistencia",
    to: "/user/asistencia",
    icon: "check"
  }
];

function getQuickIconClass(name) {
  if (name === "calendar") return "text-[#128645]";
  if (name === "plus") return "text-[#0da14d]";
  if (name === "list") return "text-[#177f46]";
  return "text-[#149350]";
}

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
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  useEffect(() => {
    let mounted = true;

    getDashboardData().then(data => {
      if (!mounted) return;
      setUpcomingActivities(data.upcomingActivities);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="container relative animate-[revealUp_0.7s_ease_both] pb-2">
      <header className="pt-1.5 pb-0.5">
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Inicio</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Revisa tus metricas, accesos directos y proximas actividades en un solo lugar.</p>
        <span className="mt-3.5 block h-1 w-[min(190px,44vw)] rounded-full bg-[var(--header-accent)] opacity-45" />
      </header>

      <section className="mt-6">
        <div className="rounded-[10px]  p-2.5 sm:p-1">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(action => (
            <article
              key={action.label}
              className="group flex min-h-[230px] flex-col items-center justify-between rounded-[10px] border border-[#e5e7eb] bg-[#fbfdfc] px-4 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#d5ded8] hover:bg-white"
            >
              <span className={`inline-flex h-20 w-20 items-center justify-center ${getQuickIconClass(action.icon)}`}>
                <span className="h-9 w-9">
                  <QuickActionIcon name={action.icon} />
                </span>
              </span>
              <div className="mt-3 flex-1">
                <span className="block text-[1rem] font-semibold leading-tight text-[var(--text)]">{action.label}</span>
                <small className="mt-1.5 block text-[0.77rem] font-medium leading-relaxed text-[#5d6d66]">{action.subtitle}</small>
              </div>
              <Link
                to={action.to}
                className="mt-4 inline-flex w-full cursor-pointer justify-center rounded-[10px] bg-[var(--primary)] px-4 py-2 text-[0.83rem] font-semibold !text-white transition-all duration-200 hover:bg-[var(--primary-strong)] hover:!text-white visited:!text-white focus:!text-white active:!text-white hover:shadow-sm"
              >
                {action.cta}
              </Link>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <h2 className="mb-5 mt-0 inline-flex items-center gap-2 text-[1.1rem] font-bold text-[var(--text)] before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[linear-gradient(135deg,var(--primary)_0%,#45b373_100%)]">Proximas actividades</h2>
        {upcomingActivities.length === 0 && !loading ? (
          <div className="grid min-h-[132px] place-items-center rounded-xl border border-dashed border-[#cdded3] bg-[#f9fcfa] text-center">
            <p className="max-w-[44ch] px-4 text-[0.9rem] text-[var(--text-muted)]">Aun no tienes actividades proximas. Explora el calendario para inscribirte en nuevos talleres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} actionLabel="Ver mas" />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
