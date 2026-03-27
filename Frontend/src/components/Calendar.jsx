import React, { useMemo } from "react";
import "../styles/user/calendar.css";

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
    <section className="calendar-panel">
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={`calendar-grid ${viewMode === "semanal" ? "calendar-week" : ""}`}>
        {daysToRender.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-cell calendar-cell-empty" />;
          }

          const dateKey = day.toISOString().slice(0, 10);
          const dayActivities = activities.filter(activity => sameDay(day, activity.date));

          return (
            <article key={dateKey} className="calendar-cell">
              <header>
                <strong>{day.getDate()}</strong>
              </header>
              <div className="calendar-activities">
                {dayActivities.map(activity => (
                  <button
                    key={activity.id}
                    type="button"
                    className={`calendar-activity ${activity.status === "inscrito" ? "is-enrolled" : ""}`}
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
