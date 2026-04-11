import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, ListChecks, MapPin, UserRound } from "lucide-react";
import Modal from "../components/Modal";
import ActivityCard from "../components/ActivityCard";

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

const approvals = [
	{
		id: "ap-001",
		title: "Taller de Voguing",
		description: "Aprende esta forma de baile urbano originada en la cultura ballroom.",
		by: "Ana Martinez",
		type: "Baile Urbano",
		place: "Sala de Danza Principal",
		date: "2026-04-19",
		time: "16:00",
		capacity: 20,
		enrolled: 14,
		status: "Pendiente"
	},
	{
		id: "ap-002",
		title: "Merengue Dominicano",
		description: "Taller intensivo de merengue dominicano.",
		by: "Pedro Soto",
		type: "Baile Latino",
		place: "Sala de Danza Secundaria",
		date: "2026-04-21",
		time: "14:00",
		capacity: 30,
		enrolled: 18,
		status: "Pendiente"
	},
	{
		id: "ap-003",
		title: "Laboratorio de Podcast",
		description: "Actividad ya revisada por el equipo de administracion.",
		by: "Sofia Munoz",
		type: "Cultural",
		place: "Sala Multimedia",
		date: "2026-04-26",
		time: "11:30",
		capacity: 24,
		enrolled: 20,
		status: "Aprobada"
	}
];

export default function AdminApprovals() {
	const [items, setItems] = useState(approvals);
	const [activeItem, setActiveItem] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [rejecting, setRejecting] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [rejectError, setRejectError] = useState("");

	const counters = useMemo(() => {
		return {
			Pendiente: items.filter(item => item.status === "Pendiente").length,
			Aprobada: items.filter(item => item.status === "Aprobada").length,
			Rechazada: items.filter(item => item.status === "Rechazada").length
		};
	}, [items]);

	const filteredItems = useMemo(() => {
		return items.filter(item => item.status === "Pendiente");
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

	function handleApprove() {
		if (!activeItem) return;
		setItems(previous =>
			previous.map(item => {
				if (item.id !== activeItem.id) return item;
				return { ...item, status: "Aprobada" };
			})
		);
		closeItemModal();
	}

	function beginReject() {
		setRejecting(true);
		setRejectReason("");
		setRejectError("");
	}

	function confirmReject() {
		if (!rejectReason.trim()) {
			setRejectError("Debes indicar un motivo de rechazo.");
			return;
		}

		if (!activeItem) return;

		setItems(previous =>
			previous.map(item => {
				if (item.id !== activeItem.id) return item;
				return { ...item, status: "Rechazado", reason: rejectReason.trim() };
			})
		);

		closeItemModal();
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Aprobacion de actividades</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Revisa y aprueba propuestas de actividades antes de publicarlas.</p>
			</header>

			<section className="grid w-full gap-3.5" aria-live="polite">
				{filteredItems.length === 0 && (
					<article className="rounded-xl border border-[#d8e6dd] bg-white p-5 shadow-sm">
						<p className="text-[0.92rem] text-[var(--text-muted)]">No hay actividades pendientes.</p>
					</article>
				)}

				{filteredItems.map(item => (
					<ActivityCard
						key={item.id}
						activity={{
							...item,
							manager: item.by,
							category: item.type,
							date: item.date,
							time: item.time,
							capacity: item.capacity,
							enrolled: item.enrolled,
							state: item.status,
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
				panelClassName="sm:max-w-[900px] sm:rounded-[18px] sm:border-[#d7e4dc] sm:shadow-[0_26px_52px_-32px_rgba(16,24,40,0.45)]"
				contentClassName="bg-white px-0 pb-0 pt-0"
				footerClassName="border-t border-[#dce7df] bg-[#f8fbf9] px-6 py-4 sm:px-7"
				footer={
					<>
						{!rejecting ? (
							<>
								<button
									type="button"
									className="inline-flex items-center justify-center rounded-[11px] bg-[var(--reject)] px-4 py-2.5 text-[0.92rem] font-semibold text-white hover:bg-[var(--reject-hover)]"
									onClick={beginReject}
								>
									Rechazar
								</button>
								<button
									type="button"
									className="inline-flex items-center justify-center rounded-[11px] border bg-[var(--primary)] px-4 py-2.5 text-[0.92rem] font-semibold text-white hover:bg-[var(--primary-strong)]"
									onClick={handleApprove}
								>
									Aprobar
								</button>
							</>
						) : (
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-[11px] border border-[#d16b5d] bg-[linear-gradient(180deg,#d97a6d,#be5c4f)] px-4 py-2.5 text-[0.92rem] font-semibold text-white shadow-[0_14px_24px_-16px_rgba(190,92,79,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-105"
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
					<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-6 py-5 sm:px-7">
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-start gap-3">
								<span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[linear-gradient(180deg,var(--primary),var(--primary-strong))] text-white shadow-[0_10px_22px_-18px_rgba(5,166,61,0.55)]">
									<ListChecks className="h-5 w-5" strokeWidth={1.9} />
								</span>
								<div>
									<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Revisión de actividad</p>
									<h3 className="mt-1 text-[1.15rem] font-semibold text-[var(--text)]">{activeItem.title}</h3>
									<p className="mt-1 max-w-[58ch] text-[0.88rem] text-[var(--text-muted)]">Valida la propuesta antes de publicarla o registra un rechazo con motivo.</p>
								</div>
							</div>
							<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeItemModal} aria-label="Cerrar modal">
								×
							</button>
						</div>
					</div>

					<div className="grid gap-4 bg-white px-6 py-4 sm:px-7">
						<div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
							<div className="space-y-3 rounded-[12px] border border-[#dce7df] bg-[#fcfefd] p-4">
								<div className="grid gap-1.5 sm:grid-cols-2">
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Propuesto por:</strong> {activeItem.by}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Tipo:</strong> {activeItem.type}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Lugar:</strong> {activeItem.place}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Fecha:</strong> {activeItem.date}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Hora:</strong> {activeItem.time}</p>
									<p className="m-0 text-[0.9rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Cupos:</strong> {activeItem.enrolled}/{activeItem.capacity}</p>
								</div>

								<p className="m-0 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">{activeItem.description}</p>
							</div>

							<div className="grid content-start gap-3 rounded-[12px] border border-[#dce7df] bg-[#f8fbf9] px-4 py-4">
								<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Estado actual</p>
								<span className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-[0.82rem] font-semibold ${activeItem.status === "Pendiente" ? "bg-[#fff3de] text-[#b87015]" : activeItem.status === "Aprobada" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#fee8e5] text-[#ad4334]"}`}>
									{activeItem.status}
								</span>
								<p className="m-0 text-[0.88rem] text-[var(--text-muted)]">Esta revisión impacta directamente en la publicación de la actividad dentro del calendario del sistema.</p>
								<div className="grid gap-2 rounded-[12px] border border-[#dce7df] bg-white p-3">
									<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Resumen</p>
									<p className="m-0 text-[0.88rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Aforo:</strong> {activeItem.enrolled}/{activeItem.capacity}</p>
									<p className="m-0 text-[0.88rem] text-[var(--text-muted)]"><strong className="text-[var(--text)]">Duración:</strong> {activeItem.time}</p>
								</div>
							</div>
						</div>

						{rejecting && (
							<div className="grid gap-2 rounded-[14px] border border-[#f0cbc2] bg-[#fff8f6] p-4">
								<label htmlFor="reject-reason" className="text-[0.82rem] font-semibold text-[var(--text)]">
									Explica por que se rechaza la propuesta
								</label>
								<textarea
									id="reject-reason"
									className="min-h-28 w-full resize-y rounded-[10px] border border-[#d8c7c1] bg-white px-3 py-2.5 text-[0.92rem] outline-none transition-shadow duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
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
