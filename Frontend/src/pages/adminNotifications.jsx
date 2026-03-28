import React, { useState } from "react";
import Modal from "../components/Modal";
import "../styles/adminPages.css";

const initialNotifications = [
	{ id: "sys-001", title: "Nueva propuesta de actividad", detail: "Sofia Munoz envio una actividad para aprobacion", date: "Hace 10 min", source: "Sistema" },
	{ id: "sys-002", title: "Recordatorio de asistencia", detail: "Manana hay 4 actividades con alto cupo", date: "Hace 1 hora", source: "Sistema" },
	{ id: "sys-003", title: "Usuario nuevo registrado", detail: "Matias Silva se registro en la plataforma", date: "Hace 2 horas", source: "Sistema" }
];

export default function AdminNotifications() {
	const [notifications, setNotifications] = useState(initialNotifications);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [detail, setDetail] = useState("");
	const [error, setError] = useState("");

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

	function publishNotification() {
		if (!title.trim()) {
			setError("Ingresa un titulo para la notificacion.");
			return;
		}

		if (!detail.trim()) {
			setError("Ingresa el mensaje de la notificacion.");
			return;
		}

		setNotifications(previous => [
			{
				id: `sys-${Date.now()}`,
				title: title.trim(),
				detail: detail.trim(),
				date: "Ahora",
				source: "Admin"
			},
			...previous
		]);

		closeModal();
	}

	return (
		<section className="admin-page">
			<header className="admin-page-header admin-toolbar">
				<div>
					<h1>Notificaciones</h1>
					<p>Alertas del sistema y eventos recientes</p>
				</div>
				<button type="button" className="btn btn-primary" onClick={openModal}>
					Agregar notificacion
				</button>
			</header>

			<section className="admin-panel">
				<div className="admin-list">
					{notifications.map(item => (
						<article key={item.id} className="admin-list-item">
							<div>
								<strong>{item.title}</strong>
								<p>{item.detail}</p>
								<div className="admin-notification-meta">
									<span className={`admin-chip ${item.source === "Admin" ? "is-admin" : ""}`}>{item.source}</span>
								</div>
							</div>
							<span className="admin-chip">{item.date}</span>
						</article>
					))}
				</div>
			</section>

			<Modal
				isOpen={isModalOpen}
				title="Nueva notificacion del sistema"
				onClose={closeModal}
				footer={
					<>
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={publishNotification}>
							Publicar notificacion
						</button>
					</>
				}
			>
				<div className="admin-modal-field">
					<label htmlFor="notification-title">Titulo</label>
					<input
						id="notification-title"
						className="admin-input"
						value={title}
						onChange={event => {
							setTitle(event.target.value);
							if (error) setError("");
						}}
						placeholder="Ejemplo: Mantencion programada"
					/>
				</div>

				<div className="admin-modal-field" style={{ marginTop: "0.75rem" }}>
					<label htmlFor="notification-detail">Mensaje</label>
					<textarea
						id="notification-detail"
						className="admin-textarea"
						value={detail}
						onChange={event => {
							setDetail(event.target.value);
							if (error) setError("");
						}}
						placeholder="Ejemplo: El sistema estara en mantencion este sabado de 23:00 a 01:00."
					/>
					{error && <p className="admin-field-error">{error}</p>}
				</div>
			</Modal>
		</section>
	);
}
