import React, { useEffect, useMemo, useState } from "react";
import { BellRing, LoaderCircle, RefreshCw } from "lucide-react";
import { io } from "socket.io-client";
import { getMyNotifications } from "../services/notificationsService";
import { API_BASE_URL } from "../services/api";

const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/api\/?$/, "");

const filters = [
  { key: "all", label: "Todas" },
  { key: "activity-change", label: "Actividad" },
  { key: "general", label: "Sistema" }
];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getActivityTitle(item) {
  return normalizeText(item?.activityTitle || item?.activity?.title || item?.actividad?.titulo || "");
}

function isReviewNotification(item) {
  const title = normalizeText(item?.title).toLowerCase();
  return item?.themeKey === "review" || title.includes("aprob") || title.includes("rechaz");
}

function isActivityNotification(item) {
  return item?.type === "actividad" || item?.themeKey === "activity" || item?.themeKey === "activity-change" || item?.themeKey === "review";
}

function isSystemNotification(item) {
  return !isActivityNotification(item);
}

function badgeClass(themeKey) {
  return "bg-[#f2f4f7] text-[#64748b]";
}

function getFilterButtonClass(key, active) {
  const inactive = {
    "activity-change": "border-[#93d5ab] bg-white text-[var(--primary)] hover:bg-[#f6fbf7]",
    general: "border-[#ef9a8f] bg-white text-[#d43c3c] hover:bg-[#fff7f5]"
  };

  if (active) {
    return {
      "activity-change": "bg-[#f5fbf6] text-[var(--primary)] border-[var(--primary)] shadow-[0_8px_16px_-12px_rgba(5,166,61,0.22)]",
      general: "bg-[#fff6f4] text-[#b53a2f] border-[red] shadow-[0_8px_16px_-12px_rgba(212,60,60,0.22)]"
    }[key] || "bg-[#f4f7f5] text-[var(--text)] border-[#6e8474] shadow-[0_8px_16px_-12px_rgba(16,24,40,0.16)]";
  }

  return inactive[key] || "border border-[#d0ded5] bg-white text-[var(--text)] hover:bg-[#f6faf7]";
}

function getHeaderLabel(item) {
  if (isActivityNotification(item)) return "Actividad";
  if (item?.type === "sistema" || item?.themeKey === "general") return "Generales";
  return "Sistema";
}

function getHeaderLabelClass(item) {
  if (isActivityNotification(item)) return "bg-[#e8f7ec] text-[var(--primary)]";
  return "bg-[#ffe8e8] text-[#d43c3c]";
}

function getDisplayTitle(item) {
  const activityTitle = getActivityTitle(item);
  const title = normalizeText(item?.title);
  const lowerTitle = title.toLowerCase();

  if (isActivityNotification(item)) {
    if (lowerTitle.includes("rechaz")) return activityTitle ? `Rechazo de propuesta actividad "${activityTitle}"` : "Rechazo de propuesta actividad";
    if (lowerTitle.includes("aprobad")) return activityTitle ? `Aprobación de propuesta actividad "${activityTitle}"` : "Aprobación de propuesta actividad";
    return activityTitle ? `${title || "Actividad"} "${activityTitle}"` : title || "Actividad";
  }

  return title || "Notificación";
}

function getDisplayDetail(item) {
  const title = normalizeText(item?.title);
  const detail = normalizeText(item?.detail);
  const activityTitle = getActivityTitle(item);
  const lowerTitle = title.toLowerCase();
  const lowerDetail = detail.toLowerCase();

  if (isActivityNotification(item)) {
    if (item?.themeKey === "activity-change") {
      if (activityTitle && detail) return `Actividad: "${activityTitle}". ${detail}`;
      return detail || (activityTitle ? `Actividad: "${activityTitle}"` : "Actividad actualizada.");
    }

    if (lowerTitle.includes("rechaz")) {
      if (activityTitle && detail) return `Actividad: "${activityTitle}". ${detail}`;
      return activityTitle ? `Actividad: "${activityTitle}".` : detail || "Se rechazó la actividad.";
    }

    if (lowerTitle.includes("aprobad")) {
      if (activityTitle && detail) return `Actividad: "${activityTitle}". ${detail}`;
      return activityTitle ? `Actividad: "${activityTitle}".` : detail || "Se aprobó la actividad.";
    }

    if (activityTitle && (lowerDetail.includes("revisi") || lowerDetail.includes("creó") || lowerDetail.includes("creo"))) {
      return `Se creó "${activityTitle}" para revisión.`;
    }

    if (activityTitle && detail) return `Actividad: "${activityTitle}". ${detail}`;
    if (activityTitle) return `Actividad: "${activityTitle}"`;
    return detail || "Actividad actualizada.";
  }

  return detail || "";
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "activity-change") {
      return notifications.filter(item => isActivityNotification(item));
    }
    if (filter === "general") {
      return notifications.filter(item => isSystemNotification(item));
    }
    return notifications;
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
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true
    });

    function handleNotificationEvent() {
      loadNotifications().catch(() => {
        // La vista conserva el último estado si el refresh en vivo falla.
      });
    }

    function handleSocketError() {
      setError(previous => previous || "No se pudo conectar al canal en tiempo real. Puedes actualizar manualmente.");
    }

    socket.on("notification:new", handleNotificationEvent);
    socket.on("connect_error", handleSocketError);

    return () => {
      socket.off("notification:new", handleNotificationEvent);
      socket.off("connect_error", handleSocketError);
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
                className={`rounded-md border px-3 py-2 text-[0.84rem] font-semibold transition-all ${getFilterButtonClass(item.key, filter === item.key)}`}
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
                className="grid gap-4 rounded-[14px] border border-[#d8e6dd] bg-white px-4 py-4 text-left shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] lg:grid-cols-[auto_1fr_auto] lg:items-start"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[var(--primary)] shadow-[0_6px_14px_-12px_rgba(16,24,40,0.35)]">
                  <BellRing className="h-4 w-4" strokeWidth={1.9} />
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-sm px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${getHeaderLabelClass(item)}`}>
                      {getHeaderLabel(item)}
                    </span>
                  </div>
                  <h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{getDisplayTitle(item)}</h3>
                  <p className="m-0 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">{getDisplayDetail(item)}</p>
                </div>

                <div className="flex flex-col items-end gap-2 self-start max-[760px]:items-start lg:pt-1">
                  <span className={`inline-flex rounded-md px-2 py-1 text-[0.75rem] font-semibold ${badgeClass(item.themeKey)}`}>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
