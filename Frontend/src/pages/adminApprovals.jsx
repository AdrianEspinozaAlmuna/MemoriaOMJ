import React, { useMemo, useState } from "react";
import Modal from "../components/Modal";
import "../styles/adminPages.css";

function MetaIcon({ name }) {
	if (name === "user") {
		return <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 2.02-6 4.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5C18 16.02 15.31 14 12 14Z" />;
	}

	if (name === "place") {
		return <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />;
	}

	if (name === "calendar") {
		return <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />;
	}

	if (name === "time") {
		return <path d="M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
	}

	return <path d="M6 8h12M6 12h8m-8 4h6M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />;
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
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Aprobacion de Actividades</h1>
				<p>Revisa y aprueba propuestas de actividades</p>
			</header>

			<section className="admin-approval-tabs" role="tablist" aria-label="Filtros de aprobacion">
				<button
					type="button"
					className={`admin-approval-tab${activeTab === "Pendiente" ? " active" : ""}`}
					onClick={() => setActiveTab("Pendiente")}
				>
					Pendientes ({counters.Pendiente})
				</button>
				<button
					type="button"
					className={`admin-approval-tab${activeTab === "Aprobada" ? " active" : ""}`}
					onClick={() => setActiveTab("Aprobada")}
				>
					Aprobadas ({counters.Aprobada})
				</button>
				<button
					type="button"
					className={`admin-approval-tab${activeTab === "Rechazada" ? " active" : ""}`}
					onClick={() => setActiveTab("Rechazada")}
				>
					Rechazadas ({counters.Rechazada})
				</button>
			</section>

			<section className="admin-approval-list" aria-live="polite">
				{filteredItems.length === 0 && (
					<article className="admin-approval-card">
						<p className="admin-panel-subtitle">No hay actividades en este estado.</p>
					</article>
				)}

				{filteredItems.map(item => (
					<article key={item.id} className="admin-approval-card">
						<div className="admin-approval-badges">
							<span className="admin-chip is-type">{item.type}</span>
							<span className={`admin-chip is-state-${item.status.toLowerCase()}`}>{item.status}</span>
						</div>

						<h2>{item.title}</h2>
						<p>{item.description}</p>

						<div className="admin-approval-meta-grid">
							<div className="admin-approval-meta">
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="user" /></svg>
									</span>
									<span>Propuesto por: {item.by}</span>
								</div>
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="place" /></svg>
									</span>
									<span>{item.place}</span>
								</div>
							</div>
							<div className="admin-approval-meta">
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="calendar" /></svg>
									</span>
									<span>Fecha: {item.dateLabel}</span>
								</div>
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="time" /></svg>
									</span>
									<span>Hora: {item.timeLabel}</span>
								</div>
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="seats" /></svg>
									</span>
									<span>Cupos: {item.seats}</span>
								</div>
							</div>
						</div>

						{item.status === "Pendiente" ? (
							<div className="admin-approval-actions">
								<button type="button" className="admin-approval-btn approve" onClick={() => handleApprove(item.title)}>
									Aprobar
								</button>
								<button type="button" className="admin-approval-btn reject" onClick={() => openRejectModal(item.title)}>
									Rechazar
								</button>
							</div>
						) : (
							<div className="admin-approval-readonly">Esta actividad ya fue procesada.</div>
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
				<div className="admin-modal-field">
					<label htmlFor="reject-reason">
						Explica por que se rechaza {activeItem ? `"${activeItem.title}"` : "la propuesta"}
					</label>
					<textarea
						id="reject-reason"
						className="admin-textarea"
						value={rejectReason}
						onChange={event => {
							setRejectReason(event.target.value);
							if (rejectError) setRejectError("");
						}}
						placeholder="Ejemplo: Falta definir presupuesto, cupos y responsable de la actividad."
					/>
					{rejectError && <p className="admin-field-error">{rejectError}</p>}
				</div>
			</Modal>
		</section>
	);
}
