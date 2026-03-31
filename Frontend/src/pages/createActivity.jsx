import React, { useState } from "react";
import { Link } from "react-router-dom";
import { submitActivityProposal } from "../services/userViewsService";

const roomOptions = [
  "Sala Multimedia OMJ",
  "Auditorio OMJ",
  "Sala Taller 1",
  "Sala Taller 2",
  "Gimnasio Municipal",
  "Casa de la Cultura"
];

const initialForm = {
  title: "",
  description: "",
  room: roomOptions[0],
  date: "",
  time: ""
};

export default function CreateActivity() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.time) {
      setFeedback({ type: "error", message: "Completa todos los campos requeridos." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitActivityProposal({
        title: form.title.trim(),
        description: form.description.trim(),
        room: form.room,
        date: form.date,
        time: form.time
      });

      if (response?.ok) {
        setFeedback({ type: "success", message: "Tu propuesta fue enviada. El equipo OMJ la revisara pronto." });
        setForm(initialForm);
      } else {
        setFeedback({ type: "error", message: "No se pudo enviar la propuesta. Intenta nuevamente." });
      }
    } catch (_) {
      setFeedback({ type: "error", message: "Ocurrio un error inesperado. Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Crear actividad</h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Propone una nueva actividad indicando lugar, fecha y horario para su revision.</p>
      </header>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="title" className="text-[0.88rem] font-semibold text-[var(--text)]">
              Titulo de la actividad
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={90}
              placeholder="Ej: Taller de fotografia urbana"
              className="rounded-lg border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-[0.88rem] font-semibold text-[var(--text)]">
              Descripcion
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={500}
              placeholder="Describe objetivo, publico y dinamica de la actividad."
              className="resize-y rounded-lg border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              value={form.description}
              onChange={handleChange}
              required
            />
            <p className="text-right text-[0.75rem] text-[var(--text-muted)]">{form.description.length}/500</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="room" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Sala / lugar
              </label>
              <select
                id="room"
                name="room"
                className="rounded-lg border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
                value={form.room}
                onChange={handleChange}
              >
                {roomOptions.map(room => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="date" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Fecha
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="rounded-lg border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="time" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Hora
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className="rounded-lg border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {feedback.message && (
            <div
              className={`rounded-lg border px-3.5 py-2.5 text-[0.86rem] font-medium ${
                feedback.type === "success"
                  ? "border-[#badcc9] bg-[#ebf7f0] text-[#1f6a42]"
                  : "border-[#f0c9c2] bg-[#fff1ef] text-[#8b2f22]"
              }`}
              role="status"
            >
              {feedback.message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar propuesta"}
            </button>

            <Link
              to="/user/dashboard"
              className="inline-flex items-center rounded-lg border border-[#d8e6dd] bg-white px-5 py-2.5 text-[0.9rem] font-semibold text-[#284536] transition-colors hover:bg-[#f5f9f7]"
            >
              Volver al inicio
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
