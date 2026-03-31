import React, { useState } from "react";
import Modal from "../components/Modal";

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
			<section className="space-y-8">
				<header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<div>
						<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Notificaciones</h1>
						<p className="mt-1.5 text-[0.92rem] text-[var(--text-muted)]">Alertas del sistema y eventos recientes</p>
					</div>
					<button type="button" className="inline-flex rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[#0a7f3d]" onClick={openModal}>
						Agregar notificacion
					</button>
				</header>

				<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
					<div className="grid gap-2">
						{notifications.map(item => (
							<article key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#d8e6dd] bg-white px-3 py-3">
								<div>
									<strong className="text-[0.95rem] text-[var(--text)]">{item.title}</strong>
									<p className="mt-0.5 text-[0.82rem] text-[var(--text-muted)]">{item.detail}</p>
									<div className="mt-2 flex items-center gap-2">
										<span className={`rounded-md px-2 py-1 text-[0.75rem] font-semibold ${item.source === "Admin" ? "bg-[#e9eefb] text-[#334f93]" : "bg-[#eef8f1] text-[#2e5a45]"}`}>{item.source}</span>
									</div>
								</div>
								<span className="rounded-md bg-[#eef8f1] px-2 py-1 text-[0.75rem] font-semibold text-[#2e5a45]">{item.date}</span>
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
				<div className="grid gap-2">
					<label htmlFor="notification-title">Titulo</label>
					<input
						id="notification-title"
						className="w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
						value={title}
						onChange={event => {
							setTitle(event.target.value);
							if (error) setError("");
						}}
						placeholder="Ejemplo: Mantencion programada"
					/>
				</div>

				<div className="mt-3 grid gap-2">
					<label htmlFor="notification-detail">Mensaje</label>
					<textarea
						id="notification-detail"
						className="min-h-28 w-full resize-y rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]"
						value={detail}
						onChange={event => {
							setDetail(event.target.value);
							if (error) setError("");
						}}
						placeholder="Ejemplo: El sistema estara en mantencion este sabado de 23:00 a 01:00."
					/>
					{error && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{error}</p>}
				</div>
			</Modal>
		</section>
	);
}
