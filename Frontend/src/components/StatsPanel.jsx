import React from "react";
import "../styles/user/statsPanel.css";

function StatIcon({ statKey }) {
  if (statKey === "rate") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m5 16 4-4 3 3 7-7M15 8h4v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (statKey === "total") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="m7.5 12 2.8 2.8L16.8 8.3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (statKey === "month") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 4v3M17 4v3M4 9h16M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 8.6c-4.2 0-7.6 2.2-7.6 4.9v.5h15.2V19c0-2.7-3.4-4.9-7.6-4.9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function splitValue(statKey, value) {
  if (statKey !== "month" || typeof value !== "string") {
    return { main: value || "-", note: "" };
  }

  const match = value.match(/^(.*?)\s*\((.*?)\)$/);
  if (!match) {
    return { main: value || "-", note: "" };
  }

  return {
    main: match[1].trim(),
    note: match[2].trim()
  };
}

export default function StatsPanel({ stats = {} }) {
  const statItems = [
    { key: "rate", label: "Tasa de asistencia", value: stats.rate },
    { key: "total", label: "Total asistencias", value: stats.total },
    { key: "month", label: "Este mes", value: stats.month },
    { key: "streak", label: "Racha actual", value: stats.streak }
  ];

  return (
    <div className="stats-panel-grid">
      {statItems.map(item => (
        <article key={item.key} className="stats-item">
          <div className="stats-item-top">
            <p>{item.label}</p>
            <span className={`stats-item-icon is-${item.key}`}>
              <StatIcon statKey={item.key} />
            </span>
          </div>
          <h3>{splitValue(item.key, item.value).main}</h3>
          {splitValue(item.key, item.value).note && <small>{splitValue(item.key, item.value).note}</small>}
        </article>
      ))}
    </div>
  );
}
