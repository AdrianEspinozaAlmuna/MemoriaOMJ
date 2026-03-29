import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Layers3, ListFilter, Tags } from "lucide-react";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
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
  const [activeActivity, setActiveActivity] = useState(null);

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
    <section className="container relative animate-[revealUp_0.7s_ease_both]">
      <header className="pt-1.5 pb-0.5">
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Calendario</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Filtra tus actividades por categoria, estado o fecha para encontrar lo que necesitas.</p>
        <span className="mt-3.5 block h-1 w-[min(190px,44vw)] rounded-full bg-[var(--header-accent)] opacity-45" />
      </header>

      <section className="mt-6 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[var(--panel-shadow)]">
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-[#d8e5dc] bg-[linear-gradient(180deg,#fbfdfc_0%,#f5faf7_100%)] p-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-[0.85rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <Tags className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Categoria
            </span>
            <select className="rounded-[10px] border border-[#d0ddd5] bg-white px-3.5 py-2.5 text-[0.9rem] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[var(--primary)] focus:bg-[#fbfffd] focus:shadow-[0_0_0_3px_rgba(15,143,78,0.12)]" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-[0.85rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Fecha
            </span>
            <input className="rounded-[10px] border border-[#d0ddd5] bg-white px-3.5 py-2.5 text-[0.9rem] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[var(--primary)] focus:bg-[#fbfffd] focus:shadow-[0_0_0_3px_rgba(15,143,78,0.12)]" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} />
          </label>

          <label className="grid gap-2 text-[0.85rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <ListFilter className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Estado
            </span>
            <select className="rounded-[10px] border border-[#d0ddd5] bg-white px-3.5 py-2.5 text-[0.9rem] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[var(--primary)] focus:bg-[#fbfffd] focus:shadow-[0_0_0_3px_rgba(15,143,78,0.12)]" value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)}>
              <option value="todos">todos</option>
              <option value="inscrito">inscrito</option>
              <option value="disponible">disponible</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.85rem] font-semibold text-[var(--text)]">
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
              Vista
            </span>
            <select className="rounded-[10px] border border-[#d0ddd5] bg-white px-3.5 py-2.5 text-[0.9rem] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none focus:border-[var(--primary)] focus:bg-[#fbfffd] focus:shadow-[0_0_0_3px_rgba(15,143,78,0.12)]" value={viewMode} onChange={event => setViewMode(event.target.value)}>
              <option value="mensual">mensual</option>
              <option value="semanal">semanal</option>
            </select>
          </label>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d8e6dd] bg-[#f7fbf9] px-3.5 py-2.5">
          <strong className="text-[0.95rem] capitalize text-[var(--text)]">{monthLabel}</strong>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-[0.84rem] font-semibold text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Mes anterior
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-[0.84rem] font-semibold text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]"
              onClick={goToNextMonth}
            >
              Mes siguiente
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-[220px] place-items-center rounded-[10px] border border-[#dbe5de] bg-[linear-gradient(180deg,#f9fcfa_0%,#f5f8f6_100%)] font-medium text-[var(--text-muted)]">Cargando calendario...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center rounded-[10px] border border-dashed border-[#cddfd4] bg-[#f9fcfa] px-5 text-center font-medium text-[var(--text-muted)]">
            No hay actividades con los filtros seleccionados. Prueba con otra categoria o estado.
          </div>
        ) : (
          <Calendar
            activities={filteredActivities}
            viewMode={viewMode}
            monthDate={monthDate}
            onActivityClick={setActiveActivity}
          />
        )}
      </section>

      <Modal
        isOpen={Boolean(activeActivity)}
        title={activeActivity?.title}
        onClose={() => setActiveActivity(null)}
        footer={
          <>
            <button type="button" className="btn btn-primary btn-inline">
              Inscribirse
            </button>
            <button type="button" className="btn btn-ghost btn-inline" onClick={() => setActiveActivity(null)}>
              Cerrar
            </button>
          </>
        }
      >
        {activeActivity && (
          <div>
            <p className="mt-2 text-[var(--text-muted)]">{activeActivity.description}</p>
            <p className="mt-2 text-[var(--text-muted)]">
              <strong>Lugar:</strong> {activeActivity.place}
            </p>
            <p className="mt-2 text-[var(--text-muted)]">
              <strong>Encargado:</strong> {activeActivity.manager}
            </p>
            <p className="mt-2 text-[var(--text-muted)]">
              <strong>Inscritos:</strong> {activeActivity.enrolledCount}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
