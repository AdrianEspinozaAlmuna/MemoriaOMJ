import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { ArrowRight } from "lucide-react";

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

function getTopLabel(activity) {
  if (activity.category) return activity.category;
  if (activity.type) return activity.type;
  return "Actividad";
}

function CardBody({ activity, actionLabel }) {
  const creator = getCreator(activity);
  const description = getDescription(activity);
  const placeLabel = activity.place || "Lugar por confirmar";

  return (
    <>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="m-0 text-[1.06rem] font-semibold leading-tight text-[var(--text)] max-[760px]:text-[1rem]">{activity.title}</h3>
            <p className="mt-1 text-[0.85rem] text-[var(--text-muted)] inline-flex items-center gap-2">
              <UserRound className="h-3 w-3 text-[var(--primary)]" strokeWidth={1.9} />
              {creator}
            </p>
          </div>

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-md bg-[var(--primary)]/10 px-3 py-1 text-[0.72rem] font-semibold text-[var(--primary-strong)]">
              {getStatus(activity)}
            </span>
          </div>
        </div>
        <p className="mt-1 mb-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{description}</p>

        <div className="mt-2 flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.85rem] font-medium text-[var(--text)] max-[760px]:text-[0.82rem]">
            <p className="m-0 inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[var(--primary)]" />
              {formatDate(activity.date)}
            </p>
            <p className="m-0 inline-flex items-center gap-2">
              <PlaceIcon className="h-4 w-4 text-[var(--primary)]" />
              {placeLabel}
            </p>
            <p className="m-0 inline-flex items-center gap-2">
              <TimeIcon className="h-4 w-4 text-[var(--primary)]" />
              {formatTime(activity)}
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1 text-[1rem] font-medium text-[var(--primary)] max-[760px]:self-end">
            <span className="inline-block border-b-2 border-transparent transition-colors duration-200 group-hover:border-[var(--primary-soft)]">{actionLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ActivityCard({ activity, actionLabel = "Ver más", onActionClick, to }) {
  const resolvedTo = to || (activity?.id ? `/user/actividad/${activity.id}` : null);
    const baseClassName =
      "group block relative w-full rounded-sm border border-[#d8e3de] bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--primary-soft)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";

  if (resolvedTo) {
    return (
      <Link to={resolvedTo} className={baseClassName}>
        <CardBody activity={activity} actionLabel={actionLabel} />
      </Link>
    );
  }

  if (onActionClick) {
    return (
      <button type="button" className={baseClassName} onClick={() => onActionClick(activity)}>
        <CardBody activity={activity} actionLabel={actionLabel} />
      </button>
    );
  }

  return (
    <article className={baseClassName}>
      <CardBody activity={activity} actionLabel={actionLabel} />
    </article>
  );
}
