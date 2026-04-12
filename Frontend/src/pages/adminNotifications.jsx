import React, { useState } from "react";
import { BellRing, Megaphone, Send } from "lucide-react";
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

	function sourcePill(source) {
		if (source === "Admin") {
			return "bg-[#e9eefb] text-[#334f93]";
		}

		return "bg-[#eef8f1] text-[#2e5a45]";
	}

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
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
				<div>
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
					<h1 className="mt-2 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Notificaciones</h1>
					<p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Listado cronologico de alertas internas y comunicaciones publicadas.</p>
				</div>
				<button type="button" className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[var(--primary-strong)]" onClick={openModal}>
					<Send className="h-4 w-4" strokeWidth={1.9} />
					Nueva notificacion
				</button>
			</header>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Bandeja de notificaciones</h2>
					<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Mostrando {notifications.length} registros</p>
				</div>

				<div className="grid gap-3.5">
					{notifications.map(item => (
						<article key={item.id} className="grid gap-4 rounded-[14px] border border-[#d8e6dd] bg-white px-4 py-4 shadow-[0_8px_18px_-20px_rgba(16,24,40,0.28)] lg:grid-cols-[auto_1fr_auto] lg:items-start">
							<span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--primary)] text-white shadow-[0_10px_22px_-18px_rgba(5,166,61,0.45)]">
								<BellRing className="h-4 w-4" strokeWidth={1.9} />
							</span>

							<div className="min-w-0 space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Notificación</p>
									<span className={`inline-flex rounded-md px-2 py-1 text-[0.74rem] font-semibold ${sourcePill(item.source)}`}>{item.source}</span>
								</div>
								<h3 className="m-0 text-[1rem] font-semibold leading-tight text-[var(--text)]">{item.title}</h3>
								<p className="m-0 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
							</div>

							<div className="flex flex-col items-end gap-2 self-start max-[760px]:items-start lg:pt-1">
								<span className="inline-flex rounded-md bg-[#eef8f1] px-2 py-1 text-[0.75rem] font-semibold text-[#2e5a45]">{item.date}</span>
								{item.source === "Admin" && (
									<span className="inline-flex items-center gap-1 rounded-md bg-[#edf1ff] px-2 py-1 text-[0.72rem] font-semibold text-[#39559a]">
										<Megaphone className="h-3.5 w-3.5" strokeWidth={1.9} />
										Difusion
									</span>
								)}
							</div>
						</article>
					))}
				</div>
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
						<button type="button" className="btn btn-ghost btn-inline" onClick={closeModal}>
							Cancelar
						</button>
						<button type="button" className="btn btn-primary btn-inline" onClick={publishNotification}>
							Publicar notificacion
						</button>
					</>
				}
			>
				<div className="border-b border-[#dce7df] bg-[linear-gradient(180deg,#f8fbf9,rgba(248,251,249,0.88))] px-6 py-5 sm:px-7">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Comunicacion interna</p>
							<h3 className="mt-1 text-[1.12rem] font-semibold text-[var(--text)]">Crear notificacion</h3>
							<p className="mt-1 mb-0 text-[0.88rem] text-[var(--text-muted)]">Redacta un aviso claro para participantes o equipo admin.</p>
						</div>
						<button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d7e0d9] bg-white text-[#496053] transition-colors hover:bg-[#f4f7f5]" onClick={closeModal} aria-label="Cerrar modal">
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
							placeholder="Ejemplo: Mantencion programada"
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
							placeholder="Ejemplo: El sistema estara en mantencion este sabado de 23:00 a 01:00."
						/>
						{error && <p className="m-0 text-[0.82rem] font-semibold text-[#a03d2e]">{error}</p>}
					</div>
				</div>
			</Modal>
		</section>
	);
}
