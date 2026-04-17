import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, CalendarDays, MapPin, Percent, Plus, Star, TrendingUp, Users, UsersRound } from "lucide-react";
import { getMyActivitiesData } from "../services/userViewsService";
import ActivityCard from "../components/ActivityCard";
import { formatDateForChile, parseDateForChile } from "../utils/chileDate";

function formatDate(dateValue) {
  return formatDateForChile(dateValue, {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-black">{label}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 mb-0 text-[1.7rem] font-bold leading-none text-[var(--primary)]">{value}</p>
      <p className="mt-2 mb-0 text-[0.87rem] text-[var(--text-muted)]">{helper}</p>
    </article>
  );
}

function ActiveActivityRow({ activity, mode = "created" }) {
  return (
    <article className="min-h-[96px] shadow rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-4 transition-all duration-200 hover:border-[var(--primary)] hover:shadow-[0_8px_20px_-8px_rgba(16,24,40,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 pt-2">
          <h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{activity.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-3 text-[0.9rem] text-[var(--text-muted)]">
            <p className="m-0 inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[var(--primary)]" />
              {formatDate(activity.date)}
            </p>
            <p className="m-0 inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[var(--primary)]" />
              {activity.place}
            </p>
            {mode === "created" ? (
              <p className="m-0 inline-flex items-center gap-1.5">
                <Users aria-hidden="true" className="h-3.5 w-3.5 text-[var(--primary)]" />
                {activity.participants} / {activity.capacity} inscritos
              </p>
            ) : null}
            {mode === "completed" ? (
              <p className="m-0 inline-flex items-center gap-1.5">
                <Users aria-hidden="true" className="h-3.5 w-3.5 text-[var(--primary)]" />
                {activity.participants ?? 0} / {activity.capacity ?? 0} inscritos
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start pt-4">
          {mode === "created" ? (
            <Link
              to={`/user/actividad/${activity.id}`}
              className="inline-flex rounded-sm border border-transparent bg-[var(--primary)] px-3 py-1.5 text-[0.82rem] font-semibold text-white transition-colors duration-150 hover:bg-[var(--primary-strong)]"
              style={{ color: '#ffffff' }}
            >
              Gestionar
            </Link>
          ) : (
            <Link
              to={`/user/actividad/${activity.id}`}
              className="inline-flex rounded-sm bg-[var(--primary)] px-3 py-1.5 text-[0.82rem] font-semibold !text-white transition-colors duration-150 hover:bg-[var(--primary-strong)]"
              style={{ color: '#ffffff' }}
            >
              Ver detalle
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

const STATUS_FILTERS = [
  { value: "all", label: "Todas", className: "border-[#d8e6dd] bg-white text-[#496053]" },
  { value: "pendiente", label: "Pendiente", className: "border-[#f3d39a] bg-[#fff4de] text-[#a86612]" },
  { value: "programada", label: "Programada", className: "border-[#bfe4cd] bg-[#e7f5ec] text-[#177945]" },
  { value: "en_curso", label: "En curso", className: "border-[#bfd9f5] bg-[#e9f3ff] text-[#1d4f91]" },
  { value: "finalizada", label: "Finalizada", className: "border-[#d5dae1] bg-[#f1f3f5] text-[#475467]" },
  { value: "cancelada", label: "Cancelada", className: "border-[#f1c8be] bg-[#fff1ed] text-[#8a3b2a]" }
];

function getActivityState(activity) {
  const value = activity?.state || activity?.status || "";
  return String(value).toLowerCase();
}

function getStateLabel(state) {
  if (state === "en_curso") return "En curso";
  if (state === "finalizada") return "Finalizada";
  if (state === "programada") return "Programada";
  if (state === "pendiente") return "Pendiente";
  if (state === "cancelada") return "Cancelada";
  return "Sin estado";
}

function getStatePillClass(state) {
  if (state === "pendiente") return "border-[#f3d39a] bg-[#fff4de] text-[#a86612]";
  if (state === "programada") return "border-[#bfe4cd] bg-[#e7f5ec] text-[#177945]";
  if (state === "en_curso") return "border-[#bfd9f5] bg-[#e9f3ff] text-[#1d4f91]";
  if (state === "finalizada") return "border-[#d5dae1] bg-[#f1f3f5] text-[#475467]";
  if (state === "cancelada") return "border-[#f1c8be] bg-[#fff1ed] text-[#8a3b2a]";
  return "border-[#d8e6dd] bg-white text-[#496053]";
}

function PaginationFooter({ currentPage, totalPages, onPageChange, start = 1, end = 0, total = 0 }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-5 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
      <span>Mostrando {start}-{end} de {total}</span>
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="cursor-pointer rounded-sm border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          type="button"
          className="cursor-pointer px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]"
        >
          {currentPage}
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="cursor-pointer rounded-sm border border-[var(--primary)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-md border border-dashed border-[var(--panel-border)] bg-[var(--gray-soft)] px-6 py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
        <p className="mt-1 mb-0 text-[1.02rem] font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-0 mb-0 max-w-[56ch] text-[0.95rem] text-[var(--text-muted)]">{message}</p>
        {actionLabel && actionTo ? (
          <Link to={actionTo} className="mt-3 inline-flex items-center rounded-sm bg-[var(--primary)] px-4 py-1.5 text-[0.9rem] font-semibold !text-white transition-colors hover:bg-[var(--primary-strong)]">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function MyActivities() {
  const [loading, setLoading] = useState(true);
  const [created, setCreated] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [createdPage, setCreatedPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [createdFilter, setCreatedFilter] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("todas");
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    let mounted = true;

    getMyActivitiesData().then(activitiesData => {
      if (!mounted) return;
      const createdIncoming = Array.isArray(activitiesData.created) ? activitiesData.created.slice() : [];
      const completedIncoming = Array.isArray(activitiesData.completed) ? activitiesData.completed.slice() : [];

      setCreated(createdIncoming);
      setCompleted(completedIncoming);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Filtrado y sorting creadas
  const filteredCreated = useMemo(() => {
    let filtered = [...created];
    if (createdFilter !== "all") {
      filtered = filtered.filter(a => getActivityState(a) === createdFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = parseDateForChile(a.date);
      const dateB = parseDateForChile(b.date);
      return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    });
  }, [created, createdFilter]);

  // Sorting completadas
  const sortedCompleted = useMemo(() => {
    let filtered = [...completed];
    const now = new Date();
    if (completedFilter === "ultimos-30") {
      filtered = filtered.filter(item => {
        const date = parseDateForChile(item.date);
        if (!date) return false;
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      });
    } else if (completedFilter === "anteriores") {
      filtered = filtered.filter(item => {
        const date = parseDateForChile(item.date);
        if (!date) return false;
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays > 30;
      });
    }
    return filtered.sort((a, b) => {
      const dateA = parseDateForChile(a.date);
      const dateB = parseDateForChile(b.date);
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });
  }, [completed, completedFilter]);

  const participationStats = useMemo(() => {
    const totalCreated = created.length;
    const totalParticipants = created.reduce((acc, item) => acc + Number(item.participants ?? item.enrolled ?? item.inscritos ?? 0), 0);
    const totalCapacity = created.reduce((acc, item) => acc + Number(item.capacity ?? item.max_participantes ?? 0), 0);
    const occupancy = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;
    const avgParticipants = totalCreated > 0 ? Math.round(totalParticipants / totalCreated) : 0;

    return {
      totalCreated,
      totalParticipants,
      occupancy,
      avgParticipants
    };
  }, [created]);

  // Paginación creadas
  const createdTotalPages = Math.ceil(filteredCreated.length / ITEMS_PER_PAGE);
  const createdStart = (createdPage - 1) * ITEMS_PER_PAGE;
  const paginatedCreated = filteredCreated.slice(createdStart, createdStart + ITEMS_PER_PAGE);

  // Paginación completadas
  const completedTotalPages = Math.ceil(sortedCompleted.length / ITEMS_PER_PAGE);
  const completedStart = (completedPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompleted = sortedCompleted.slice(completedStart, completedStart + ITEMS_PER_PAGE);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de usuario</p>
          <h1 className="mt-2 mb-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis actividades</h1>
          <p className="mt-2 text-[1rem] text-[var(--text-muted)]">Gestiona tus actividades activas y revisa el historial finalizado.</p>
        </div>
      </header>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div>
              <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--primary)]">Nueva actividad</p>
              <h2 className="mt-1 mb-0 text-[1.1rem] font-semibold text-[var(--text)]">Publica y gestiona tus propios eventos</h2>
              <p className="mt-1 mb-0 text-[0.94rem] text-[var(--text-muted)]">Crea una actividad, espera su aprobación y gestiónala.</p>
            </div>
          </div>
          <Link to="/user/crear-actividad" className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-[var(--primary)] px-4 py-2.5 text-[0.9rem] font-semibold !text-white transition-all duration-200 hover:bg-[var(--primary-strong)] hover:shadow-sm">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Crear actividad
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
        <h2 className="m-0 text-[1.08rem] font-semibold text-[var(--text)] mb-3">Estadísticas de participación en tus actividades</h2>
       <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Creadas" value={participationStats.totalCreated} helper="actividades publicadas" icon={BarChart3} />
          <StatCard label="Inscritos" value={participationStats.totalParticipants} helper="usuarios en tus actividades" icon={UsersRound} />
          <StatCard label="Ocupacion" value={`${participationStats.occupancy}%`} helper="cupo total utilizado" icon={Percent} />
          <StatCard label="Promedio" value={participationStats.avgParticipants } helper="inscritos por actividad" icon={TrendingUp} />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--panel-border)] pb-3 ">
          <h2 className="m-0 text-[1.08rem] font-semibold text-[var(--text)]">Mis actividades activas</h2>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(filter => {
            const isActive = createdFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setCreatedFilter(filter.value);
                  setCreatedPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${filter.className} ${isActive ? "ring-2 ring-[var(--primary)]/35" : "hover:opacity-90"}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={`created-skeleton-${index}`} className="min-h-[88px] rounded-md border border-[var(--panel-border)] bg-[var(--gray-soft)]" />
            ))}
          </div>
        ) : (
          <div className="rounded-md p-2.5">
            <div className="space-y-3.5">
              {paginatedCreated.length === 0 && createdTotalPages === 0 ? (
                <EmptyState title="Sin actividades activas" message="Publica una actividad para comenzar a recibir inscripciones." actionLabel="Crear actividad" actionTo="/user/crear-actividad" />
              ) : (
                paginatedCreated.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    actionLabel="Gestionar"
                    to={`/user/actividad/${activity.id}`}
                  />
                ))
              )}
            </div>
            {createdTotalPages > 1 && (
              <PaginationFooter
                currentPage={createdPage}
                totalPages={createdTotalPages}
                onPageChange={setCreatedPage}
                start={createdStart + 1}
                end={Math.min(createdStart + ITEMS_PER_PAGE, filteredCreated.length)}
                total={filteredCreated.length}
              />
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-[1.08rem] font-semibold text-[var(--text)]">Creadas finalizadas</h2>
          <select
            value={completedFilter}
            onChange={e => {
              setCompletedFilter(e.target.value);
              setCompletedPage(1);
            }}
            className="hover:cursor-pointer w-full sm:w-[210px] rounded-sm border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1.5 text-[0.9rem] font-medium text-[var(--text)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            <option value="todas">Todas</option>
            <option value="ultimos-30">Ultimos 30 dias</option>
            <option value="anteriores">Anteriores</option>
          </select>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={`completed-skeleton-${index}`} className="min-h-[88px] rounded-md border border-[var(--panel-border)] bg-[var(--gray-soft)]" />
            ))}
          </div>
        ) : (
          <div className="rounded-md p-2.5">
            <div className="space-y-3.5">
              {paginatedCompleted.length === 0 && completedTotalPages === 0 ? (
                <EmptyState title="Sin actividades finalizadas" message="Las actividades que completes aparecerán aquí para referencia." actionLabel="Crear actividad" actionTo="/user/crear-actividad" />
              ) : (
                <div className="overflow-x-auto rounded-md">
                  <table className="min-w-[840px] w-full text-[0.89rem] bg-white rounded-sm max-[640px]:min-w-[780px]">
                    <thead>
                      <tr>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Actividad</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Inscritos</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Estado</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Calificación</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Fecha</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Hora</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Lugar</th>
                        <th className="border-b border-[#d8e6dd] bg-[var(--gray)] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCompleted.map(activity => (
                        <tr key={activity.id}>
                          <td className="border-b border-[#d8e6dd] px-3 py-3">
                            <p className="m-0 text-[0.9rem] text-[var(--text)]">{activity.title}</p>
                          </td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{(activity.participants ?? activity.enrolled ?? 0)}/{activity.capacity ?? "-"}</td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold ${getStatePillClass(getActivityState(activity))}`}>
                              {getStateLabel(getActivityState(activity))}
                            </span>
                          </td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3">
                            <div className="inline-flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star key={`${activity.id}-star-${index}`} aria-hidden="true" className={`h-3.5 w-3.5 ${index < (activity.rating ?? 5) ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#cbd5e1]"}`} />
                              ))}
                            </div>
                          </td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{formatDate(activity.date)}</td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{activity.time || "-"}</td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{activity.place || "-"}</td>
                          <td className="border-b border-[#d8e6dd] px-3 py-3">
                            <Link to={`/user/actividad/${activity.id}`} className="inline-flex rounded-sm border border-transparent bg-[var(--primary)] px-3 py-1.5 text-[0.82rem] font-semibold text-white transition-opacity duration-150 hover:opacity-90" style={{ color: '#ffffff' }}>Ver detalles</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {completedTotalPages > 1 && (
              <PaginationFooter
                currentPage={completedPage}
                totalPages={completedTotalPages}
                onPageChange={setCompletedPage}
                start={completedStart + 1}
                end={Math.min(completedStart + ITEMS_PER_PAGE, sortedCompleted.length)}
                total={sortedCompleted.length}
              />
            )}
          </div>
        )}
      </section>

    </section>
  );
}

