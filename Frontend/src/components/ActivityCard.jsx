import React from "react";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function ActivityCard({ activity, actionLabel = "Ver mas", onActionClick }) {
  return (
    <article className="rounded-xl border border-[#d5e2da] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfa_100%)] p-4 shadow-[0_10px_24px_-26px_rgba(9,38,23,0.45)] transition-[border-color,box-shadow] duration-200 hover:border-[#bfd5c8] hover:shadow-[0_14px_28px_-24px_rgba(9,38,23,0.42)]">
      <h3 className="m-0 text-[1.02rem] font-semibold text-[#22392d]">{activity.title}</h3>
      <p className="mt-2 text-[0.88rem] text-[#6f8177]">{formatDate(activity.date)}</p>
      {activity.place && <p className="mt-2 text-[0.88rem] text-[#6f8177]">{activity.place}</p>}
      <button type="button" className="btn btn-ghost btn-inline mt-3 w-full rounded-lg text-[0.88rem]" onClick={() => onActionClick?.(activity)}>
        {actionLabel}
      </button>
    </article>
  );
}
