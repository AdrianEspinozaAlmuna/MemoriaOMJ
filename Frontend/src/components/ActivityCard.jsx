import React from "react";
import { BriefcaseBusiness, CalendarDays, Clock3, ImageOff, MapPin, Music2 } from "lucide-react";

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
  return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function PlaceIcon({ className = "h-4 w-4" }) {
  return <MapPin aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function TimeIcon({ className = "h-4 w-4" }) {
  return <Clock3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
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

function getPlaceholderTheme(activity) {
  const category = String(activity.category || "").toLowerCase();
  const title = String(activity.title || "").toLowerCase();
  const label = `${category} ${title}`;

  if (label.includes("baile") || label.includes("danza") || label.includes("musica")) {
    return {
      wrapper: "bg-[linear-gradient(145deg,#d8efe3_0%,#bfe2cd_100%)]",
      ring: "border-[#8ebfa2] bg-white/88 text-[#24593d]",
      chip: "border-[#93c4a7] bg-[#e9f6ee] text-[#2c6245]"
    };
  }

  if (label.includes("workshop") || label.includes("formacion") || label.includes("emprend")) {
    return {
      wrapper: "bg-[linear-gradient(145deg,#e0ebf9_0%,#cbdcf4_100%)]",
      ring: "border-[#95acd0] bg-white/90 text-[#2b4f83]",
      chip: "border-[#9ab2d6] bg-[#ebf2fd] text-[#35598e]"
    };
  }

  return {
    wrapper: "bg-[linear-gradient(145deg,#dbeee2_0%,#c9e3d5_100%)]",
    ring: "border-[#93bfa7] bg-white/88 text-[#2b5a42]",
    chip: "border-[#9bc8af] bg-[#edf8f1] text-[#2f6648]"
  };
}

function PlaceholderIcon({ activity }) {
  const category = String(activity.category || "").toLowerCase();
  const title = String(activity.title || "").toLowerCase();
  const label = `${category} ${title}`;

  if (label.includes("baile") || label.includes("danza") || label.includes("musica")) {
    return <Music2 aria-hidden="true" focusable="false" className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (label.includes("workshop") || label.includes("formacion") || label.includes("emprend")) {
    return <BriefcaseBusiness aria-hidden="true" focusable="false" className="h-5 w-5" strokeWidth={1.9} />;
  }

  return <ImageOff aria-hidden="true" focusable="false" className="h-5 w-5" strokeWidth={1.9} />;
}

export default function ActivityCard({ activity, actionLabel = "Ver mas", onActionClick }) {
  const hasImage = Boolean(activity.image);
  const placeholderTheme = getPlaceholderTheme(activity);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d2dfd8] bg-white shadow-[0_14px_28px_-28px_rgba(10,35,25,0.35)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-24px_rgba(10,35,25,0.42)]">
      <div className="relative h-44 overflow-hidden">
        {hasImage ? (
          <img src={activity.image} alt={activity.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${placeholderTheme.wrapper}`}>
            <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/28" aria-hidden="true" />
            <span className="absolute -left-10 -bottom-12 h-32 w-32 rounded-full bg-black/5" aria-hidden="true" />
            <span className="absolute inset-x-0 top-1/2 h-px bg-white/35" aria-hidden="true" />

            <div className="relative grid justify-items-center gap-2">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-[0_10px_20px_-16px_rgba(0,0,0,0.35)] ${placeholderTheme.ring}`}>
                <PlaceholderIcon activity={activity} />
              </span>
              <span className={`rounded-full border px-3 py-1 text-[0.72rem] font-semibold ${placeholderTheme.chip}`}>
                Imagen pendiente
              </span>
            </div>
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
