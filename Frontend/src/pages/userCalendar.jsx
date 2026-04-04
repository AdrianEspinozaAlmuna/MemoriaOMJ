import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Layers3, ListFilter, Tags } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { getCalendarData } from "../services/userViewsService";

function getMonthLabel(date) {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
}

export default function UserCalendar() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("mensual");
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    getCalendarData().then(data => {
      if (!mounted) return;
      setActivities(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(activities.map(item => item.category));
    return ["todos", ...Array.from(unique)];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const categoryMatch = selectedCategory === "todos" || activity.category === selectedCategory;
      const statusMatch = selectedStatus === "todos" || activity.status === selectedStatus;
      const dateMatch = !selectedDate || activity.date === selectedDate;
      return categoryMatch && statusMatch && dateMatch;
    });
  }, [activities, selectedCategory, selectedStatus, selectedDate]);

  const monthLabel = useMemo(() => getMonthLabel(monthDate), [monthDate]);

  function goToPreviousMonth() {
    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Calendario</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Filtra tus actividades por categoria, estado o fecha para encontrar lo que necesitas.</p>
      </header>

      <section className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-2 text-[0.82rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <Tags className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Categoria
            </span>
            <select className="hover:cursor-pointer rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3 py-2 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Fecha
            </span>
            <input className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3 py-2 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} />
          </label>

          <label className="grid gap-2 text-[0.82rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <ListFilter className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Estado
            </span>
            <select className="hover:cursor-pointer rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3 py-2 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)}>
              <option value="todos">todos</option>
              <option value="inscrito">inscrito</option>
              <option value="disponible">disponible</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Vista
            </span>
            <select className="hover:cursor-pointer rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3 py-2 text-[0.9rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={viewMode} onChange={event => setViewMode(event.target.value)}>
              <option value="mensual">mensual</option>
              <option value="semanal">semanal</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <strong className="text-[0.95rem] font-semibold capitalize text-[var(--text)]">{monthLabel}</strong>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hover:cursor-pointer inline-flex items-center gap-1.5 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.84rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Mes anterior
            </button>
            <button
              type="button"
              className="hover:cursor-pointer inline-flex items-center gap-1.5 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.84rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30"
              onClick={goToNextMonth}
            >
              Mes siguiente
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-[220px] place-items-center rounded-lg border border-[#d8e6dd] bg-white font-medium text-[var(--text-muted)]">Cargando calendario...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-[#d8e6dd] bg-[#f9fbfa] px-5 text-center font-medium text-[var(--text-muted)]">
            No hay actividades con los filtros seleccionados. Prueba con otra categoria o estado.
          </div>
        ) : (
          <Calendar
            activities={filteredActivities}
            viewMode={viewMode}
            monthDate={monthDate}
            onActivityClick={activity => navigate(`/user/actividad/${activity.id}`)}
            createActivityPath="/user/crear-actividad"
          />
        )}
      </section>
    </section>
  );
}
