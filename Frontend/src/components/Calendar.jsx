import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutGrid, MapPin, Rows3 } from "lucide-react";
import Modal from "./Modal";

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

  const parsedDate = new Date(activity.date);
  if (Number.isNaN(parsedDate.getTime())) return "Sin hora";

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
  if (activity.state) return activity.state;
  if (activity.status === "inscrito") return "Inscrito";
  if (activity.status === "disponible") return "Disponible";
  return "Activo";
}

function getActivityStatusClass(activity) {
  if (activity.status === "inscrito") {
    return "bg-[#0f8f4e] text-white border border-[#0f8f4e]";
  }

  if (activity.status === "disponible") {
    return "bg-[#0b7f9f] text-white border border-[#0b7f9f]";
  }

  return "bg-[#4d6a5d] text-white border border-[#4d6a5d]";
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

export default function Calendar({ activities, viewMode, monthDate, onActivityClick }) {
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
      <section className="overflow-x-auto rounded-2xl border border-[#cfded5] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf8_100%)] p-4 shadow-[0_20px_36px_-30px_rgba(10,45,28,0.45)]">
      <div className="mb-3 grid grid-cols-7 gap-2 rounded-xl border border-[#d6e5dc] bg-[#edf6f1] px-2 py-2">
        {weekDays.map(day => (
          <span key={day} className="text-center text-[0.73rem] font-bold uppercase tracking-[0.08em] text-[#4f6f5f]">
            {day}
          </span>
        ))}
      </div>
      <div className="grid min-w-[760px] grid-cols-7 gap-2">
        {daysToRender.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-[126px] rounded-xl border border-dashed border-[#d9e5de] bg-[#f7fbf9] p-2" />;
          }

          const dateKey = day.toISOString().slice(0, 10);
          const dayActivities = activities.filter(activity => sameDay(day, activity.date));
          const enrolledCount = dayActivities.filter(activity => activity.status === "inscrito").length;
          const today = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <article
              key={dateKey}
              className={`h-[126px] cursor-pointer rounded-xl border p-2.5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_20px_-18px_rgba(7,45,27,0.48)] ${
                today
                  ? "border-[#58a97a] bg-[linear-gradient(180deg,#ffffff_0%,#f0faf4_100%)]"
                  : isWeekend
                    ? "border-[#d8e6de] bg-[#f8fcfa]"
                    : "border-[#dbe7e0] bg-[#fdfefd]"
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
              <header className="mb-2 flex items-center justify-between">
                <strong className={`text-[0.9rem] ${today ? "text-[#0f7f40]" : "text-[#355445]"}`}>{day.getDate()}</strong>
                {today && (
                  <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-[0.05em] text-white">
                    Hoy
                  </span>
                )}
              </header>
              <div className="flex h-[78px] items-end">
                {dayActivities.length > 0 ? (
                  <div className="w-full rounded-lg border border-[#0f8f4e] bg-[linear-gradient(135deg,#12924f,#0f8f4e)] px-2.5 py-2 text-white">
                    <p className="text-[0.76rem] font-bold">{dayActivities.length} actividades en el dia</p>
                    <p className="mt-0.5 text-[0.7rem] font-semibold text-white/85">{enrolledCount} inscritas</p>
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
        panelClassName="max-w-[920px] border-0 bg-transparent shadow-none"
        contentClassName="p-0"
      >
        <div className="overflow-hidden rounded-[16px] border border-[#c8dad0] bg-[var(--bg)] shadow-[0_24px_42px_-26px_rgba(12,45,28,0.52)]">
          <header className="bg-[linear-gradient(135deg,#0e6f3b_0%,#0a8f4a_62%,#07a052_100%)] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-white/85">Agenda diaria</p>
                <h3 className="mt-1 text-[1.3rem] font-bold capitalize text-white">{selectedDay ? formatLongDate(selectedDay) : "Dia seleccionado"}</h3>
                <p className="mt-1 text-[0.84rem] text-white/85">{selectedDayActivities.length} actividades programadas</p>
              </div>
              <button
                type="button"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-[9px] border border-white/45 bg-white/15 text-[1.05rem] font-bold text-white transition-colors hover:bg-white/22"
                onClick={closeDayModal}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/45 bg-white/10 px-2.5 py-1.5 text-[0.78rem] font-semibold text-white transition-colors hover:bg-white/18"
                onClick={() => shiftSelectedDay(-1)}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                {selectedDay ? formatShortDate(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate() - 1)) : "Anterior"}
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/45 bg-white/10 px-2.5 py-1.5 text-[0.78rem] font-semibold text-white transition-colors hover:bg-white/18"
                onClick={() => shiftSelectedDay(1)}
              >
                {selectedDay ? formatShortDate(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate() + 1)) : "Siguiente"}
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </header>

          <div className="border-b border-[#d0dfd6] bg-[var(--bg)] px-5 py-2.5">
            <div className="inline-flex gap-1 rounded-[10px] border border-[#cfd8e0] bg-[var(--surface)] p-1">
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                  dayViewMode === "hora" ? "bg-[var(--primary-strong)] text-white shadow-[0_6px_12px_-10px_rgba(20,39,31,0.75)]" : "text-[#59766a] hover:bg-white"
                }`}
                onClick={() => setDayViewMode("hora")}
              >
                <Rows3 className="h-4 w-4" strokeWidth={2} />
                Por hora
              </button>
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
                  dayViewMode === "sala" ? "bg-[var(--primary-strong)] text-white shadow-[0_6px_12px_-10px_rgba(20,39,31,0.75)]" : "text-[#59766a] hover:bg-white"
                }`}
                onClick={() => setDayViewMode("sala")}
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2} />
                Por sala
              </button>
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto bg-[var(--bg)] px-5 py-4">
            {selectedDayActivities.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#cfded5] bg-[var(--surface)] p-4 text-[0.92rem] text-[#5e786b]">
                No hay actividades programadas para este dia.
              </div>
            ) : dayViewMode === "hora" ? (
              <div className="grid gap-3">
                {groupedDayActivities.map(([hourLabel, hourActivities]) => (
                  <section key={hourLabel} className="rounded-xl border border-[#cfd8e0] bg-[var(--surface)] p-3 shadow-[0_1px_0_rgba(18,28,45,0.05)]">
                    <header className="mb-2 flex items-center gap-2 border-b border-[#e1e7ed] pb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#d7dee6] bg-[#f4f7fa] px-2.5 py-1 text-[0.78rem] font-bold text-[#334b5f]">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                        {hourLabel}
                      </span>
                      <span className="h-px flex-1 bg-[#e1e7ed]" aria-hidden="true" />
                    </header>
                    <div className="grid gap-2">
                      {hourActivities.map(activity => (
                        <button
                          key={activity.id}
                          type="button"
                          className="grid cursor-pointer gap-1 rounded-lg border border-[#d4dde4] bg-white px-3 py-2 text-left transition-colors hover:border-[#c6d1da] hover:bg-[#f7f9fb]"
                          onClick={() => handleActivityFromDayModal(activity)}
                        >
                          <strong className="text-[0.92rem] text-[#1b3528]">{activity.title}</strong>
                          <div className="flex flex-wrap items-center gap-3 text-[0.81rem] text-[#435f52]">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.9} />
                              {extractTimeLabel(activity)}
                            </span>
                            {activity.place && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" strokeWidth={1.9} />
                                {activity.place}
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${getActivityStatusClass(activity)}`}>
                              {getActivityStatus(activity)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {groupedByRoomActivities.map(([roomLabel, roomActivities]) => (
                  <section key={roomLabel} className="rounded-xl border border-[#cfd8e0] bg-[var(--surface)] p-3 shadow-[0_1px_0_rgba(18,28,45,0.05)]">
                    <header className="mb-2 flex items-center gap-2 border-b border-[#e1e7ed] pb-2">
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#d7dee6] bg-[#f4f7fa] px-2.5 py-1 text-[0.78rem] font-bold text-[#334b5f]">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="max-w-[22ch] overflow-hidden text-ellipsis whitespace-nowrap">{roomLabel}</span>
                      </span>
                      <span className="h-px flex-1 bg-[#e1e7ed]" aria-hidden="true" />
                    </header>
                    <div className="grid gap-2">
                      {roomActivities.map(activity => (
                        <button
                          key={activity.id}
                          type="button"
                          className="grid cursor-pointer gap-1 rounded-lg border border-[#d4dde4] bg-white px-3 py-2 text-left transition-colors hover:border-[#c6d1da] hover:bg-[#f7f9fb]"
                          onClick={() => handleActivityFromDayModal(activity)}
                        >
                          <strong className="text-[0.92rem] text-[#1b3528]">{activity.title}</strong>
                          <div className="flex flex-wrap items-center gap-3 text-[0.81rem] text-[#435f52]">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" strokeWidth={1.9} />
                              {extractTimeLabel(activity)}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${getActivityStatusClass(activity)}`}>
                              {getActivityStatus(activity)}
                            </span>
                          </div>
                        </button>
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
