import React from "react";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(activity) {
  if (activity.time) return activity.time;
  if (!activity.date) return "Hora por confirmar";

  const parsedDate = new Date(activity.date);
  if (Number.isNaN(parsedDate.getTime())) return "Hora por confirmar";

  const hasExplicitTime = parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0;
  if (!hasExplicitTime) return "Hora por confirmar";

  return parsedDate.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function CalendarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaceIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 1 1 13 0c0 4.8-6.5 10-6.5 10Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimeIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M12 6v6l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getCategory(activity) {
  return activity.category || "Actividad";
}

function getStatus(activity) {
  if (activity.state) return activity.state;
  if (activity.status === "inscrito") return "Inscrito";
  if (activity.status === "disponible") return "Disponible";
  return "Activo";
}

export default function ActivityCard({ activity, actionLabel = "Ver mas", onActionClick }) {
  const hasImage = Boolean(activity.image);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d2dfd8] bg-white shadow-[0_14px_28px_-28px_rgba(10,35,25,0.35)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-24px_rgba(10,35,25,0.42)]">
      <div className="relative h-44 overflow-hidden">
        {hasImage ? (
          <img src={activity.image} alt={activity.title} className="h-full w-full object-cover" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#dbeee2]">
            <span className="absolute -left-7 -top-7 h-20 w-20 rounded-full bg-[#b6dcc4]" aria-hidden="true" />
            <span className="absolute right-6 top-5 h-12 w-12 rounded-full border border-[#c3dacd] bg-white/55" aria-hidden="true" />
            <span className="absolute -bottom-10 right-1/4 h-28 w-28 rounded-full bg-[#c6e4d2]" aria-hidden="true" />
            <span className="absolute bottom-6 left-8 h-2 w-14 rounded-full bg-[#b8d8c7]" aria-hidden="true" />
            <span className="absolute bottom-10 left-10 h-2 w-8 rounded-full bg-[#cae4d6]" aria-hidden="true" />
            <span className="relative rounded-full border border-[#afcdbd] bg-white/85 px-3 py-1 text-[0.74rem] font-semibold text-[#2f5241]">Actividad OMJ</span>
          </div>
        )}

        <div className={`absolute inset-0 ${hasImage ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.62))]" : "bg-transparent"}`} />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[0.74rem] font-semibold text-[#22362b] backdrop-blur-sm">
            {getCategory(activity)}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="inline-flex rounded-full bg-[var(--primary)] px-3 py-1 text-[0.72rem] font-bold text-white">
            {getStatus(activity)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="min-h-[3.2rem] text-[1.08rem] font-bold leading-tight text-[#1c3127]">{activity.title}</h3>

        <div className="mb-5 mt-3 space-y-2">
          <p className="flex items-center gap-2 text-[0.89rem] font-semibold text-[#406354]">
            <CalendarIcon className="h-4 w-4 text-[var(--primary-strong)]" />
            {formatDate(activity.date)}
          </p>
          <p className="flex items-center gap-2 text-[0.89rem] text-[#5f786c]">
            <TimeIcon className="h-4 w-4 text-[var(--primary)]" />
            {formatTime(activity)}
          </p>
          {activity.place && (
            <p className="flex items-center gap-2 text-[0.89rem] text-[#63796d]">
              <PlaceIcon className="h-4 w-4 text-[var(--primary)]" />
              {activity.place}
            </p>
          )}
          <p className="text-[0.8rem] font-medium text-[#5f786c]">Estado: {getStatus(activity)}</p>
        </div>

        <button
          type="button"
          className="mt-auto w-full cursor-pointer rounded-xl bg-[linear-gradient(90deg,var(--primary),var(--primary-strong))] px-4 py-3 text-[0.9rem] font-semibold text-white transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-[1px] hover:brightness-[1.03] hover:shadow-[0_12px_20px_-16px_rgba(6,78,41,0.62)]"
          onClick={() => onActionClick?.(activity)}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
