import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ListChecks   , ClipboardCheck , Plus } from "lucide-react";
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
    label: "Gestiona tus eventos",
    subtitle: "Organiza y participa en cada actividad desde un solo lugar.",
    cta: "Ir a mis actividades",
    to: "/user/mis-actividades",
    icon: "list"
  },
  {
    label: "Registro de asistencia",
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
    return <CalendarDays aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  if (name === "plus") {
    return <Plus aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  if (name === "list") {
    return <ListChecks     aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
  }

  return <ClipboardCheck aria-hidden="true" focusable="false" className="h-full w-full" strokeWidth={1.8} />;
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
    <section className="relative animate-[revealUp_0.7s_ease_both]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-left space-y-3">
          <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
          <div>
            <h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Inicio</h1>
            <p className="mt-2 text-[0.93rem] text-[var(--text-muted)]">Revisa tus métricas, accesos directos y próximas actividades en un solo lugar.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(action => (
            <article
              key={action.label}
              className="flex min-h-[220px] flex-col items-center justify-between rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] px-5 py-6 text-center transition-all duration-200 hover:shadow-sm hover:border-[#cde2d5]"
            >
              <span className={`inline-flex h-16 w-16 items-center justify-center ${getQuickIconClass(action.icon)}`}>
                <span className="h-8 w-8">
                  <QuickActionIcon name={action.icon} />
                </span>
              </span>
              <div className="mt-3 flex-1">
                <p className="block text-[0.98rem] font-semibold leading-tight text-[var(--text)] m-0">{action.label}</p>
                <p className="mt-2 block text-[0.8rem] font-medium leading-relaxed text-[var(--text-muted)] m-0">{action.subtitle}</p>
              </div>
              <Link
                to={action.to}
                className="mt-4 inline-flex w-full cursor-pointer justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-all duration-200 hover:bg-[var(--primary-strong)] hover:shadow-sm"
              >
                {action.cta}
              </Link>
            </article>
          ))}
        </div>

        {/* Próximas Actividades */}
        <article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
          <h2 className="m-0 mb-4 text-[1rem] font-semibold text-[var(--text)]">Próximas actividades</h2>
          {upcomingActivities.length === 0 && !loading ? (
            <div className="grid min-h-[140px] place-items-center rounded-lg border border-dashed border-[#e0e9e2] bg-[#f9fcfa] text-center">
              <p className="max-w-[44ch] px-4 text-[0.9rem] text-[var(--text-muted)]">Aún no tienes actividades próximas. Explora el calendario para inscribirte en nuevos talleres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} actionLabel="Ver más" />
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
