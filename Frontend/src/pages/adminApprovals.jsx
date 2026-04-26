import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, ListChecks, MapPin, UserRound } from "lucide-react";
import Modal from "../components/Modal";
import ActivityCard from "../components/ActivityCard";
import LoadingState from "../components/LoadingState";
import { getAdminActivities, reviewActivity } from "../services/userViewsService";
import { formatDateForChile } from "../utils/chileDate";

function MetaIcon({ name, className = "h-4 w-4" }) {
	if (name === "user") {
		return <UserRound aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (name === "place") {
		return <MapPin aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (name === "calendar") {
		return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (name === "time") {
		return <Clock3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	return <ListChecks aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function getStatusKey(item) {
	return String(item?.estado || item?.status || "").toLowerCase();
}

function getStatusLabel(item) {
	const statusKey = getStatusKey(item);
	if (statusKey === "pendiente") return "Pendiente";
	if (statusKey === "aprobada") return "Aprobada";
	if (statusKey === "rechazada" || statusKey === "cancelada") return "Rechazada";
	return item?.status || item?.estado || "Pendiente";
}

export default function AdminApprovals() {
	const [items, setItems] = useState([]);
	const [activeItem, setActiveItem] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [rejecting, setRejecting] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [rejectError, setRejectError] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionMessage, setActionMessage] = useState("");

	useEffect(() => {
		let mounted = true;

		async function loadPendingApprovals() {
			setLoading(true);
			setError("");
			const data = await getAdminActivities({ approved: false, estado: "pendiente" });

			if (!mounted) return;
			setItems(Array.isArray(data) ? data : []);
			setLoading(false);
		}

		loadPendingApprovals().catch(() => {
			if (!mounted) return;
			setItems([]);
			setError("No se pudieron cargar las aprobaciones pendientes.");
			setLoading(false);
		});

		return () => {
			mounted = false;
		};
	}, []);

	const counters = useMemo(() => {
		return {
			Pendiente: items.filter(item => getStatusKey(item) === "pendiente").length,
			Aprobada: items.filter(item => getStatusKey(item) === "aprobada").length,
			Rechazada: items.filter(item => ["rechazada", "cancelada"].includes(getStatusKey(item))).length
		};
	}, [items]);

	const filteredItems = useMemo(() => {
		return items.filter(item => getStatusKey(item) === "pendiente");
	}, [items]);

	function openItemModal(item) {
		setActiveItem(item);
		setModalOpen(true);
		setRejecting(false);
		setRejectReason("");
		setRejectError("");
	}

	function closeItemModal() {
		setActiveItem(null);
		setModalOpen(false);
		setRejecting(false);
		setRejectReason("");
		setRejectError("");
	}

	async function handleApprove() {
		if (!activeItem) return;

		const response = await reviewActivity(activeItem.id, { action: "approve" });
		if (!response.ok) {
			setRejectError(response.message || "No se pudo aprobar la actividad.");
			return;
		}

		setItems(previous => previous.filter(item => item.id !== activeItem.id));
		setActionMessage("Actividad aprobada correctamente. Ya aparece en Actividades disponibles.");
		closeItemModal();
	}

	function beginReject() {
		setRejecting(true);
		setRejectReason("");
		setRejectError("");
	}

	async function confirmReject() {
		if (!rejectReason.trim()) {
			setRejectError("Debes indicar un motivo de rechazo.");
			return;
		}

		if (!activeItem) return;

		const response = await reviewActivity(activeItem.id, {
			action: "reject",
			reason: rejectReason.trim()
		});

		if (!response.ok) {
			setRejectError(response.message || "No se pudo rechazar la actividad.");
			return;
		}

		setItems(previous => previous.filter(item => item.id !== activeItem.id));
		setActionMessage("Actividad rechazada correctamente.");

		closeItemModal();
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Aprobacion de actividades</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Revisa y aprueba propuestas de actividades antes de publicarlas.</p>
			</header>

			{actionMessage && (
				<article className="rounded-xl border border-[#d8e6dd] bg-[#f4fbf6] p-3.5 shadow-sm">
					<p className="m-0 text-[0.9rem] font-medium text-[#1f5f36]">{actionMessage}</p>
				</article>
			)}

			{error && (
				<article className="rounded-xl border border-[#f0d5cf] bg-[#fff4f2] p-3.5 shadow-sm">
					<p className="m-0 text-[0.9rem] font-medium text-[#9f3b2d]">{error}</p>
				</article>
			)}

			<section className="grid w-full gap-3.5" aria-live="polite">
				{loading && (
					<LoadingState
						title="Cargando aprobaciones"
						description="Estamos consultando propuestas pendientes de revisión."
						minHeightClass="min-h-[180px]"
					/>
				)}

				{!loading && filteredItems.length === 0 && (
					<article className="rounded-xl border border-[#d8e6dd] bg-white p-5 shadow-sm">
						<p className="text-[0.92rem] text-[var(--text-muted)]">No hay actividades pendientes.</p>
					</article>
				)}

				{!loading && filteredItems.map(item => (
					<ActivityCard
						key={item.id}
						activity={{
							...item,
							manager: item.manager,
							category: item.category,
							date: item.date,
							time: item.time,
							capacity: item.capacity,
							enrolled: item.enrolled,
							state: getStatusLabel(item),
							image: item.image
						}}
						actionLabel="Revisar"
						onActionClick={openItemModal}
					/>
				))}
			</section>

			<Modal
				isOpen={modalOpen && Boolean(activeItem)}
				title={activeItem ? activeItem.title : "Detalle de actividad"}
				onClose={closeItemModal}
				hideHeader
				panelClassName="sm:max-w-[920px] sm:rounded-[16px] sm:border-[#d7e4dc] sm:shadow-[0_22px_46px_-30px_rgba(16,24,40,0.42)]"
				contentClassName="bg-white px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-white px-6 py-4 sm:px-7"
				footer={
					<>
						{!rejecting ? (
							<>
								<button
									type="button"
									className="inline-flex items-center justify-center rounded-[10px] bg-[var(--reject)] px-4 py-2.5 text-[0.92rem] font-semibold text-white hover:bg-[var(--reject-hover)]"
									onClick={beginReject}
								>
									Rechazar
								</button>
								<button
									type="button"
									className="inline-flex items-center justify-center rounded-[10px] border bg-[var(--primary)] px-4 py-2.5 text-[0.92rem] font-semibold text-white hover:bg-[var(--primary-strong)]"
									onClick={handleApprove}
								>
									Aprobar
								</button>
							</>
						) : (
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-[10px] border border-[#d16b5d] bg-[var(--reject)] hover:bg-[var(--reject-hover)] px-4 py-2.5 text-[0.92rem] font-semibold text-white transition-all duration-200"
								onClick={confirmReject}
							>
								Guardar rechazo
							</button>
						)}
					</>
				}
			>
				{activeItem && (
					<>
					<div className="border-b border-[#dce7df] bg-[#f4fbf6] px-6 py-5 sm:px-7">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Revision</p>
								<p className="mt-1 max-w-[58ch] text-[0.88rem] text-[var(--text-muted)]">Valida la propuesta antes de publicarla o registra un rechazo con motivo.</p>
							</div>
							<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeItemModal} aria-label="Cerrar modal">
								×
							</button>
						</div>
					</div>

					<div className="grid gap-4 bg-white px-6 py-4 sm:px-7">
						<div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
							<div className="space-y-3 rounded-[12px] border border-[#dce7df] bg-white p-4">
								<div className="grid gap-3 sm:grid-cols-2">
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Titulo:</strong> {activeItem.title}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Descripcion:</strong> {activeItem.description || "Sin descripcion"}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Hora inicio:</strong> {activeItem.startTime || activeItem.time || "-"}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Hora termino:</strong> {activeItem.endTime || activeItem.time || "-"}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Sala:</strong> {activeItem.room || activeItem.place || "Sin sala"}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Fecha:</strong> {formatDateForChile(activeItem.date, { day: "2-digit", month: "long", year: "numeric" })}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Propuesto por:</strong> {activeItem.manager || "Sin encargado"}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Cupos:</strong> {activeItem.enrolled}/{activeItem.capacity}</p>
								</div>
							</div>

							<div className="grid content-start gap-3 rounded-[12px] border border-[#dce7df] bg-white px-4 py-4">
								<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Estado actual</p>
								<span className="inline-flex w-fit items-center rounded-md bg-[#fff3de] px-2.5 py-1 text-[0.82rem] font-semibold text-[#b87015]">
									{getStatusLabel(activeItem)}
								</span>
								<p className="m-0 text-[0.88rem] text-[var(--text-muted)]">Esta revisión impacta directamente en la publicación de la actividad dentro del calendario del sistema.</p>
								<div className="grid gap-2 rounded-[12px] border border-[#dce7df] bg-white p-3">
									<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Resumen</p>
									<p className="m-0 text-[0.88rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Aforo:</strong> {activeItem.enrolled}/{activeItem.capacity}</p>
									<p className="m-0 text-[0.88rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Duración:</strong> {activeItem.time || `${activeItem.startTime || "-"} - ${activeItem.endTime || "-"}`}</p>
								</div>
							</div>
						</div>

						{rejecting && (
							<div className="grid gap-2 rounded-[14px] border border-[var(--reject-hover)] bg-[#fff8f6] p-4">
								<label htmlFor="reject-reason" className="text-[0.82rem] font-semibold text-[var(--text)]">
									Explica por que se rechaza la propuesta
								</label>
								<textarea
									id="reject-reason"
									className="min-h-28 w-full resize-y rounded-[10px] border border-[#d8c7c1] bg-white px-3 py-2.5 text-[0.92rem] outline-none transition-shadow duration-200 focus:border-[var(--reject-hover)]"
									value={rejectReason}
									onChange={event => {
										setRejectReason(event.target.value);
										if (rejectError) setRejectError("");
									}}
									placeholder="Ejemplo: Falta definir presupuesto, cupos y responsable de la actividad."
								/>
								{rejectError && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{rejectError}</p>}
							</div>
						)}
					</div>
					</>
				)}
			</Modal>
		</section>
	);
}
