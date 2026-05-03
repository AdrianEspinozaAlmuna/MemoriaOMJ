import React, { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { getMyNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } from "../services/notificationsService";

const filters = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "No leidas" },
  { key: "review", label: "Aprobación / rechazo" },
  { key: "activity-change", label: "Cambios de actividad" },
  { key: "general", label: "Generales" }
];

function badgeClass(themeKey) {
  if (themeKey === "review") return "bg-[#efe7fb] text-[#5c3f8e]";
  if (themeKey === "activity-change") return "bg-[#e8f0ff] text-[#294b86]";
  return "bg-[#eef8f1] text-[#2e5a45]";
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(item => !item.read);
    return notifications.filter(item => item.themeKey === filter);
  }, [filter, notifications]);

  async function loadNotifications() {
    const [items, count] = await Promise.all([
      getMyNotifications(),
      getUnreadNotificationCount()
    ]);

    setNotifications(items);
    setUnreadCount(count);
  }

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);
        await loadNotifications();
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError?.response?.data?.message || "No se pudieron cargar tus notificaciones.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await loadNotifications();
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "No se pudieron actualizar las notificaciones.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      setRefreshing(true);
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (markError) {
      setError(markError?.response?.data?.message || "No se pudieron marcar como leidas.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMarkOneRead(notificationId) {
    try {
      const updated = await markNotificationAsRead(notificationId);
      setNotifications(previous => previous.map(item => (item.id === notificationId ? { ...item, ...updated, read: true, leida: true } : item)));
      setUnreadCount(previous => Math.max(0, previous - 1));
    } catch (_error) {
      setError("No se pudo marcar la notificacion como leida.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-6 animate-[revealUp_0.7s_ease_both]">
      <header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Centro de alertas</p>
          <h1 className="mt-2 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis notificaciones</h1>
          <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Revisa aprobaciones, cambios en tus actividades y avisos generales desde la PWA.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[#cfded5] bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f6faf7]" onClick={handleMarkAllRead} disabled={refreshing || unreadCount === 0}>
            <CheckCheck className="h-4 w-4" strokeWidth={1.9} />
            Marcar todas
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[#cfded5] bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f6faf7]" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.9} /> : <RefreshCw className="h-4 w-4" strokeWidth={1.9} />}
            Actualizar
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-[#d8e6dd] bg-white p-4 shadow-sm">
          <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Total</p>
          <p className="mt-2 text-[1.8rem] font-bold text-[var(--text)]">{notifications.length}</p>
        </article>
        <article className="rounded-xl border border-[#d8e6dd] bg-white p-4 shadow-sm">
          <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">No leidas</p>
          <p className="mt-2 text-[1.8rem] font-bold text-[var(--text)]">{unreadCount}</p>
        </article>
        <article className="rounded-xl border border-[#d8e6dd] bg-white p-4 shadow-sm">
          <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Actividad</p>
          <p className="mt-2 text-[1.8rem] font-bold text-[var(--text)]">{notifications.filter(item => item.tipo === "actividad").length}</p>
        </article>
      </section>

      <section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Bandeja personal</h2>
            <p className="mt-1 m-0 text-[0.9rem] text-[var(--text-muted)]">{visibleNotifications.length} elementos visibles</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(item => (
              <button
                key={item.key}
                type="button"
                className={`rounded-md px-3 py-2 text-[0.84rem] font-semibold transition-colors ${filter === item.key ? "bg-[var(--primary)] text-white" : "border border-[#d0ded5] bg-white text-[var(--text)] hover:bg-[#f6faf7]"}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 rounded-md border border-[#f0c8c1] bg-[#fff7f5] px-3 py-2 text-[0.86rem] font-semibold text-[#a03d2e]">{error}</p>}

        {loading ? (
          <div className="grid gap-3">
            <div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
            <div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
            <div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d0ded5] bg-white px-6 py-10 text-center">
            <BellRing className="mx-auto h-10 w-10 text-[var(--primary)]" strokeWidth={1.7} />
            <p className="mt-4 text-[1rem] font-semibold text-[var(--text)]">Todavía no tienes notificaciones para este filtro.</p>
            <p className="mt-1 text-[0.9rem] text-[var(--text-muted)]">Aquí verás aprobaciones, rechazos, cambios y avisos institucionales persistentes.</p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {visibleNotifications.map(item => (
              <button
                key={item.id}
                type="button"
                className={`grid gap-4 rounded-[14px] border px-4 py-4 text-left shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] lg:grid-cols-[auto_1fr_auto] lg:items-start ${item.read ? "border-[#d8e6dd] bg-white" : "border-[color:rgba(5,166,61,0.25)] bg-[#fafffb]"}`}
                onClick={() => !item.read && handleMarkOneRead(item.id)}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--primary)] text-white shadow-[0_10px_22px_-18px_rgba(5,166,61,0.45)]">
                  <BellRing className="h-4 w-4" strokeWidth={1.9} />
                </span>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">{item.themeLabel}</p>
                    <span className={`inline-flex rounded-md px-2 py-1 text-[0.74rem] font-semibold ${badgeClass(item.themeKey)}`}>{item.source}</span>
                    {!item.read && <span className="inline-flex rounded-md bg-[#fff2e8] px-2 py-1 text-[0.74rem] font-semibold text-[#9a5a1a]">Nueva</span>}
                  </div>
                  <h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{item.title}</h3>
                  <p className="m-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
                  {item.activity?.title && <p className="m-0 text-[0.82rem] font-semibold text-[#55705e]">Actividad relacionada: {item.activity.title}</p>}
                </div>

                <div className="flex flex-col items-end gap-2 self-start max-[760px]:items-start lg:pt-1">
                  <span className="inline-flex rounded-md bg-[#eef8f1] px-2 py-1 text-[0.75rem] font-semibold text-[#2e5a45]">{item.date}</span>
                  <span className={`inline-flex rounded-md px-2 py-1 text-[0.72rem] font-semibold ${item.read ? "bg-[#eef3ef] text-[#5f7168]" : "bg-[#e8f7ec] text-[#2e5a45]"}`}>
                    {item.read ? "Leida" : "Pendiente"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}