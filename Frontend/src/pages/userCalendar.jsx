import React, { useEffect, useMemo, useState } from "react";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import { getCalendarData } from "../services/userViewsService";
import "../styles/userCalendar.css";

export default function UserCalendar() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("mensual");
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

  return (
    <section className="user-page container reveal-up">
      <header className="user-page-header">
        <p className="eyebrow">Panel de usuario</p>
        <h1>Calendario</h1>
      </header>

      <section className="user-section">
        <div className="calendar-filters">
          <label>
            Categoria
            <select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha
            <input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} />
          </label>

          <label>
            Estado
            <select value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)}>
              <option value="todos">todos</option>
              <option value="inscrito">inscrito</option>
              <option value="disponible">disponible</option>
            </select>
          </label>

          <label>
            Vista
            <select value={viewMode} onChange={event => setViewMode(event.target.value)}>
              <option value="mensual">mensual</option>
              <option value="semanal">semanal</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="calendar-loading">Cargando calendario...</div>
        ) : (
          <Calendar
            activities={filteredActivities}
            viewMode={viewMode}
            monthDate={new Date(2026, 2, 1)}
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
          <div className="calendar-modal-content">
            <p>{activeActivity.description}</p>
            <p>
              <strong>Lugar:</strong> {activeActivity.place}
            </p>
            <p>
              <strong>Encargado:</strong> {activeActivity.manager}
            </p>
            <p>
              <strong>Inscritos:</strong> {activeActivity.enrolledCount}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
