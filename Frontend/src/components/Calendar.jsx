import React, { useMemo } from "react";

function sameDay(sourceDate, compareDate) {
  return sourceDate.toISOString().slice(0, 10) === compareDate;
}

function buildMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstWeekDay = first.getDay();
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
  const monthDays = useMemo(() => {
    return buildMonthDays(monthDate.getFullYear(), monthDate.getMonth());
  }, [monthDate]);

  const weekDays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

  const daysToRender = viewMode === "semanal" ? monthDays.slice(0, 7) : monthDays;

  return (
    <section className="overflow-x-auto rounded-xl border border-[#dde2e7] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-2 grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <span key={day} className="text-[0.76rem] font-semibold uppercase tracking-[0.06em] text-[#6f8378]">
            {day}
          </span>
        ))}
      </div>
      <div className="grid min-w-[760px] grid-cols-7 gap-2">
        {daysToRender.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[118px] rounded-lg border border-dashed border-[#e1e6eb] bg-transparent p-2" />;
          }

          const dateKey = day.toISOString().slice(0, 10);
          const dayActivities = activities.filter(activity => sameDay(day, activity.date));

          return (
            <article key={dateKey} className="min-h-[118px] rounded-lg border border-[#e1e6eb] bg-[#fcfdfc] p-2">
              <header className="mb-1.5">
                <strong className="text-[0.88rem] text-[#3a4e44]">{day.getDate()}</strong>
              </header>
              <div className="grid gap-1.5">
                {dayActivities.map(activity => (
                  <button
                    key={activity.id}
                    type="button"
                    className={`cursor-pointer rounded-md border-none px-2 py-1.5 text-left text-[0.74rem] font-semibold ${
                      activity.status === "inscrito" ? "bg-[#0f8f4e] text-[#fefefe]" : "bg-[#edf4ef] text-[#294336]"
                    }`}
                    onClick={() => onActivityClick(activity)}
                  >
                    {activity.title}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
