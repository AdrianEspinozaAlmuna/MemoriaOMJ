import React, { useMemo, useState, useEffect } from "react";
import { BadgeCheck, CalendarDays, Clock3, Lock, MapPin, MessageCircle, MoreHorizontal, Send, ShieldCheck, Star } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

function decodeToken(token) {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		return JSON.parse(atob(parts[1]));
	} catch (error) {
		return null;
	}
}

const participants = [
	{ id: "usr-01", name: "Camila Torres", age: 18, status: "Confirmado" },
	{ id: "usr-02", name: "Diego Perez", age: 20, status: "Confirmado" },
	{ id: "usr-03", name: "Valentina Rojas", age: 19, status: "Lista de espera" },
	{ id: "usr-04", name: "Martin Fuentes", age: 22, status: "Confirmado" },
	{ id: "usr-05", name: "Antonia Mella", age: 17, status: "Confirmado" }
];

const activity = {
	title: "Laboratorio de Podcast Juvenil",
	date: "2026-04-18",
	hora_inicio: "17:00",
	hora_termino: "19:00",
	place: "Sala Multimedia OMJ",
	manager: "Sofia Munoz",
	id_encargado: 104,
	capacity: 30,
	enrolled: 26,
	description:
		"Sesion practica para crear un podcast desde cero: idea, guion, grabacion y edicion basica. Incluye dinamica grupal y cierre con presentacion de episodios piloto.",
	requirements: ["Notebook o celular para notas", "Puntualidad", "Participacion activa"],
	chat_bidireccional: true,
	aprobado: true,
	status: "programada"
};

const ratingsData = {
	average: 4.6,
	total: 38,
	distribution: [
		{ stars: 5, count: 25 },
		{ stars: 4, count: 9 },
		{ stars: 3, count: 3 },
		{ stars: 2, count: 1 },
		{ stars: 1, count: 0 }
	]
};

const chatMessages = [
	{ id: "msg-01", author: "Sofia", role: "encargado", text: "Recuerden llegar 10 minutos antes para organizar equipos.", time: "16:20" },
	{ id: "msg-02", author: "Pedro", role: "participante", text: "Perfecto, yo llevo audifonos para la prueba.", time: "16:28" },
	{ id: "msg-03", author: "Camila", role: "participante", text: "Yo tambien llevo notebook para editar.", time: "16:31" },
	{ id: "msg-04", author: "Diego", role: "participante", text: "Tenemos que llevar notebook o basta con celular?", time: "16:34" }
];

function getStatusBadge(status) {
	if (status === "finalizada") {
		return { label: "Finalizada", className: "bg-[#e7f5ec] text-[#177945]" };
	}

	if (status === "en_curso") {
		return { label: "En curso", className: "bg-[#e9f3ff] text-[#1d4f91]" };
	}

	if (status === "cancelada") {
		return { label: "Cancelada", className: "bg-[#fff1ed] text-[#8a3b2a]" };
	}

	if (status === "pendiente") {
		return { label: "Pendiente", className: "bg-[#fff3de] text-[#a86612]" };
	}

	return { label: "Programada", className: "bg-[#ecf7f0] text-[#1f6e45]" };
}

function formatDate(value) {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;

	return parsed.toLocaleDateString("es-CL", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric"
	});
}

export default function ActivityDetail() {
	const { activityId } = useParams();
	const location = useLocation();
	const user = decodeToken(localStorage.getItem("token"));
	const role = user?.rol || "participante";
	const currentName = String(user?.nombre || user?.name || "Tu").toLowerCase();
	const isManagerView = role === "admin" || role === "encargado";
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [enrolledCount, setEnrolledCount] = useState(activity.enrolled);
	const [activeParticipantMenu, setActiveParticipantMenu] = useState(null);

	// Ensure the page scrolls to top when entering the detail view
	useEffect(() => {
		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		}
	}, [activityId]);

	const statusBadge = useMemo(() => getStatusBadge(activity.status), []);
	const isFinished = activity.status === "finalizada";
	const canSendChat = isManagerView || activity.chat_bidireccional;
	const freeSpots = useMemo(() => Math.max(activity.capacity - enrolledCount, 0), [enrolledCount]);
	const ratingsTotal = ratingsData.distribution.reduce((acc, item) => acc + item.count, 0);
	const backTo = location.pathname.startsWith("/admin") ? "/admin/actividades" : "/user/mis-actividades";

	function isOwnMessage(message) {
		if (isManagerView && message.role === "encargado") return true;
		return String(message.author || "").toLowerCase() === currentName;
	}

	function getSenderLabel(message) {
		if (message.role === "admin") return `${message.author} · Admin`;
		if (message.role === "encargado") return `${message.author} · Encargado`;
		return message.author;
	}

	function isManagerMessage(message) {
		return message.role === "admin" || message.role === "encargado";
	}

	function handleEnrollmentToggle() {
		setIsEnrolled(previous => {
			if (previous) {
				setEnrolledCount(current => Math.max(current - 1, 0));
				return false;
			}

			if (freeSpots === 0) {
				return previous;
			}

			setEnrolledCount(current => Math.min(current + 1, activity.capacity));
			return true;
		});
	}

	return (
		<section className="relative animate-[revealUp_0.7s_ease_both]">
			<div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
				<div className="text-left space-y-3">
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Detalle de actividad</p>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">{activity.title}</h1>
							<p className="mt-2 text-[0.93rem] text-[var(--text-muted)]">Actividad #{activityId || "sin-id"} · Capacidad máxima {activity.capacity} participantes</p>
						</div>
						<span className={`inline-flex rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold flex-shrink-0 ${statusBadge.className}`}>{statusBadge.label}</span>
					</div>
				</div>

				<section className="flex flex-col gap-6 lg:grid lg:items-start lg:grid-cols-[1.35fr_0.65fr]">
					<div className="grid auto-rows-max content-start gap-6 max-lg:contents">
						<article className="order-1 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Descripción</h2>
							<p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--text-muted)]">{activity.description}</p>


							<div className="mt-6 border-t border-[#e0e9e2] pt-5">
								<h3 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Detalles de la actividad</h3>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Fecha</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<CalendarDays className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{formatDate(activity.date)}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Hora inicio - término</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<Clock3 className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.hora_inicio} - {activity.hora_termino}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Sala / lugar</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<MapPin className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.place}
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Encargado</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<ShieldCheck className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.manager} (ID {activity.id_encargado})
										</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Estado</p>
										<p className="mt-1 text-[0.9rem] font-semibold text-[var(--text)]">{statusBadge.label}</p>
									</div>
									<div className="rounded-lg border border-[#e2ebe4] bg-white px-3.5 py-3">
										<p className="m-0 text-[0.8rem] text-[var(--text-muted)]">Aprobación</p>
										<p className="mt-1 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--text)]">
											<BadgeCheck className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
											{activity.aprobado ? "Aprobada" : "Pendiente de aprobación"}
										</p>
									</div>
								</div>
							</div>
						</article>

					<article className="order-4 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
						<div className="flex items-center justify-between gap-3 mb-4">
							<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Participantes Inscritos</h2>
							<span className="rounded-full bg-[#ebf6ef] px-3 py-1 text-[0.75rem] font-semibold text-[#266346]">
								{participants.length}
							</span>
						</div>

						<div className="overflow-hidden rounded-lg border border-[#e0e9e2] bg-white">
							<div className="divide-y divide-[#e5ede8]">
								{participants.map(person => (
									<div key={person.id} className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3.5 py-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
										<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#d7e4dd] bg-transparent text-[0.7rem] font-bold text-[#2f5c45]">
											{person.name
												.split(" ")
												.slice(0, 2)
												.map(n => n[0])
												.join("")}
										</span>
										<div className="min-w-0 pr-1">
											<p className="m-0 break-words text-[0.91rem] font-semibold leading-snug text-[var(--text)] sm:truncate">{person.name}</p>
											<p className="m-0 mt-0.5 text-[0.8rem] text-[var(--text-muted)]">
												{person.age} años
												<span className={`sm:hidden ${
													person.status === "Confirmado" ? "text-[#177945]" : "text-[#b87015]"
												}`}>
													{" "}· {person.status}
												</span>
											</p>
										</div>
										<span
											className={`hidden flex-shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold whitespace-nowrap sm:inline-flex ${
												person.status === "Confirmado"
													? "bg-[#e7f5ec] text-[#177945]"
													: "bg-[#fff3de] text-[#b87015]"
											}`}
										>
											{person.status}
										</span>
										<button
											type="button"
											onClick={() => setActiveParticipantMenu(previous => (previous === person.id ? null : person.id))}
											className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#5b7265] transition-colors hover:border-[#dce7e0] hover:bg-[#f6faf8]"
											aria-label={`Opciones de ${person.name}`}
										>
											<MoreHorizontal className="h-4 w-4" strokeWidth={2} />
										</button>

										{activeParticipantMenu === person.id && (
											<div className="absolute right-3 top-[calc(100%_-_8px)] z-20 w-[190px] rounded-md border border-[#dce7e0] bg-white p-1.5 shadow-[0_14px_24px_-20px_rgba(10,43,26,0.55)]">
												<button type="button" className="w-full rounded-md px-2.5 py-2 text-left text-[0.82rem] font-medium text-[#274634] hover:bg-[#f4faf7]">Marcar asistencia manual</button>
												<button type="button" className="w-full rounded-md px-2.5 py-2 text-left text-[0.82rem] font-medium text-[#8a3b2a] hover:bg-[#fff4ef]">Expulsar de la actividad</button>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</article>
				</div>

				<aside className="grid content-start gap-6 max-lg:contents lg:sticky lg:top-6 lg:self-start">
					{isFinished ? (
						<article className="order-2 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<div className="mb-4 flex items-center justify-between gap-3">
								<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Valoraciones</h2>
								<span className="rounded-md bg-[#eef8f2] px-2.5 py-1 text-[0.74rem] font-semibold text-[#1f6e45]">{ratingsData.total} reseñas</span>
							</div>

							<div className="rounded-lg border border-[#d8e6dd] bg-[#f8fcfa] px-4 py-3.5">
								<div className="flex items-end justify-between gap-3">
									<p className="m-0 text-[2rem] font-bold leading-none text-[var(--text)]">{ratingsData.average.toFixed(1)}</p>
									<div className="inline-flex items-center gap-0.5" aria-label={`Promedio ${ratingsData.average} de 5`}>
										{Array.from({ length: 5 }).map((_, index) => (
											<Star key={`star-summary-${index}`} className={`h-3.5 w-3.5 ${index < Math.round(ratingsData.average) ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#cbd5e1]"}`} />
										))}
									</div>
								</div>
								<p className="mt-1 mb-0 text-[0.78rem] text-[var(--text-muted)]">Promedio histórico de participantes.</p>
							</div>

							<div className="mt-4 space-y-2">
								{ratingsData.distribution.map(item => {
									const percentage = ratingsTotal === 0 ? 0 : Math.round((item.count / ratingsTotal) * 100);

									return (
										<div key={`rating-${item.stars}`} className="grid grid-cols-[40px_1fr_34px] items-center gap-2 text-[0.78rem]">
											<span className="font-semibold text-[var(--text)]">{item.stars}★</span>
											<div className="h-2 rounded-full bg-[#e7efea]">
												<div className="h-2 rounded-full bg-[#f59e0b]" style={{ width: `${percentage}%` }} />
											</div>
											<span className="text-right text-[var(--text-muted)]">{item.count}</span>
										</div>
									);
								})}
							</div>

							<button
								type="button"
								className="mt-4 w-full rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)]"
							>
								Valorar actividad
							</button>
						</article>
					) : (
						<article className="order-2 rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
							<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Acciones</p>

							<div className="mt-4 rounded-lg border border-[#d6e5dc] bg-[#f5fbf8] p-4">
								<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Cupos disponibles</p>
								<p className="text-[2.2rem] font-bold text-[var(--primary)] m-0 mt-2">{enrolledCount}/{activity.capacity}</p>
								<p className="text-[0.8rem] text-[var(--text-muted)] m-0 mt-2">
									{freeSpots === 0 ? "Sin cupos disponibles" : `${freeSpots} cupos libres`}
								</p>
							</div>

							<div className="mt-4 space-y-2.5">
								{isManagerView ? (
									<>
										<button 
											type="button" 
											className="w-full rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-[0.88rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)]"
										>
											Editar actividad
										</button>
										<button 
											type="button" 
											className="w-full rounded-lg border border-[#cde2d5] bg-[#f2faf5] px-4 py-2.5 text-[0.88rem] font-semibold text-[#2a573f] transition-all hover:bg-[#ecf7f0]"
										>
											Gestionar inscritos
										</button>
										<button 
											type="button" 
											className="w-full rounded-lg border border-[#f2d3cc] bg-[#fff3ef] px-4 py-2.5 text-[0.88rem] font-semibold text-[#8a3b2a] transition-all hover:bg-[#ffe9e2]"
										>
											Enviar notificación
										</button>
									</>
								) : (
									<>
										<button
											type="button"
											onClick={handleEnrollmentToggle}
											disabled={!isEnrolled && freeSpots === 0}
											className={`w-full rounded-sm border px-4 py-2.5 text-[0.88rem] font-semibold transition-all ${
												isEnrolled 
													? "border-[var(--reject)] bg-[var(--reject)] text-white hover:bg-[var(--reject-hover)]" 
													: "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)] disabled:border-[#dce6df] disabled:bg-[#f4f8f6] disabled:text-[#7d9084]"
											}`}
										>
											{isEnrolled ? "Cancelar inscripción" : freeSpots === 0 ? "Sin cupos" : "Inscribirme"}
										</button>
										{isEnrolled && (
											<div className="px-1">
												<p className="m-0 text-[0.84rem] font-semibold text-[var(--primary)]">Inscrito correctamente en la actividad.</p>
												<p className="m-0 mt-0.5 text-[0.78rem] text-[var(--text-muted)]">Tu cupo quedó reservado y podrás registrar asistencia al finalizar.</p>
											</div>
										)}
										{isEnrolled && (
											<button
												type="button"
												className="w-full rounded-sm border-2 border-[var(--primary-soft)] bg-[white] px-4 py-2.5 text-[0.88rem] font-semibold text-[var(--primary)] transition-all hover:bg-[#ecf7f0]"
											>
												Marcar asistencia
											</button>
										)}
									</>
								)}
							</div>
						</article>
					)}

					<article className="order-3 overflow-hidden rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm lg:order-none">
						<div className="mb-3 flex items-center justify-between gap-2">
							<div>
								<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Chat de actividad</h2>
								<p className="m-0 mt-1 text-[0.8rem] text-[var(--text-muted)]">Canal rápido entre encargado y participantes.</p>
							</div>
							<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-sm">
								<MessageCircle className="h-4 w-4" strokeWidth={1.9} />
							</span>
						</div>

						<div className="mb-3 h-1 w-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--primary-soft))]" />

						<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cfe5d8] bg-white px-3 py-1 text-[0.73rem] font-semibold text-[#35604b]">
							{activity.chat_bidireccional ? "Chat bidireccional habilitado" : "Solo encargado/admin puede enviar"}
							{!activity.chat_bidireccional && <Lock className="h-3.5 w-3.5" />}
						</div>

						<div className="rounded-lg border border-[#d4e6db] bg-white">
							<div className="max-h-[260px] space-y-2 overflow-y-auto px-3 py-3">
								{chatMessages.map(message => {
									const own = isOwnMessage(message);
									const managerMessage = isManagerMessage(message);

									return (
										<div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[0.82rem] ${
												own
													? "border border-[#138645] bg-[linear-gradient(180deg,#18a24f,#0f8d43)] text-white shadow-[0_8px_16px_-12px_rgba(6,94,41,0.7)]"
													: managerMessage
														? "border border-[var(--primary)] bg-[linear-gradient(180deg,#f4fbf6,#edf8f1)] text-[#173629] shadow-[0_10px_22px_-18px_rgba(8,40,25,0.34)] ring-1 ring-[rgba(5,166,61,0.08)]"
														: "border border-[#e2ebe6] bg-[#f9fbfa] text-[#2f4d3f]"
											}`}>
												<div className="mb-1 flex items-center justify-between gap-2">
													<p className={`m-0 text-[0.72rem] font-semibold ${own ? "text-[#daf8e6]" : "text-[#537564]"}`}>{getSenderLabel(message)}</p>
													<span className={`text-[0.69rem] ${own ? "text-[#c5f1d7]" : "text-[#7b9286]"}`}>{message.time}</span>
												</div>
												<p className="m-0 leading-relaxed">{message.text}</p>
											</div>
										</div>
									);
								})}
							</div>

							<div className="border-t border-[#e2ebe4] px-3 py-3">
								<div className="grid grid-cols-[1fr_auto] items-center gap-2">
									<input
										type="text"
										className="w-full rounded-md border border-[#d8e6dd] bg-white px-3 py-2 text-[0.84rem] text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20"
										placeholder={canSendChat ? "Escribe un mensaje..." : "Solo encargado/admin puede enviar mensajes"}
										disabled={!canSendChat}
									/>
									<button
										type="button"
										disabled={!canSendChat}
										className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${
											canSendChat
												? "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]"
												: "border-[#dce6df] bg-[#f4f8f6] text-[#7d9084]"
										}`}
									>
										<Send className="h-4 w-4" strokeWidth={2} />
									</button>
								</div>
							</div>
						</div>
					</article>
				</aside>
			</section>
			</div>
		</section>
	);
}