import React, { useEffect, useMemo, useState } from "react";
import { BellRing, LoaderCircle, Megaphone, RefreshCw, Send } from "lucide-react";
import { io } from "socket.io-client";
import Modal from "../components/Modal";
import { createBroadcastNotification, getAdminNotifications } from "../services/notificationsService";
import { API_BASE_URL } from "../services/api";

const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE_URL).replace(/\/api\/?$/, "");

const filters = [
	{ key: "all", label: "Todas" },
	{ key: "activity-change", label: "Actividades" },
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
	return item?.type === "actividad" || item?.type === "revision" || item?.themeKey === "activity" || item?.themeKey === "activity-change" || item?.themeKey === "review";
}

function isSystemNotification(item) {
	return !isActivityNotification(item);
}

function getThemeColorClass(item) {
	if (isReviewNotification(item)) {
		return "bg-[#e9f1ff] text-[#2f5fb3]";
 	}

	if (isActivityNotification(item)) {
		return "bg-[#e8f7ec] text-[var(--primary)]";
 	}

	return "bg-[#ffe8e8] text-[#d43c3c]";
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
	if (item?.type === "sistema" || item?.themeKey === "general") return "Sistema";
	return "Sistema";
}

function getHeaderLabelClass(item) {
	if (isActivityNotification(item)) {
		return "bg-[#e8f7ec] text-[var(--primary)]";
	}

	return "bg-[#ffe8e8] text-[#d43c3c]";
}

function pillClass(themeKey, read) {
	return "bg-[#f2f4f7] text-[#64748b]";
}

function getSourceClass(item) {
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

export default function AdminNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [filter, setFilter] = useState("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [detail, setDetail] = useState("");
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const filteredNotifications = useMemo(() => {
		if (filter === "all") {
			return notifications;
		}

		if (filter === "activity-change") {
			return notifications.filter(item => isActivityNotification(item));
		}

		if (filter === "general") {
			return notifications.filter(item => isSystemNotification(item));
		}

		return notifications;
	}, [filter, notifications]);

	async function loadNotifications() {
		try {
			setActionError("");
			const items = await getAdminNotifications();
			setNotifications(items);
		} catch (fetchError) {
			setActionError(fetchError?.response?.data?.message || "No se pudieron cargar las notificaciones.");
		}
	}

	useEffect(() => {
		let mounted = true;

		async function run() {
			try {
				setLoading(true);
				await loadNotifications();
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
					// Mantener la última vista estable si falla el refresh en vivo.
				});
			}

			function handleSocketError() {
				setActionError(previous => previous || "No se pudo conectar al canal en tiempo real. Puedes actualizar manualmente.");
			}

			socket.on("notification:new", handleNotificationEvent);
			socket.on("connect_error", handleSocketError);

			return () => {
				socket.off("notification:new", handleNotificationEvent);
				socket.off("connect_error", handleSocketError);
				socket.disconnect();
			};
		}, []);

	function openModal() {
		setError("");
		setTitle("");
		setDetail("");
		setIsModalOpen(true);
	}

	function closeModal() {
		setIsModalOpen(false);
		setError("");
	}

	async function handleRefresh() {
		try {
			setRefreshing(true);
			await loadNotifications();
		} finally {
			setRefreshing(false);
		}
	}

	async function publishNotification() {
		if (!title.trim()) {
			setError("Ingresa un titulo para la notificacion.");
			return;
		}

		if (!detail.trim()) {
			setError("Ingresa el mensaje de la notificacion.");
			return;
		}

		try {
			setSubmitting(true);
			await createBroadcastNotification({
				titulo: title.trim(),
				descripcion: detail.trim(),
				tipo: "sistema"
			});
			await loadNotifications();
			// Cerrar modal tras publicación exitosa
			closeModal();
		} catch (submitError) {
			setError(submitError?.response?.data?.message || "No se pudo publicar la notificacion.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
				<div>
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
					<h1 className="mt-2 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Notificaciones</h1>
					<p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Aprobaciones, cambios de actividad y avisos generales alimentados desde la BD.</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[#cfded5] bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f6faf7]" onClick={handleRefresh} disabled={refreshing}>
						{refreshing ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.9} /> : <RefreshCw className="h-4 w-4" strokeWidth={1.9} />}
						Actualizar
					</button>
					<button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[var(--primary-strong)]" onClick={openModal}>
						<Send className="h-4 w-4" strokeWidth={1.9} />
					</button>
				</div>
			</header>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<div>
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Bandeja de notificaciones</h2>
						<p className="mt-1 m-0 text-[0.9rem] text-[var(--text-muted)]">Mostrando {filteredNotifications.length} registros</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{filters.map(item => (
							<button
								key={item.key}
								type="button"
								className={`rounded-sm border px-3 py-2 text-[0.84rem] font-semibold transition-all ${getFilterButtonClass(item.key, filter === item.key)}`}
								onClick={() => setFilter(item.key)}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>

				{actionError && <p className="mb-4 rounded-sm border border-[#f0c8c1] bg-[#fff7f5] px-3 py-2 text-[0.86rem] font-semibold text-[#a03d2e]">{actionError}</p>}

				{loading ? (
					<div className="grid gap-3">
						<div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
						<div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
						<div className="h-24 rounded-xl border border-[#e1ebe4] bg-white/70" />
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="rounded-xl border border-dashed border-[#d0ded5] bg-white px-6 py-10 text-center">
						<BellRing className="mx-auto h-10 w-10 text-[var(--primary)]" strokeWidth={1.7} />
						<p className="mt-4 text-[1rem] font-semibold text-[var(--text)]">No hay notificaciones para este filtro.</p>
						<p className="mt-1 text-[0.9rem] text-[var(--text-muted)]">Las nuevas aprobaciones, cambios y avisos aparecerán aquí automáticamente.</p>
					</div>
				) : (
					<div className="grid gap-3.5">
						{filteredNotifications.map(item => (
							<article key={item.id} className="grid gap-4 rounded-[14px] border border-[#d8e6dd] bg-white px-4 py-4 shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] lg:grid-cols-[auto_1fr_auto] lg:items-start">
								<div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[var(--primary)] shadow-[0_6px_14px_-12px_rgba(16,24,40,0.35)]">
									<BellRing className="h-4 w-4" strokeWidth={1.9} />
								</div>

								<div className="min-w-0 space-y-3">
									<div className="flex flex-wrap items-center gap-2">
										<span className={`inline-flex rounded-sm px-2 py-1 text-[0.7rem] font-bold tracking-[0.08em] ${getHeaderLabelClass(item)}`}>
											{getHeaderLabel(item)}
										</span>
									</div>
									<h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{getDisplayTitle(item)}</h3>
									<p className="m-0 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">{getDisplayDetail(item)}</p>
								</div>

								<div className="flex flex-col items-end gap-2 self-start max-[760px]:items-start lg:pt-1">
									<span className={`inline-flex rounded-md px-2 py-1 text-[0.75rem] font-semibold ${pillClass(item.themeKey)}`}>{item.date}</span>
									{item.themeKey === "general" && (
										<span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.72rem] font-semibold ${getThemeColorClass(item)}`}>
											<Megaphone className="h-3.5 w-3.5" strokeWidth={1.9} />
											Aviso
										</span>
									)}
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			<Modal
				isOpen={isModalOpen}
				title="Nueva notificacion del sistema"
				onClose={closeModal}
				hideHeader
				panelClassName="sm:max-w-[760px] sm:rounded-[18px] sm:border-[#d7e4dc] sm:shadow-[0_26px_52px_-32px_rgba(16,24,40,0.45)]"
				contentClassName="px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-6 py-4 sm:px-7"
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeModal} disabled={submitting}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={publishNotification} disabled={submitting}>
							{submitting ? "Publicando..." : "Publicar notificacion"}
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-6 py-5 sm:px-7">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Comunicacion interna</p>
							<h3 className="mt-1 text-[1.12rem] font-semibold text-[var(--text)]">Crear aviso general</h3>
							<p className="mt-1 mb-0 text-[0.88rem] text-[var(--text-muted)]">Este formulario publica un aviso persistente para todos los usuarios.</p>
						</div>
						<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeModal} aria-label="Cerrar modal">
							x
						</button>
					</div>
				</div>

				<div className="grid gap-4 px-6 py-5 sm:px-7">
					<div className="grid gap-2">
						<label htmlFor="notification-title" className="text-[0.82rem] font-semibold text-[var(--text)]">Titulo</label>
						<input
							id="notification-title"
							className="w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
							value={title}
							onChange={event => {
								setTitle(event.target.value);
								if (error) setError("");
							}}
							placeholder="Ejemplo: Aviso institucional"
						/>
					</div>

					<div className="grid gap-2">
						<label htmlFor="notification-detail" className="text-[0.82rem] font-semibold text-[var(--text)]">Mensaje</label>
						<textarea
							id="notification-detail"
							className="min-h-28 w-full resize-y rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
							value={detail}
							onChange={event => {
								setDetail(event.target.value);
								if (error) setError("");
							}}
							placeholder="Ejemplo: Este viernes la plataforma tendra mantenimiento entre 22:00 y 23:00."
						/>
						{error && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{error}</p>}
					</div>
				</div>
			</Modal>
		</section>
	);
}
