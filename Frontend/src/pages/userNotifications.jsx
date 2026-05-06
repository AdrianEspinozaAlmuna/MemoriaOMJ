import React, { useEffect, useMemo, useState } from "react";
import { BellRing, LoaderCircle, RefreshCw } from "lucide-react";
import { io } from "socket.io-client";
import { getMyNotifications } from "../services/notificationsService";
import { API_BASE_URL } from "../services/api";

const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/api\/?$/, "");

const filters = [
  { key: "all", label: "Todas" },
  { key: "review", label: "Aprobación / rechazo" },
  { key: "activity-change", label: "Cambios de actividad" },
  { key: "general", label: "Generales" }
];

function badgeClass(themeKey) {
  if (themeKey === "review") return "bg-[#efe7fb] text-[#5c3f8e]";
  if (themeKey === "activity-change") return "bg-[#e8f0ff] text-[#294b86]";
  return "bg-[#eef8f1] text-[#2e5a45]";
}

function getSourceClass(item) {
  return item?.type === "actividad" ? "bg-[#e8f7ec] text-[var(--primary)]" : "bg-[#ffe8e8] text-[#d43c3c]";
}

function getDisplayTitle(item) {
  if (item?.type === "sistema") return "Notificación de sistema";
  const title = String(item.title || "").toLowerCase();
  if (title.includes("rechaz")) return "Rechazo propuesta actividad";
  if (title.includes("aprobad")) return "Aprobación propuesta actividad";
  return item.title || "Notificación";
}

function getDisplayDetail(item) {
  if (item?.type === "sistema") return item?.title || item?.detail || "";
  // actividad: prefer activity.title, otherwise extract after ':' in title
  if (item.activity?.title) return `Actividad: "${item.activity.title}"`;
  const title = item.title || "";
  const idx = title.indexOf(":");
  if (idx !== -1) return `Actividad: "${title.substring(idx + 1).trim()}"`;
  return item.detail || "";
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  // unread count UI removed per request
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter(item => item.themeKey === filter);
  }, [filter, notifications]);

  async function loadNotifications() {
    const items = await getMyNotifications();
    setNotifications(items);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const socket = io(SOCKET_BASE_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"]
    });

    function handleNotificationEvent() {
      loadNotifications().catch(() => {
        // La vista conserva el último estado si el refresh en vivo falla.
      });
    }

    socket.on("notification:new", handleNotificationEvent);

    return () => {
      socket.off("notification:new", handleNotificationEvent);
      socket.disconnect();
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

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-6 animate-[revealUp_0.7s_ease_both]">
      <header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Centro de alertas</p>
          <h1 className="mt-2 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Mis notificaciones</h1>
          <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Revisa aprobaciones, cambios en tus actividades y avisos generales desde la PWA.</p>
        </div>

          <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[#cfded5] bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f6faf7]" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.9} /> : <RefreshCw className="h-4 w-4" strokeWidth={1.9} />}
            Actualizar
          </button>
        </div>
      </header>

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
              <div
                key={item.id}
                className={`grid gap-4 rounded-[14px] border px-4 py-4 text-left shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] lg:grid-cols-[auto_1fr_auto] lg:items-start border-[#d8e6dd] bg-white`}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[var(--primary)] shadow-[0_6px_14px_-12px_rgba(16,24,40,0.35)]">
                  <BellRing className="h-4 w-4" strokeWidth={1.9} />
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">{item.themeLabel}</p>
                    <span className={`inline-flex rounded-sm px-2 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${getSourceClass(item)}`}>{item.source}</span>
                  </div>
                  <h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{getDisplayTitle(item)}</h3>
                  <div className="block truncate font-semibold text-[0.95rem] leading-tight text-[#1f3328]">{getDisplayDetail(item)}</div>
                  {item.detail && <p className="m-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{item.detail}</p>}
                </div>

                <div className="flex flex-col items-end gap-2 self-start max-[760px]:items-start lg:pt-1">
                  <span className="inline-flex rounded-md bg-[#eef8f1] px-2 py-1 text-[0.75rem] font-semibold text-[#2e5a45]">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}