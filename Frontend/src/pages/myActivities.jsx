import React, { useEffect, useState } from "react";
import DashboardCards from "../components/DashboardCards";
import ActivityCard from "../components/ActivityCard";
import { getMyActivitiesData, getMyActivitiesSummary } from "../services/userViewsService";
import "../styles/myActivities.css";

function CompletedActivity({ activity }) {
  return (
    <article className="completed-activity-card">
      <h3>{activity.title}</h3>
      <p>{new Date(activity.date).toLocaleDateString("es-CL")}</p>
      <p>{activity.place}</p>
      <span className={activity.attended ? "status-ok" : "status-miss"}>
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
    <section className="user-page container reveal-up">
      <header className="user-page-header">
        <p className="eyebrow">Panel de usuario</p>
        <h1>Mis actividades</h1>
      </header>

      <section className="user-section">
        <h2>Resumen</h2>
        <DashboardCards items={summaryCards} loading={loading} />
      </section>

      <section className="user-section">
        <h2>Proximas</h2>
        <div className="user-activity-grid">
          {upcoming.map(activity => (
            <ActivityCard key={activity.id} activity={activity} actionLabel="Ver mas" />
          ))}
        </div>
      </section>

      <section className="user-section">
        <h2>Completadas</h2>
        <div className="completed-grid">
          {completed.map(activity => (
            <CompletedActivity key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </section>
  );
}
