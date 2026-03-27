import React from "react";
import "../styles/user/activityCard.css";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function ActivityCard({ activity, actionLabel = "Ver mas", onActionClick }) {
  return (
    <article className="activity-tile">
      <h3>{activity.title}</h3>
      <p className="activity-tile-date">{formatDate(activity.date)}</p>
      {activity.place && <p className="activity-tile-place">{activity.place}</p>}
      <button type="button" className="btn btn-ghost btn-inline" onClick={() => onActionClick?.(activity)}>
        {actionLabel}
      </button>
    </article>
  );
}
