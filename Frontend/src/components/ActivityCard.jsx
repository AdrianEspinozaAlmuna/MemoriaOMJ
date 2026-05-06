import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, CircleDot, Clock3, PlayCircle, MapPin, UserRound, Users, XCircle } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { formatDateForChile, parseDateForChile } from "../utils/chileDate";

function formatDate(dateValue) {
  return formatDateForChile(dateValue, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(activity) {
  if (activity.time) return activity.time;
  if (!activity.date) return "Hora por confirmar";

  const parsedDate = parseDateForChile(activity.date);
  if (!parsedDate) return "Hora por confirmar";

  const hasExplicitTime = parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0;
  if (!hasExplicitTime) return "Hora por confirmar";

  return parsedDate.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatTimeRange(activity) {
  // Try several possible field names for start/end times
  const start = activity.hora_inicio || activity.startTime || activity.start || activity.time || null;
  const end = activity.hora_termino || activity.endTime || activity.end || activity.finish || null;

  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  // fallback to previous formatTime
  return formatTime(activity);
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
  if (activity.state === "en_curso") return "En curso";
  if (activity.state === "programada") return "Programada";
  if (activity.state === "finalizada") return "Finalizada";
  if (activity.state === "pendiente") return "Pendiente";
    if (activity.state === "rechazada") return "Rechazada";
    if (activity.state === "cancelada") return "Cancelada";
  if (activity.state) return String(activity.state);
  if (activity.status === "inscrito") return "Inscrito";
  if (activity.status === "disponible") return "Disponible";
  return "Activo";
}

function getStatusIcon(activity) {
  const status = String(activity.state || activity.status || "").toLowerCase();

  if (status === "programada") return CheckCircle2;
  if (status === "en_curso") return PlayCircle;
  if (status === "finalizada") return CheckCircle2;
    if (status === "rechazada") return XCircle;
    if (status === "cancelada") return XCircle;
  if (status === "pendiente") return Clock3;
  if (status === "inscrito") return CheckCircle2;

  return Clock3;
}

function getStatusClasses(activity) {
  const status = String(activity.state || activity.status || "").toLowerCase();

  if (status === "pendiente") {
    return "bg-[#fff4de] text-[#a86612]";
  }

  if (status === "programada") {
    return "bg-[#e7f5ec] text-[#177945]";
  }

  if (status === "en_curso") {
    return "bg-[#e9f3ff] text-[#1d4f91]";
  }

  if (status === "finalizada") {
    return "bg-[#f1f3f5] text-[#475467]";
  }

    if (status === "rechazada") {
      return "bg-[#fff1ed] text-[#8a3b2a]";
    }

    if (status === "cancelada") {
    return "bg-[#fff1ed] text-[#8a3b2a]";
  }

  if (status === "inscrito") {
    return "bg-[#e8f5ff] text-[#1f5f8b]";
  }

  return "bg-[var(--primary)]/10 text-[var(--primary-strong)]";
}

function getTopLabel(activity) {
  if (activity.category) return activity.category;
  if (activity.type) return activity.type;
  return "Actividad";
}

function CardBody({ activity, actionLabel, emphasizeEnrollment = false }) {
  const creator = getCreator(activity);
  const description = getDescription(activity);
  const placeLabel = activity.place || "Lugar por confirmar";
  const enrolled = activity.enrolled ?? activity.participants ?? activity.inscritos ?? null;
  const capacity = activity.capacity ?? activity.max_participantes ?? activity.capacidad ?? null;
  const imageSrc = activity.image || activity.imageUrl || activity.img || null;
  const StatusIcon = getStatusIcon(activity);
  const isEnrolled = String(activity?.status || "").toLowerCase() === "inscrito";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-[10px] bg-[#f3f4f6] sm:h-28 sm:w-44">
          {imageSrc ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={imageSrc} alt={`Imagen ${activity.title}`} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[0.82rem] text-[var(--text-muted)]">Imagen</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-[1.06rem] font-semibold leading-tight text-[var(--text)] max-[760px]:text-[1rem]">{activity.title}</h3>
                {emphasizeEnrollment && isEnrolled && (
                  <span className="inline-flex items-center gap-1 rounded-sm border border-[#b9dfc8] bg-[#edf9f1] px-2 py-0.5 text-[0.69rem] font-semibold text-[#177945]">
                    <CircleDot className="h-3.5 w-3.5" strokeWidth={2} />
                    Ya inscrito
                  </span>
                )}
              </div>
              <p className="m-0 inline-flex items-center gap-2 text-[0.85rem] text-[var(--text-muted)]">
                <UserRound className="h-3 w-3 text-[var(--primary)]" strokeWidth={1.9} />
                {creator}
              </p>
            </div>

            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-1 text-[0.72rem] font-semibold ${getStatusClasses(activity)}`}>
              <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
              {getStatus(activity)}
            </span>
          </div>

          <p className="mt-1 mb-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{description}</p>

          <div className="mt-3 border-t border-[#e8f0ea] pt-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.85rem] font-medium text-[var(--text)] max-[760px]:text-[0.82rem]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                  {formatTimeRange(activity)}
                </p>
                {(enrolled !== null || capacity !== null) && (
                  <p className="m-0 inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--primary)]" />
                    {capacity ? `${enrolled ?? 0}/${capacity} inscritos` : `${enrolled ?? 0} inscritos`}
                  </p>
                )}
              </div>

              <div className="ml-auto inline-flex items-center gap-1 text-[1rem] font-medium text-[var(--primary)] max-[760px]:w-full max-[760px]:justify-end">
                <span className="inline-block border-b-2 border-transparent transition-colors duration-200 group-hover:border-[var(--primary)]">{actionLabel}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ActivityCard({ activity, actionLabel = "Ver más", onActionClick, to, emphasizeEnrollment = false }) {
  const resolvedTo = onActionClick ? null : (to || (activity?.id ? `/user/actividad/${activity.id}` : null));
  const baseClassName =
    "group block relative w-full rounded-sm border border-[#d8e3de] bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--primary-soft)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";

  if (resolvedTo) {
    return (
      <Link to={resolvedTo} className={baseClassName}>
        <CardBody activity={activity} actionLabel={actionLabel} emphasizeEnrollment={emphasizeEnrollment} />
      </Link>
    );
  }

  if (onActionClick) {
    return (
      <button type="button" className={baseClassName} onClick={() => onActionClick(activity)}>
        <CardBody activity={activity} actionLabel={actionLabel} emphasizeEnrollment={emphasizeEnrollment} />
      </button>
    );
  }

  return (
    <article className={baseClassName}>
      <CardBody activity={activity} actionLabel={actionLabel} emphasizeEnrollment={emphasizeEnrollment} />
    </article>
  );
}
