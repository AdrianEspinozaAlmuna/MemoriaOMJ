import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, LayoutGrid, MapPin, Rows3, UserRound, Users } from "lucide-react";
import Modal from "./Modal";
import { parseDateForChile } from "../utils/chileDate";

// Demo images fallback (used when activity has no image)
const DEMO_PICS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80"
];

function pickDemoImage(activity) {
  if (!activity) return DEMO_PICS[0];
  const i = (activity.title?.length || 1) % DEMO_PICS.length;
  return DEMO_PICS[i];
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(sourceDate, compareDate) {
  if (!compareDate) return false;

  if (compareDate instanceof Date) {
    return formatDateKey(sourceDate) === formatDateKey(compareDate);
  }

  return formatDateKey(sourceDate) === String(compareDate).slice(0, 10);
}

function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function extractTimeLabel(activity) {
  if (activity.time) return activity.time;
  if (!activity.date) return "Sin hora";

  if (typeof activity.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(activity.date)) {
    return "Sin hora";
  }

  const parsedDate = parseDateForChile(activity.date);
  if (!parsedDate) return "Sin hora";

  const hasExplicitTime = parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0;
  if (!hasExplicitTime) return "Sin hora";

  return parsedDate.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getTimeSortValue(activity) {
  const timeLabel = extractTimeLabel(activity);
  const match = timeLabel.match(/(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return (hours * 60) + minutes;
}

function getGroupHourLabel(activity) {
  const timeLabel = extractTimeLabel(activity);
  const match = timeLabel.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : "Sin hora";
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

function getActivityStatus(activity) {
  const state = String(activity.state || "").toLowerCase();
  if (state === "en_curso") return "En curso";
  if (state === "programada") return "Programada";
  if (state === "finalizada") return "Finalizada";
  if (state === "pendiente") return "Pendiente";
  if (state === "rechazada") return "Rechazada";
  if (state === "cancelada") return "Cancelada";
  if (activity.state) return String(activity.state);
  if (activity.status === "inscrito") return "Inscrito";
  if (activity.status === "disponible") return "Disponible";
  return "Activo";
}

function getActivityStatusClass(activity) {
  const status = String(activity.state || activity.status || "").toLowerCase();

  if (status === "pendiente") return "border-[#f3d39a] bg-[#fff4de] text-[#a86612]";
  if (status === "programada") return "border-[#bfe4cd] bg-[#e7f5ec] text-[#177945]";
  if (status === "en_curso") return "border-[#bfd9f5] bg-[#e9f3ff] text-[#1d4f91]";
  if (status === "finalizada") return "border-[#d5dae1] bg-[#f1f3f5] text-[#475467]";
  if (status === "rechazada") return "border-[#f1c8be] bg-[#fff1ed] text-[#8a3b2a]";
  if (status === "cancelada") return "border-[#f1c8be] bg-[#fff1ed] text-[#8a3b2a]";
  if (status === "inscrito") return "border-[#9ec9ea] bg-[#e8f5ff] text-[#1f5f8b]";
  if (status === "disponible") return "border-[#bfe4cd] bg-[#e7f5ec] text-[#177945]";

  return "border-[#d8e6dd] bg-white text-[#496053]";
}

function getActivityCreator(activity) {
  return activity.manager || activity.createdBy || activity.author || "OMJ Curico";
}

function getActivityParticipants(activity) {
  const enrolled = activity.enrolled ?? activity.participants ?? activity.inscritos ?? null;
  const capacity = activity.capacity ?? activity.max_participantes ?? activity.capacidad ?? null;

  if (enrolled === null && capacity === null) return null;
  if (capacity) return `${enrolled ?? 0}/${capacity} inscritos`;
  return `${enrolled ?? 0} inscritos`;
}

function getActivityTimeRange(activity) {
  const start = activity.hora_inicio || activity.startTime || activity.start || activity.time || null;
  const end = activity.hora_termino || activity.endTime || activity.end || activity.finish || null;

  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return extractTimeLabel(activity);
}

function CompactCalendarActivityCard({ activity, onClick, showPlace = true }) {
  const creator = getActivityCreator(activity);
  const participantsLabel = getActivityParticipants(activity);
  const imageSrc = activity.image || activity.imageUrl || activity.img || pickDemoImage(activity);
  return (
    <button
      type="button"
      className="group relative flex w-full items-stretch gap-4 rounded-[10px] border border-[#e8f0ea] bg-white p-3 text-left shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[0.6px] hover:border-[var(--primary-soft)] hover:cursor-pointer hover:shadow-[0_12px_22px_-18px_rgba(8,38,22,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/20"
      onClick={() => onClick(activity)}
    >
      <span className={`absolute right-3 top-3 rounded-sm border px-2 py-0.5 text-[0.7rem] font-semibold ${getActivityStatusClass(activity)}`}>
        {getActivityStatus(activity)}
      </span>

      <div className="flex-1 flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border border-[#edf3ee] bg-[#f3f4f6] flex items-center justify-center text-[0.8rem] text-[#6c7f74]">
          {imageSrc ? (
            <img src={imageSrc} alt={`Imagen ${activity.title}`} className="h-full w-full object-cover" />
          ) : (
            <div className="font-semibold">OMJ</div>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-start">
          <strong className="block truncate text-[0.975rem] font-semibold text-[#173126] transition-colors duration-200 group-hover:text-[#0f5131]">
            {activity.title}
          </strong>
          <p className="mt-1 text-[0.78rem] text-[#4f6f5f] inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={2} />
            {creator}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.8rem] text-[#3f5f52]">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.95} />
              {getActivityTimeRange(activity)}
            </span>
            {showPlace && activity.place ? (
              <span className="inline-flex items-center gap-1 max-w-[28ch] truncate">
                <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.95} />
                {activity.place}
              </span>
            ) : null}
            {participantsLabel ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.95} />
                {participantsLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex w-[120px] flex-col items-end justify-between">
        <div />
        <div className="mt-auto inline-flex items-center gap-2 text-[0.875rem] font-semibold text-[var(--primary)]">
          <span>Ver detalle</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}
 

function buildMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstWeekDay = (first.getDay() + 6) % 7;
  const totalSlots = Math.ceil((firstWeekDay + last.getDate()) / 7) * 7;

  return Array.from({ length: totalSlots }).map((_, index) => {
    const dayNumber = index - firstWeekDay + 1;
    if (dayNumber < 1 || dayNumber > last.getDate()) {
      return null;
    }

    return new Date(year, month, dayNumber);
  });
}

export default function Calendar({ activities, viewMode, monthDate, onActivityClick, createActivityPath = null }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayViewMode, setDayViewMode] = useState("hora");

  const monthDays = useMemo(() => {
    return buildMonthDays(monthDate.getFullYear(), monthDate.getMonth());
  }, [monthDate]);

  const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  const daysToRender = useMemo(() => {
    if (viewMode !== "semanal") {
      return monthDays;
    }

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === monthDate.getFullYear() && today.getMonth() === monthDate.getMonth();
    const targetDate = isCurrentMonth ? today.getDate() : 1;

    const dayIndex = monthDays.findIndex(day => day && day.getDate() === targetDate);
    const weekStartIndex = dayIndex < 0 ? 0 : Math.floor(dayIndex / 7) * 7;

    return monthDays.slice(weekStartIndex, weekStartIndex + 7);
  }, [viewMode, monthDays, monthDate]);

  const selectedDayActivities = useMemo(() => {
    if (!selectedDay) return [];

    return activities
      .filter(activity => sameDay(selectedDay, activity.date))
      .sort((left, right) => getTimeSortValue(left) - getTimeSortValue(right));
  }, [activities, selectedDay]);

  const groupedDayActivities = useMemo(() => {
    const groups = new Map();

    selectedDayActivities.forEach(activity => {
      const hourLabel = getGroupHourLabel(activity);
      if (!groups.has(hourLabel)) {
        groups.set(hourLabel, []);
      }

      groups.get(hourLabel).push(activity);
    });

    return Array.from(groups.entries());
  }, [selectedDayActivities]);

  const groupedByRoomActivities = useMemo(() => {
    const groups = new Map();

    selectedDayActivities.forEach(activity => {
      const room = activity.place || "Sin sala asignada";
      if (!groups.has(room)) {
        groups.set(room, []);
      }

      groups.get(room).push(activity);
    });

    return Array.from(groups.entries());
  }, [selectedDayActivities]);

  function openDayModal(day) {
    setSelectedDay(day);
    setDayViewMode("hora");
  }

  function closeDayModal() {
    setSelectedDay(null);
  }

  function handleActivityFromDayModal(activity) {
    onActivityClick?.(activity);
    closeDayModal();
  }

  function shiftSelectedDay(offset) {
    setSelectedDay(previous => {
      if (!previous) return previous;
      return new Date(previous.getFullYear(), previous.getMonth(), previous.getDate() + offset);
    });
  }

  return (
    <>
      <section className="overflow-x-auto rounded-2xl border border-[#cfded5] bg-white p-4 max-[640px]:p-3">
      <div className="mb-3 grid grid-cols-7 gap-1.5 rounded-xl border border-[#d6e5dc] bg-white px-2 py-2 max-[640px]:gap-1 max-[640px]:px-1.5 max-[640px]:py-1.5">
        {weekDays.map(day => (
          <span key={day} className="text-center text-[0.73rem] font-bold uppercase tracking-[0.08em] text-[#4f6f5f] max-[640px]:text-[0.66rem]">
            {day}
          </span>
        ))}
      </div>
        <div className="grid min-w-[640px] grid-cols-7 gap-2 max-[640px]:min-w-[560px] max-[640px]:gap-1.5">
        {daysToRender.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-[126px] rounded-xl border border-dashed border-[#d9e5de] bg-white p-2 overflow-hidden max-[640px]:h-[108px] max-[640px]:p-1.5" />;
          }

          const dateKey = day.toISOString().slice(0, 10);
          const dayActivities = activities.filter(activity => sameDay(day, activity.date));
          const enrolledCount = dayActivities.filter(activity => activity.status === "inscrito").length;
          const today = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <article
              key={dateKey}
              className={`h-[126px] cursor-pointer overflow-hidden rounded-xl border p-2.5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_20px_-18px_rgba(7,45,27,0.48)] hover:border-[var(--primary-soft)] max-[640px]:h-[108px] max-[640px]:p-2 ${
                today
                  ? "border-[#4f9f70] bg-white"
                  : isWeekend
                    ? "border-[#c8d9cf] bg-white"
                    : "border-[#c6d7cd] bg-white"
              }`}
              onClick={() => openDayModal(day)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDayModal(day);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <header className="mb-2 flex items-center justify-between max-[640px]:mb-1.5">
                <strong className={`text-[0.9rem] max-[640px]:text-[0.84rem] ${today ? "text-[#0f7f40]" : "text-[#355445]"}`}>{day.getDate()}</strong>
                {today && (
                  <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.05em] text-white max-[640px]:px-1.5 max-[640px]:py-0.5 max-[640px]:text-[0.58rem]">
                    Hoy
                  </span>
                )}
              </header>
              <div className="flex h-[78px] items-end overflow-hidden max-[640px]:h-[64px]">
                {dayActivities.length > 0 ? (
                  <div className="w-full rounded-md border border-[#0f8f4e] bg-[linear-gradient(135deg,#12924f,#0f8f4e)] px-2.5 py-2 text-white overflow-hidden max-[640px]:px-2 max-[640px]:py-1.5">
                    <p className="text-[0.76rem] font-bold leading-tight break-words max-[640px]:text-[0.66rem]">{dayActivities.length} actividades en el dia</p>
                    <p className="mt-0.5 text-[0.7rem] font-semibold leading-tight text-white/85 max-[640px]:hidden">{enrolledCount} inscritas</p>
                  </div>
                ) : (
                  <div className="w-full" aria-hidden="true" />
                )}
              </div>
            </article>
          );
        })}
      </div>
      </section>

      <Modal
        isOpen={Boolean(selectedDay)}
        title={selectedDay ? `Agenda del ${formatLongDate(selectedDay)}` : "Agenda del dia"}
        onClose={closeDayModal}
        hideHeader
        overlayClassName="bg-[rgba(18,27,35,0.22)]"
        /* Desktop: keep the previous panel look. Mobile: full-screen modal */
        panelClassName="sm:max-w-[920px] sm:border-0 sm:bg-transparent sm:shadow-none max-w-full max-h-[calc(100vh-2rem)] sm:h-auto rounded-none sm:rounded-[10px] overflow-hidden"
        contentClassName="p-0"
      >
        <div className="overflow-hidden rounded-[10px] sm:rounded-[10px] border border-[#e5e7eb] bg-[var(--surface)] shadow-[0_10px_24px_-18px_rgba(19,38,29,0.28)] max-h-[calc(100vh-3rem)] sm:h-auto">
          <header className="relative overflow-hidden bg-white px-5 py-4 text-[var(--text)] shadow-[inset_0_-1px_0_0_#dbe8e0]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 inline-flex rounded-[6px] border border-[#cfe3d6] bg-[#f3faf6] px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Agenda diaria</p>
                <h3 className="mt-1 text-[1.3rem] font-bold capitalize text-[var(--text)]">{selectedDay ? formatLongDate(selectedDay) : "Dia seleccionado"}</h3>
                <p className="mt-1 text-[0.84rem] text-[#3f6d54]">{selectedDayActivities.length} actividades programadas</p>
              </div>
              <button
                type="button"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-[7px] border border-[#cfe3d6] bg-white text-[1.05rem] font-bold text-[#2f5f46] transition-colors hover:bg-[#eef8f2]"
                onClick={closeDayModal}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#cfe3d6] bg-white px-2.5 py-1.5 text-[0.78rem] font-semibold text-[var(--text)] transition-colors hover:bg-[#eef8f2]"
                onClick={() => shiftSelectedDay(-1)}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                {selectedDay ? formatShortDate(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate() - 1)) : "Anterior"}
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#cfe3d6] bg-white px-2.5 py-1.5 text-[0.78rem] font-semibold text-[var(--text)] transition-colors hover:bg-[#eef8f2]"
                onClick={() => shiftSelectedDay(1)}
              >
                {selectedDay ? formatShortDate(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate() + 1)) : "Siguiente"}
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </header>

          <div className=" bg-[var(--surface)]  px-5 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex gap-1 rounded-[10px] border border-[#e5e7eb] bg-[#f8faf9] p-1">
                <button
                  type="button"
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                    dayViewMode === "hora" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:bg-white"
                  }`}
                  onClick={() => setDayViewMode("hora")}
                >
                  <Rows3 className="h-4 w-4" strokeWidth={2} />
                  Por hora
                </button>
                <button
                  type="button"
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                    dayViewMode === "sala" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:bg-white"
                  }`}
                  onClick={() => setDayViewMode("sala")}
                >
                  <LayoutGrid className="h-4 w-4" strokeWidth={2} />
                  Por sala
                </button>
              </div>
              {createActivityPath ? (
                <Link
                  to={createActivityPath}
                  onClick={closeDayModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-1.5 text-[0.9rem] font-semibold !text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]"
                >
                  Proponer Actividad
                </Link>
              ) : null}
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto bg-[var(--surface)] border border-[#e5e7eb] px-5 py-4">
            {selectedDayActivities.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#e5e7eb] bg-[#fbfcfb] p-4 text-[0.92rem] text-[var(--text-muted)]">
                No hay actividades programadas para este dia.
              </div>
            ) : dayViewMode === "hora" ? (
              <div className="grid gap-3">
                {groupedDayActivities.map(([hourLabel, hourActivities]) => (
                  <section
                    key={hourLabel}
                    className="rounded-[10px] bg-[var(--gray-soft)] p-3 shadow-[0_1px_0_rgba(16,38,27,0.04)] border border-[#edf3ee]"
                  >
                    <header className="mb-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.78rem] font-bold text-[var(--primary)]">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                        {hourLabel}
                      </span>
                      <span className="rounded-[6px] border border-[#d7e6dc] bg-white px-2 py-0.5 text-[0.72rem] font-semibold text-[#4f6f5f]">
                        {hourActivities.length} actividad{hourActivities.length !== 1 ? "es" : ""}
                      </span>
                    </header>
                    <div className="grid gap-2">
                      {hourActivities.map(activity => (
                        <CompactCalendarActivityCard
                          key={activity.id}
                          activity={activity}
                          onClick={handleActivityFromDayModal}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {groupedByRoomActivities.map(([roomLabel, roomActivities]) => (
                  <section
                    key={roomLabel}
                    className="rounded-[10px] bg-[var(--gray-soft)] p-3 shadow-[0_1px_0_rgba(16,38,27,0.04)]"
                  >
                    <header className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[var(--primary)] inline-flex max-w-full items-center gap-1.5 rounded-[8px] border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.78rem] font-bold">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="max-w-[22ch] overflow-hidden text-ellipsis whitespace-nowrap">{roomLabel}</span>
                      </span>
                      <span className="rounded-[6px] border border-[#d7e6dc] bg-white px-2 py-0.5 text-[0.72rem] font-semibold text-[#4f6f5f]">
                        {roomActivities.length} act.
                      </span>
                    </header>
                    <div className="grid gap-2">
                      {roomActivities.map(activity => (
                        <CompactCalendarActivityCard
                          key={activity.id}
                          activity={activity}
                          onClick={handleActivityFromDayModal}
                          showPlace={false}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
