import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, ListChecks, MapPin, UserRound } from "lucide-react";
import Modal from "../components/Modal";

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
		dateLabel: "19-11-2025",
		timeLabel: "16:00",
		seats: 20,
		status: "Pendiente"
	},
	{
		id: "ap-002",
		title: "Merengue Dominicano",
		description: "Taller intensivo de merengue dominicano.",
		by: "Pedro Soto",
		type: "Baile Latino",
		place: "Sala de Danza Secundaria",
		dateLabel: "21-11-2025",
		timeLabel: "14:00",
		seats: 30,
		status: "Pendiente"
	},
	{
		id: "ap-003",
		title: "Laboratorio de Podcast",
		description: "Actividad ya revisada por el equipo de administracion.",
		by: "Sofia Munoz",
		type: "Cultural",
		place: "Sala Multimedia",
		dateLabel: "26-11-2025",
		timeLabel: "11:30",
		seats: 24,
		status: "Aprobada"
	}
];

export default function AdminApprovals() {
	const [items, setItems] = useState(approvals);
	const [activeTab, setActiveTab] = useState("Pendiente");
	const [rejectingTitle, setRejectingTitle] = useState("");
	const [rejectReason, setRejectReason] = useState("");
	const [rejectError, setRejectError] = useState("");

	const activeItem = useMemo(() => {
		return items.find(item => item.title === rejectingTitle) || null;
	}, [items, rejectingTitle]);

	const counters = useMemo(() => {
		return {
			Pendiente: items.filter(item => item.status === "Pendiente").length,
			Aprobada: items.filter(item => item.status === "Aprobada").length,
			Rechazada: items.filter(item => item.status === "Rechazada").length
		};
	}, [items]);

	const filteredItems = useMemo(() => {
		return items.filter(item => item.status === activeTab);
	}, [items, activeTab]);

	function handleApprove(title) {
		setItems(previous =>
			previous.map(item => {
				if (item.title !== title) return item;
				return { ...item, status: "Aprobada" };
			})
		);
	}

	function openRejectModal(title) {
		setRejectingTitle(title);
		setRejectReason("");
		setRejectError("");
	}

	function closeRejectModal() {
		setRejectingTitle("");
		setRejectReason("");
		setRejectError("");
	}

	function confirmReject() {
		if (!rejectReason.trim()) {
			setRejectError("Debes indicar un motivo de rechazo.");
			return;
		}

		setItems(previous =>
			previous.map(item => {
				if (item.title !== rejectingTitle) return item;
				return { ...item, status: "Rechazado", reason: rejectReason.trim() };
			})
		);

		closeRejectModal();
	}

	return (
		<section className="space-y-8">
			<header>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Aprobacion de Actividades</h1>
				<p className="mt-1.5 text-[0.92rem] text-[var(--text-muted)]">Revisa y aprueba propuestas de actividades</p>
			</header>

			<section className="inline-flex w-fit max-w-full items-center gap-0.5 self-start rounded-xl border border-[#d8e5de] bg-[#eef4f1] p-1 max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-1" role="tablist" aria-label="Filtros de aprobacion">
				<button
					type="button"
					className={`rounded-[10px] px-4 py-2 text-[0.92rem] font-semibold ${activeTab === "Pendiente" ? "bg-white text-[#1f4f37] shadow-[0_1px_0_rgba(11,40,26,0.08)]" : "text-[#4e6658]"}`}
					onClick={() => setActiveTab("Pendiente")}
				>
					Pendientes ({counters.Pendiente})
				</button>
				<button
					type="button"
					className={`rounded-[10px] px-4 py-2 text-[0.92rem] font-semibold ${activeTab === "Aprobada" ? "bg-white text-[#1f4f37] shadow-[0_1px_0_rgba(11,40,26,0.08)]" : "text-[#4e6658]"}`}
					onClick={() => setActiveTab("Aprobada")}
				>
					Aprobadas ({counters.Aprobada})
				</button>
				<button
					type="button"
					className={`rounded-[10px] px-4 py-2 text-[0.92rem] font-semibold ${activeTab === "Rechazada" ? "bg-white text-[#1f4f37] shadow-[0_1px_0_rgba(11,40,26,0.08)]" : "text-[#4e6658]"}`}
					onClick={() => setActiveTab("Rechazada")}
				>
					Rechazadas ({counters.Rechazada})
				</button>
			</section>

			<section className="grid w-full gap-3.5 xl:grid-cols-2" aria-live="polite">
				{filteredItems.length === 0 && (
				<article className="rounded-xl border border-[#d8e6dd] bg-white p-5 shadow-sm">
					<p className="text-[0.92rem] text-[var(--text-muted)]">No hay actividades en este estado.</p>
					</article>
				)}

				{filteredItems.map(item => (
					<article key={item.id} className="rounded-xl border border-[#d8e6dd] bg-white px-5 py-5 shadow-sm">
						<div className="mb-2 flex items-center gap-2">
							<span className="rounded-md bg-[#f3f8f5] px-2 py-1 text-[0.78rem] font-semibold text-[#406251]">{item.type}</span>
							<span className={`rounded-md px-2 py-1 text-[0.78rem] font-semibold ${item.status === "Pendiente" ? "bg-[#fff3de] text-[#b87015]" : item.status === "Aprobada" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#fee8e5] text-[#ad4334]"}`}>{item.status}</span>
						</div>

						<h2 className="m-0 text-[1.28rem] font-bold text-[#20372b] max-[760px]:text-[1.12rem]">{item.title}</h2>
						<p className="mt-1 text-[0.93rem] text-[#5f786a]">{item.description}</p>

						<div className="mt-4 grid gap-4 min-[761px]:grid-cols-2">
							<div className="grid gap-2">
								<div className="flex min-h-6 items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<MetaIcon name="user" className="h-4 w-4" />
									</span>
									<span className="text-[0.93rem] text-[#52695c]">Propuesto por: {item.by}</span>
								</div>
								<div className="flex min-h-6 items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<MetaIcon name="place" className="h-4 w-4" />
									</span>
									<span className="text-[0.93rem] text-[#52695c]">{item.place}</span>
								</div>
							</div>
							<div className="grid gap-2">
								<div className="flex min-h-6 items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<MetaIcon name="calendar" className="h-4 w-4" />
									</span>
									<span className="text-[0.93rem] text-[#52695c]">Fecha: {item.dateLabel}</span>
								</div>
								<div className="flex min-h-6 items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<MetaIcon name="time" className="h-4 w-4" />
									</span>
									<span className="text-[0.93rem] text-[#52695c]">Hora: {item.timeLabel}</span>
								</div>
								<div className="flex min-h-6 items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<MetaIcon name="seats" className="h-4 w-4" />
									</span>
									<span className="text-[0.93rem] text-[#52695c]">Cupos: {item.seats}</span>
								</div>
							</div>
						</div>

						{item.status === "Pendiente" ? (
							<div className="mt-4 grid gap-2 min-[761px]:grid-cols-2">
								<button type="button" className="cursor-pointer rounded-[10px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]" onClick={() => handleApprove(item.title)}>
									Aprobar
								</button>
								<button type="button" className="cursor-pointer rounded-[10px] border border-[#dfa49a] bg-[#f9dfdb] px-3 py-3 text-[0.95rem] font-semibold text-[#7d2d1f] transition-colors hover:border-[#d9877a] hover:bg-[#f5c9c1]" onClick={() => openRejectModal(item.title)}>
									Rechazar
								</button>
							</div>
						) : (
								<div className="mt-4 rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.9rem] font-semibold text-[var(--text-muted)]">Esta actividad ya fue procesada.</div>
						)}
					</article>
				))}
			</section>

			<Modal
				isOpen={Boolean(activeItem)}
				title="Motivo de rechazo"
				onClose={closeRejectModal}
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeRejectModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={confirmReject}>
							Guardar rechazo
						</button>
					</>
				}
			>
				<div className="grid gap-2">
					<label htmlFor="reject-reason">
						Explica por que se rechaza {activeItem ? `"${activeItem.title}"` : "la propuesta"}
					</label>
					<textarea
						id="reject-reason"
						className="min-h-28 w-full resize-y rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
						value={rejectReason}
						onChange={event => {
							setRejectReason(event.target.value);
							if (rejectError) setRejectError("");
						}}
						placeholder="Ejemplo: Falta definir presupuesto, cupos y responsable de la actividad."
					/>
					{rejectError && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{rejectError}</p>}
				</div>
			</Modal>
		</section>
	);
}
