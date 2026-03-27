import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCards from "../components/DashboardCards";
import ActivityCard from "../components/ActivityCard";
import { getDashboardData } from "../services/userViewsService";
import "../styles/userDashboard.css";

const quickActions = [
  { label: "Ver calendario", subtitle: "Todas las actividades", to: "/user/calendario", icon: "calendar" },
  { label: "Crear actividad", subtitle: "Propon una nueva", to: "/user/dashboard", icon: "plus" },
  { label: "Mis actividades", subtitle: "Ver mis inscripciones", to: "/user/mis-actividades", icon: "list" },
  { label: "Mi asistencia", subtitle: "Historial completo", to: "/user/asistencia", icon: "check" }
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
    <section className="user-page container reveal-up">
      <header className="user-page-header">
        <p className="eyebrow">Panel de usuario</p>
        <h1>Inicio</h1>
      </header>

      <section className="user-section">
        <h2>Metricas principales</h2>
        <DashboardCards items={metrics} loading={loading} />
      </section>

      <section className="user-section">
        <h2>Acciones rapidas</h2>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <Link key={action.label} to={action.to} className="quick-action-card">
              <span className={`quick-action-icon is-${action.icon}`}>
                <QuickActionIcon name={action.icon} />
              </span>
              <span>{action.label}</span>
              <small>{action.subtitle}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="user-section">
        <h2>Proximas actividades</h2>
        <div className="user-activity-grid">
          {upcomingActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} actionLabel="Ver mas" />
          ))}
        </div>
      </section>
    </section>
  );
}
