import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { getActivityDetail, submitActivityEditRequest, submitActivityProposal } from "../services/userViewsService";
import api from "../services/api";

// Las opciones de salas vendran desde la API (/salas)

const initialForm = {
  title: "",
  description: "",
  id_tipo_actividad: "",
  room: "",
  date: "",
  hora_inicio: "",
  hora_termino: "",
  max_participantes: 20,
  chat_bidireccional: true,
  grupos_seleccionados: []
};

function formatConflictRange(conflict) {
  const start = conflict?.hora_inicio || "--:--";
  const end = conflict?.hora_termino || "--:--";
  return `${start} - ${end}`;
}

export default function CreateActivity() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editActivityId = searchParams.get("edit");
  const isEditMode = Boolean(editActivityId);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const prefillDate = searchParams.get("date");
  const [form, setForm] = useState({
    ...initialForm,
    date: /^\d{4}-\d{2}-\d{2}$/.test(prefillDate) ? prefillDate : initialForm.date
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", title: "", message: "", hint: "" });
  const [roomOptions, setRoomOptions] = useState([]);
  const [roomLoadError, setRoomLoadError] = useState("");
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [tiposActividad, setTiposActividad] = useState([]);
  const [loadingTiposActividad, setLoadingTiposActividad] = useState(true);
  const [loadingEditActivity, setLoadingEditActivity] = useState(isEditMode);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleGroupToggle(idGrupo) {
    setForm(previous => {
      const gruposActuales = previous.grupos_seleccionados || [];
      const yaEsta = gruposActuales.includes(idGrupo);
      return {
        ...previous,
        grupos_seleccionados: yaEsta
          ? gruposActuales.filter(g => g !== idGrupo)
          : [...gruposActuales, idGrupo]
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", title: "", message: "", hint: "" });

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.hora_inicio || !form.hora_termino) {
      setFeedback({
        type: "error",
        title: "Faltan datos requeridos",
        message: "Completa todos los campos obligatorios para continuar.",
        hint: "Revisa titulo, descripcion, fecha y bloque horario."
      });
      return;
    }

    // Validación: permitir crear actividades para hoy o en fechas posteriores
    if (!isEditMode) {
      const now = new Date();
      if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
        setFeedback({
          type: "error",
          title: "Fecha inválida",
          message: "Selecciona una fecha válida.",
          hint: "La fecha debe ser hoy o posterior."
        });
        return;
      }

      // rechazar fechas anteriores a hoy
      if (form.date < todayStr) {
        setFeedback({
          type: "error",
          title: "Fecha inválida",
          message: "La fecha no puede ser anterior a hoy.",
          hint: "Selecciona una fecha igual o posterior al día de hoy."
        });
        return;
      }

      const selectedStart = new Date(`${form.date}T${form.hora_inicio}:00`);
      if (selectedStart.getTime() < now.getTime() && form.date === todayStr) {
        setFeedback({
          type: "error",
          title: "Hora inválida",
          message: "La hora de inicio no puede ser anterior a la hora actual.",
          hint: "Elige una hora igual o posterior al momento actual."
        });
        return;
      }
    }

    if (!form.id_tipo_actividad) {
      setFeedback({
        type: "error",
        title: "Tipo requerido",
        message: "Debes seleccionar un tipo de actividad.",
        hint: "El tipo define la portada y clasificacion de la actividad."
      });
      return;
    }

    if (form.hora_termino <= form.hora_inicio) {
      setFeedback({
        type: "error",
        title: "Rango horario invalido",
        message: "La hora de termino debe ser mayor a la hora de inicio.",
        hint: "Ajusta el rango para evitar solapamientos de tiempo."
      });
      return;
    }

    const maxParticipants = Number(form.max_participantes);
    if (!Number.isFinite(maxParticipants) || maxParticipants < 1) {
      setFeedback({
        type: "error",
        title: "Capacidad invalida",
        message: "Ingresa un maximo de participantes valido.",
        hint: "Debe ser un numero mayor a 0."
      });
      return;
    }

    const selectedRoom = roomOptions.find(room => String(room.id) === String(form.room));
    const roomCapacity = Number(selectedRoom?.capacity ?? 0);
    if (!selectedRoom) {
      setFeedback({
        type: "error",
        title: "Sala invalida",
        message: "Selecciona una sala disponible para continuar.",
        hint: "Recarga la pagina si no aparecen salas en la lista."
      });
      return;
    }

    if (Number.isFinite(roomCapacity) && roomCapacity > 0 && maxParticipants > roomCapacity) {
      setFeedback({
        type: "error",
        title: "Cupo superior a la sala",
        message: `El cupo solicitado no puede superar la capacidad de ${roomCapacity} personas de la sala seleccionada.`,
        hint: "Reduce el cupo o elige otra sala con mayor capacidad."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        id_tipo_actividad: Number(form.id_tipo_actividad),
        id_sala: Number(form.room),
        date: form.date,
        hora_inicio: form.hora_inicio,
        hora_termino: form.hora_termino,
        max_participantes: maxParticipants,
        chat_bidireccional: form.chat_bidireccional,
        aprobado: isAdminRoute,
        estado: isAdminRoute ? "programada" : "pendiente"
      };

      const response = isEditMode
        ? await submitActivityEditRequest(editActivityId, payload)
        : await submitActivityProposal({
            ...payload,
            grupos_seleccionados: form.grupos_seleccionados
          });

      if (response?.ok) {
        setFeedback({
          type: "success",
          title: isEditMode
            ? (isAdminRoute ? "Actividad actualizada" : "Edicion enviada")
            : isAdminRoute ? "Actividad publicada" : "Propuesta enviada",
          message: isEditMode
            ? (isAdminRoute
              ? "Los cambios se aplicaron directamente a la actividad."
              : "Tu solicitud de edicion fue registrada correctamente y quedo en revision.")
            : isAdminRoute
              ? "La actividad se registro y quedo publicada para los usuarios."
              : "Tu actividad fue registrada correctamente y quedo en revision.",
          hint: isEditMode
            ? (isAdminRoute
              ? "Puedes gestionarla desde el panel de actividades cuando lo necesites."
              : "Cuando el admin la revise, te notificaremos el resultado.")
            : isAdminRoute
              ? "Puedes gestionarla desde el panel de actividades cuando lo necesites."
              : "El equipo OMJ te notificara cuando cambie su estado."
        });
        if (!isEditMode) {
          setForm(previous => ({
            ...initialForm,
            room: previous.room,
            id_tipo_actividad: previous.id_tipo_actividad
          }));
        }
      } else if (response?.status === 409 || response?.conflict) {
        const conflictName = response?.conflict?.titulo || "otra actividad";
        const conflictRange = formatConflictRange(response?.conflict);
        setFeedback({
          type: "conflict",
          title: "Tope de horario detectado",
          message: `La sala seleccionada ya esta ocupada en ese horario (${conflictRange}) por ${conflictName}.`,
          hint: "Prueba con otra sala o ajusta el tramo horario."
        });
      } else {
        setFeedback({
          type: "error",
          title: "No se pudo enviar la propuesta",
          message: response?.message || "No se pudo enviar la propuesta. Intenta nuevamente.",
          hint: "Si el problema persiste, intenta nuevamente en unos minutos."
        });
      }
    } catch (_) {
      setFeedback({
        type: "error",
        title: "Error inesperado",
        message: "Ocurrio un error inesperado. Intenta nuevamente.",
        hint: "Verifica tu conexion y vuelve a intentar."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    async function loadRooms() {
      try {
        const res = await api.get("/salas");
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const rawRooms = res.data;
          const opts = (isEditMode ? rawRooms : rawRooms.filter(s => String(s.estado || s.status || "").toLowerCase() === "habilitada"))
            .map(s => ({
              id: s.id_sala || s.id,
              name: s.nombre || s.name,
              capacity: Number(s.capacidad ?? s.capacity ?? 0)
            }));
          setRoomOptions(opts);
          setForm(previous => ({ ...previous, room: opts.length > 0 ? String(opts[0].id) : "" }));
          setRoomLoadError("");
          return;
        }
      } catch (e) {
        if (mounted) {
          setRoomLoadError(e?.response?.data?.message || e?.message || "No se pudieron cargar las salas disponibles.");
        }
      }
      setRoomOptions([]);
      setForm(previous => ({ ...previous, room: "" }));
    }

    async function loadTipos() {
      setLoadingTiposActividad(true);
      try {
        const res = await api.get("/imagenes");
        if (!mounted) return;
        const tipos = Array.isArray(res.data?.tipos) ? res.data.tipos : [];
        setTiposActividad(tipos);
        if (tipos.length > 0) {
          setForm(previous => ({
            ...previous,
            id_tipo_actividad: String(tipos[0].id_tipo)
          }));
        }
      } catch (e) {
        console.error("Error cargando tipos de actividad:", e);
        setTiposActividad([]);
      } finally {
        if (mounted) {
          setLoadingTiposActividad(false);
        }
      }
    }

    async function loadGrupos() {
      if (isEditMode) {
        setGruposDisponibles([]);
        return;
      }

      try {
        const res = await api.get("/groups");
        if (!mounted) return;
        setGruposDisponibles(res.data.grupos || []);
      } catch (e) {
        console.error("Error cargando grupos:", e);
        setGruposDisponibles([]);
      }
    }

    loadRooms();
    loadTipos();
    loadGrupos();
    return () => { mounted = false; };
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode || !editActivityId) {
      setLoadingEditActivity(false);
      return;
    }

    let mounted = true;

    async function loadEditActivity() {
      setLoadingEditActivity(true);
      const response = await getActivityDetail(editActivityId);

      if (!mounted) return;

      if (!response.ok) {
        setFeedback({
          type: "error",
          title: "No se pudo cargar la actividad",
          message: response.message || "No se pudo cargar la actividad para editarla.",
          hint: "Revisa que la actividad exista y vuelve a intentarlo."
        });
        setLoadingEditActivity(false);
        return;
      }

      const activity = response.activity || {};
      setForm(previous => ({
        ...previous,
        title: activity.title || "",
        description: activity.description || "",
        id_tipo_actividad: activity.id_tipo_actividad ? String(activity.id_tipo_actividad) : previous.id_tipo_actividad,
        room: activity.id_sala ? String(activity.id_sala) : previous.room,
        date: activity.date || "",
        hora_inicio: activity.hora_inicio || "",
        hora_termino: activity.hora_termino || "",
        max_participantes: activity.capacity ?? previous.max_participantes,
        chat_bidireccional: activity.chat_bidireccional ?? true
      }));
      setLoadingEditActivity(false);
    }

    loadEditActivity();

    return () => {
      mounted = false;
    };
  }, [editActivityId, isEditMode]);

  const tipoSeleccionado = tiposActividad.find(tipo => String(tipo.id_tipo) === String(form.id_tipo_actividad));
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowTimeStr = now.toTimeString().slice(0, 5);
  const backLink = isEditMode
    ? `${isAdminRoute ? "/admin/actividad" : "/user/actividad"}/${editActivityId}`
    : isAdminRoute
      ? "/admin/dashboard"
      : "/user/dashboard";

  if (isEditMode && loadingEditActivity) {
    return (
<section className="animate-[revealUp_0.7s_ease_both] max-w-7xl mx-auto px-4 py-6 space-y-8">
        <article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
          <p className="m-0 text-[0.92rem] font-semibold text-[var(--text)]">Cargando actividad para edición</p>
          <p className="mt-2 text-[0.88rem] text-[var(--text-muted)]">{isAdminRoute ? "Cargando datos de la actividad..." : "Estamos preparando los datos actuales para que puedas enviar cambios a revisión."}</p>
        </article>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <header>
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">{isAdminRoute ? "Panel de administrador" : "Panel de usuario"}</p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">
          {isEditMode ? "Editar actividad" : "Crear actividad"}
        </h1>
        <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">
          {isEditMode
            ? (isAdminRoute
              ? "Modifica los datos de la actividad y guarda los cambios directamente."
              : "Ajusta los datos de la actividad y envía la modificación a revisión.")
            : isAdminRoute
              ? "Crea una actividad con publicación inmediata indicando lugar, fecha y horario."
              : "Propone una nueva actividad indicando lugar, fecha y horario para su revision."}
        </p>
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
              className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
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
              className="resize-y rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
              value={form.description}
              onChange={handleChange}
              required
            />
            <p className="text-right text-[0.75rem] text-[var(--text-muted)]">{form.description.length}/500</p>
          </div>

          <div className="grid gap-3 rounded-sm border border-[#d8e6dd] bg-white p-4">
            <div>
              <p className="m-0 text-[0.88rem] font-semibold text-[var(--text)]">Tipo de actividad</p>
              <p className="m-0 mt-1 text-[0.8rem] text-[var(--text-muted)]">Selecciona la categoria que se asociara a esta actividad.</p>
            </div>

            {loadingTiposActividad ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex min-h-[168px] items-center justify-center rounded-sm border border-dashed border-[#d8e6dd] bg-[var(--panel-bg)] px-4 text-[0.88rem] text-[var(--text-muted)] sm:col-span-2 lg:col-span-3">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-[var(--primary)]" strokeWidth={1.9} />
                  Cargando tipos de actividad...
                </div>
              </div>
            ) : tiposActividad.length === 0 ? (
              <p className="m-0 text-[0.82rem] text-[#8b2f22]">No hay tipos de actividad registrados en el catalogo.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tiposActividad.map(tipo => {
                  const selected = String(form.id_tipo_actividad) === String(tipo.id_tipo);
                  return (
                    <label
                      key={tipo.id_tipo}
                      className={[
                        "cursor-pointer overflow-hidden rounded-sm border bg-[var(--panel-bg)] transition-all",
                        selected
                          ? "border-[var(--primary)] ring-2 ring-[#05a63d]/20"
                          : "border-[#d8e6dd] hover:border-[#b7d1c0]"
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="id_tipo_actividad"
                        value={String(tipo.id_tipo)}
                        checked={selected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <img src={tipo.imagen_url} alt={tipo.nombre} className="h-24 w-full object-cover" />
                      <div className="p-2.5">
                        <p className="m-0 text-[0.84rem] font-semibold text-[var(--text)]">{tipo.nombre}</p>
                        <p className="m-0 mt-0.5 line-clamp-2 text-[0.75rem] text-[var(--text-muted)]">{tipo.descripcion || "Sin descripcion"}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {tipoSeleccionado && (
              <p className="m-0 text-[0.78rem] text-[var(--text-muted)]">
                Seleccionado: <strong>{tipoSeleccionado.nombre}</strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <label htmlFor="room" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Sala / lugar
              </label>
              {roomLoadError && (
                <p className="m-0 text-[0.82rem] text-[#8b2f22]">{roomLoadError}</p>
              )}
              <select
                id="room"
                name="room"
                className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 hover:cursor-pointer"
                value={form.room}
                onChange={handleChange}
                disabled={roomOptions.length === 0}
              >
                  <option value="">{roomOptions.length === 0 ? "No hay salas disponibles" : "Selecciona una sala"}</option>
                {roomOptions.map(room => (
                  <option key={room.id} value={String(room.id)}>
                    {room.name}
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
                lang="es-CL"
                className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 hover:cursor-pointer"
                value={form.date ? form.date.substring(0, 10) : ""}
                onChange={(e) => setForm(previous => ({ ...previous, date: e.target.value }))}
                required
                min={!isEditMode ? todayStr : undefined}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="hora_inicio" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Hora inicio
              </label>
              <input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 hover:cursor-pointer"
                value={form.hora_inicio}
                onChange={handleChange}
                required
                min={!isEditMode && form.date === todayStr ? nowTimeStr : undefined}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="hora_termino" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Hora termino
              </label>
              <input
                id="hora_termino"
                name="hora_termino"
                type="time"
                className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 hover:cursor-pointer"
                value={form.hora_termino}
                onChange={handleChange}
                required
                min={!isEditMode && form.date === todayStr ? nowTimeStr : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="max_participantes" className="text-[0.88rem] font-semibold text-[var(--text)]">
                Maximo de participantes
              </label>
              <input
                id="max_participantes"
                name="max_participantes"
                type="number"
                min="1"
                max="500"
                className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[0.92rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20 hover:cursor-pointer"
                value={form.max_participantes}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <p className="m-0 text-[0.88rem] font-semibold text-[var(--text)]">Chat bidireccional</p>
              <label className="inline-flex items-center gap-3 rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 hover:cursor-pointer">
                <input
                  id="chat_bidireccional"
                  name="chat_bidireccional"
                  type="checkbox"
                  checked={form.chat_bidireccional}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#c4d5cb] accent-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)] hover:cursor-pointer"
                />
                <span className="text-[0.9rem] text-[var(--text-muted)]">
                  Permitir mensajes entre participantes y encargado.
                </span>
              </label>
            </div>
          </div>

          {!isEditMode && gruposDisponibles.length > 0 && (
            <div className="grid gap-3 border-t border-[#d8e6dd] pt-5">
              <div>
                <p className="m-0 text-[0.88rem] font-semibold text-[var(--text)]">Agregar grupos a la actividad (opcional)</p>
                <p className="m-0 mt-1 text-[0.82rem] text-[var(--text-muted)]">Selecciona los grupos cuyos miembros se invitarán automáticamente</p>
              </div>
              <div className="space-y-2">
                {gruposDisponibles.map(grupo => (
                  <label
                    key={grupo.id_grupo}
                    className="flex items-start gap-3 rounded-sm border border-[#d8e6dd] bg-white px-3.5 py-2.5 hover:cursor-pointer hover:bg-[#f5f9f7]"
                  >
                    <input
                      type="checkbox"
                      checked={form.grupos_seleccionados.includes(grupo.id_grupo)}
                      onChange={() => handleGroupToggle(grupo.id_grupo)}
                      className="mt-1 h-4 w-4 rounded border-[#c4d5cb] accent-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)] hover:cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="m-0 text-[0.9rem] font-semibold text-[var(--text)]">{grupo.nombre}</p>
                      <p className="m-0 text-[0.82rem] text-[var(--text-muted)]">
                        {grupo.cantidad_miembros} miembro{grupo.cantidad_miembros !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {feedback.message && (
            <div
              className={`rounded-xl border px-4 py-3 shadow-sm ${
                feedback.type === "success"
                  ? "border-[#b8dfc7] bg-[linear-gradient(180deg,#f3fbf6,#e9f6ef)] text-[#1f6a42]"
                  : feedback.type === "conflict"
                    ? "border-[#f0d9b8] bg-[linear-gradient(180deg,#fff9ef,#fff4df)] text-[#8a5817]"
                    : "border-[#efcdc7] bg-[linear-gradient(180deg,#fff6f4,#fff0ed)] text-[#8b2f22]"
              }`}
              role="status"
            >
              <div className="grid gap-2">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-[2px] inline-flex h-5 w-5 flex-shrink-0 rounded-full ${
                      feedback.type === "success"
                        ? "bg-[#2ca664]"
                        : feedback.type === "conflict"
                          ? "bg-[#d2902a]"
                          : "bg-[#c94a3a]"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="grid gap-0.5">
                    <p className="m-0 text-[0.88rem] font-semibold tracking-[0.01em]">{feedback.title}</p>
                    <p className="m-0 text-[0.85rem] font-medium leading-relaxed">{feedback.message}</p>
                  </div>
                </div>
                {feedback.hint && (
                  <p className="m-0 border-t border-current/15 pt-2 text-[0.78rem] font-medium opacity-85">{feedback.hint}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || (isEditMode && loadingEditActivity) || loadingTiposActividad}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.9} />
                  Enviando...
                </>
              ) : isEditMode ? (
                isAdminRoute ? "Guardar cambios" : "Enviar edición a revisión"
              ) : (
                "Enviar propuesta"
              )}
            </button>

            <Link
              to={backLink}
              className="inline-flex items-center rounded-sm border border-[#d8e6dd] bg-white px-5 py-2.5 text-[0.9rem] font-semibold text-[#284536] transition-colors hover:bg-[#f5f9f7]"
            >
              {isEditMode ? "Volver al detalle" : "Volver al inicio"}
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
