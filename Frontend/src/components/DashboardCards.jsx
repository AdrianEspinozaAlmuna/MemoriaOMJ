import React from "react";
import "../styles/user/dashboardCards.css";

function MetricIcon({ metricKey }) {
  if (metricKey === "enrolled" || metricKey === "totalEnrolled") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 5h10M10 12h10M10 19h10M5 6.5l.9.9 1.8-1.8M5 13.5l.9.9 1.8-1.8M5 20.5l.9.9 1.8-1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (metricKey === "monthAttendance" || metricKey === "month" || metricKey === "completed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 4v3M17 4v3M4 9h16M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 16 4-4 3 3 7-7M15 8h4v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardCards({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="dashboard-cards-grid" aria-live="polite">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={`sk-card-${index}`} className="dashboard-card dashboard-card-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-cards-grid">
      {items.map(item => (
        <article key={item.key} className="dashboard-card">
          <div className="dashboard-card-head">
            <p>{item.label}</p>
            <span className={`dashboard-card-icon is-${item.key || "default"}`}>
              <MetricIcon metricKey={item.key} />
            </span>
          </div>
          <h3>{item.value}</h3>
        </article>
      ))}
    </div>
  );
}
