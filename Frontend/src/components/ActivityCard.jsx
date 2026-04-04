import React from "react";
import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";

function formatDate(dateValue) {
  if (!dateValue) return "Fecha por confirmar";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "Fecha por confirmar";

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
  return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function PlaceIcon({ className = "h-4 w-4" }) {
  return <MapPin aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function TimeIcon({ className = "h-4 w-4" }) {
  return <Clock3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function getCreator(activity) {
  return activity.manager || activity.createdBy || activity.author || "OMJ Curicó";
}

function getDescription(activity) {
  if (activity.description) return activity.description;

  return "Encuentro organizado por la OMJ.";
}

function getStatus(activity) {
  if (activity.state) return activity.state;
  if (activity.status === "inscrito") return "Inscrito";
  if (activity.status === "disponible") return "Disponible";
  return "Activo";
}

export default function ActivityCard({ activity, actionLabel = "Ver mas", onActionClick }) {
  const creator = getCreator(activity);
  const description = getDescription(activity);
  const placeLabel = activity.place || "Lugar por confirmar";

  return (
    <article className="shadow-sm group flex h-full flex-col rounded-2xl border border-[#d8e6dd] bg-white p-5 shadow-[0_12px_26px_-28px_rgba(10,35,25,0.4)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[2px] hover:border-[#bdd4c5] hover:shadow-[0_18px_30px_-26px_rgba(10,35,25,0.45)]">
      <header className="flex min-h-[2.4rem] items-start justify-between gap-3">
        <span className="inline-flex items-center rounded-[8px] border border-[#d1e3d7] bg-[#f5faf7] px-2.5 py-1 text-[0.74rem] font-semibold text-[#315644]">
          <UserRound className="mr-1.5 h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.9} />
          {creator}
        </span>
        <span className="inline-flex rounded-[8px] bg-[var(--primary)] px-2.5 py-1 text-[0.72rem] font-bold text-white">
          {getStatus(activity)}
        </span>
      </header>

      <div className="mt-4 min-h-[3.5rem]">
        <h3 className="min-h-[3.5rem] overflow-hidden text-[1.5rem] font-bold leading-[1.14] tracking-[-0.01em] text-[#162a21] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{activity.title}</h3>
        <p className="mt-2 min-h-[1rem] overflow-hidden text-[0.9rem] leading-relaxed text-[#5b7367] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{description}</p>
      </div>

      <div className="mt-5 space-y-2 border-t border-[#e4ece7] pt-4">
        <p className="flex items-center gap-2 text-[0.88rem] text-[#456556]">
          <CalendarIcon className="h-4 w-4 text-[var(--primary-strong)]" />
          {formatDate(activity.date)}
        </p>
        <p className="flex items-center gap-2 text-[0.88rem] text-[#456556]">
          <TimeIcon className="h-4 w-4 text-[var(--primary)]" />
          {formatTime(activity)}
        </p>
        <p className="flex items-center gap-2 text-[0.88rem] text-[#456556]">
          <PlaceIcon className="h-4 w-4 text-[var(--primary)]" />
          {placeLabel}
        </p>
      </div>

      <button
        type="button"
        className="mt-5 w-full cursor-pointer rounded-xl bg-[var(--primary)] px-4 py-3 text-[0.92rem] font-semibold text-white transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:bg-[var(--primary-strong)] hover:shadow-[0_12px_20px_-16px_rgba(6,78,41,0.6)]"
        onClick={() => onActionClick?.(activity)}
      >
        {actionLabel}
      </button>
    </article>
  );
}
