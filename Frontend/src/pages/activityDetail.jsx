import React, { useMemo, useState, useEffect } from "react";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
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
	category: "Comunicacion",
	date: "2026-04-18",
	time: "17:30",
	place: "Sala Multimedia OMJ",
	manager: "Sofia Munoz",
	capacity: 30,
	enrolled: 26,
	description:
		"Sesion practica para crear un podcast desde cero: idea, guion, grabacion y edicion basica. Incluye dinamica grupal y cierre con presentacion de episodios piloto.",
	requirements: ["Notebook o celular para notas", "Puntualidad", "Participacion activa"],
	tags: ["Audio", "Creacion de contenido", "Trabajo en equipo"]
};

export default function ActivityDetail() {
	const { activityId } = useParams();
	const location = useLocation();
	const user = decodeToken(localStorage.getItem("token"));
	const role = user?.rol || "participante";
	const isManagerView = role === "admin" || role === "encargado";
	const [isEnrolled, setIsEnrolled] = useState(false);

	// Ensure the page scrolls to top when entering the detail view
	useEffect(() => {
		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		}
	}, [activityId]);

	const freeSpots = useMemo(() => Math.max(activity.capacity - activity.enrolled, 0), []);
	const backTo = location.pathname.startsWith("/admin") ? "/admin/actividades" : "/user/mis-actividades";

	return (
		<section className="relative animate-[revealUp_0.7s_ease_both]">
			<div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
				{/* Header */}
				<div className="text-left space-y-3">
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Detalle de actividad</p>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">{activity.title}</h1>
							<p className="mt-2 text-[0.93rem] text-[var(--text-muted)]">Categoría: {activity.category}</p>
						</div>
						<span className="inline-flex rounded-lg bg-[#e7f5ec] px-3 py-1.5 text-[0.78rem] font-semibold text-[#177945] flex-shrink-0">Activa</span>
					</div>
				</div>

				{/* Main grid */}
				<section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
					<div className="grid gap-6">
						{/* Información de la Actividad */}
						<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Información de la Actividad</h2>

						<div className="mt-5 space-y-3">
							<div className="flex items-start gap-3">
								<CalendarDays aria-hidden="true" focusable="false" className="h-5 w-5 text-[var(--primary)] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
								<div className="flex-1 min-w-0">
									<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Fecha</p>
									<p className="text-[0.92rem] font-semibold text-[var(--text)] m-0 mt-1">{activity.date}</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Clock3 aria-hidden="true" focusable="false" className="h-5 w-5 text-[var(--primary)] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
								<div className="flex-1 min-w-0">
									<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Hora</p>
									<p className="text-[0.92rem] font-semibold text-[var(--text)] m-0 mt-1">{activity.time}</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<MapPin aria-hidden="true" focusable="false" className="h-5 w-5 text-[var(--primary)] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
								<div className="flex-1 min-w-0">
									<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Lugar</p>
									<p className="text-[0.92rem] font-semibold text-[var(--text)] m-0 mt-1">{activity.place}</p>
								</div>
							</div>
						</div>

						<div className="mt-5 border-t border-[#e0e9e2] pt-5">
							<h3 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Descripción</h3>
							<p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">{activity.description}</p>
						</div>

						<div className="mt-5 rounded-lg border border-[#e0e9e2] bg-[#f9fcfa] p-4">
							<p className="m-0 text-[0.82rem] font-semibold text-[#2d4f3e]">Requisitos</p>
							<ul className="mb-0 mt-3 space-y-2 pl-0">
								{activity.requirements.map(item => (
									<li key={item} className="flex items-start gap-2 text-[0.88rem] text-[var(--text-muted)]">
										<span className="text-[var(--primary)] font-bold mt-0.5">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="mt-5 flex flex-wrap gap-2">
							{activity.tags.map(tag => (
								<span key={tag} className="rounded-full border border-[#cde2d5] bg-[#f2faf5] px-3 py-1.5 text-[0.77rem] font-semibold text-[#2d5b43]">
									{tag}
								</span>
							))}
						</div>

						<div className="mt-5 border-t border-[#e0e9e2] pt-5">
							<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Encargado</p>
							<p className="m-0 text-[1rem] font-semibold text-[var(--text)] mt-2">{activity.manager}</p>
							<p className="m-0 text-[0.85rem] text-[var(--text-muted)] mt-1">Responsable de la actividad</p>
						</div>
					</article>

					{/* Participantes Inscritos */}
					<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
						<div className="flex items-center justify-between gap-3 mb-4">
							<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Participantes Inscritos</h2>
							<span className="rounded-full bg-[#ebf6ef] px-3 py-1 text-[0.75rem] font-semibold text-[#266346]">
								{participants.length}
							</span>
						</div>

						<div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
							{participants.map(person => (
								<div key={person.id} className="flex items-center gap-3 rounded-lg border border-[#e0e9e2] bg-[#fbfdfc] p-3 transition-all hover:bg-[#f5faf7]">
									<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--primary),#0f7f40)] text-[0.7rem] font-bold text-white">
										{person.name
											.split(" ")
											.slice(0, 2)
											.map(n => n[0])
											.join("")}
									</span>
									<div className="min-w-0 flex-1">
										<p className="text-[0.9rem] font-semibold text-[var(--text)] m-0">{person.name}</p>
										<p className="text-[0.8rem] text-[var(--text-muted)] m-0">{person.age} años</p>
									</div>
									<span
										className={`flex-shrink-0 rounded-md px-2.5 py-1 text-[0.72rem] font-semibold whitespace-nowrap ${
											person.status === "Confirmado" 
												? "bg-[#e7f5ec] text-[#177945]" 
												: "bg-[#fff3de] text-[#b87015]"
										}`}
									>
										{person.status}
									</span>
								</div>
							))}
						</div>
					</article>
				</div>

				{/* Panel Lateral */}
				<aside className="grid content-start gap-6">
					{/* Inscripción */}
					<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
						<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Inscripción</p>

						<div className="mt-4 rounded-lg border border-[#d6e5dc] bg-[#f5fbf8] p-4">
							<p className="text-[0.85rem] text-[var(--text-muted)] m-0">Cupos disponibles</p>
							<p className="text-[2.2rem] font-bold text-[var(--primary)] m-0 mt-2">{activity.enrolled}/{activity.capacity}</p>
							<p className="text-[0.8rem] text-[var(--text-muted)] m-0 mt-2">
								{freeSpots === 0 ? "Sin cupos disponibles" : `${freeSpots} cupos libres`}
							</p>
						</div>

						<div className="mt-4 space-y-2">
							{isManagerView ? (
								<>
									<button 
										type="button" 
										className="w-full rounded-lg border border-[#cde2d5] bg-[#f2faf5] px-4 py-2.5 text-[0.88rem] font-semibold text-[#2a573f] transition-all hover:bg-[#ecf7f0]"
									>
										Editar actividad
									</button>
									<button 
										type="button" 
										className="w-full rounded-lg border border-[#cde2d5] bg-[#f2faf5] px-4 py-2.5 text-[0.88rem] font-semibold text-[#2a573f] transition-all hover:bg-[#ecf7f0]"
									>
										Gestionar cupos
									</button>
									<button 
										type="button" 
										className="w-full rounded-lg border border-[#cde2d5] bg-[#f2faf5] px-4 py-2.5 text-[0.88rem] font-semibold text-[#2a573f] transition-all hover:bg-[#ecf7f0]"
									>
										Enviar notificación
									</button>
								</>
							) : (
								<>
									<button
										type="button"
										onClick={() => setIsEnrolled(previous => !previous)}
										className={`w-full rounded-lg border px-4 py-2.5 text-[0.88rem] font-semibold transition-all ${
											isEnrolled 
												? "border-[#f0cbc2] bg-[#fff1ed] text-[#8a3b2a] hover:bg-[#ffe4d9]" 
												: "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]"
										}`}
									>
										{isEnrolled ? "Cancelar inscripción" : "Inscribirme"}
									</button>
									{isEnrolled && (
										<div className="rounded-lg border border-[#d4efde] bg-[#e7f5ec] p-3 text-center">
											<p className="m-0 text-[0.82rem] font-semibold text-[#177945]">✓ Inscripción confirmada</p>
										</div>
									)}
								</>
							)}
						</div>
					</article>

					{/* Información Rápida */}
					<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
						<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Acciones</p>

						<div className="mt-4 space-y-2">
							<button 
								type="button" 
								className="w-full text-left rounded-lg px-3 py-2.5 text-[0.88rem] font-medium text-[#2a573f] transition-all hover:bg-[#f5fbf8]"
							>
								→ Agregar a calendario
							</button>
							<button 
								type="button" 
								className="w-full text-left rounded-lg px-3 py-2.5 text-[0.88rem] font-medium text-[#2a573f] transition-all hover:bg-[#f5fbf8]"
							>
								→ Compartir actividad
							</button>
							<button 
								type="button" 
								className="w-full text-left rounded-lg px-3 py-2.5 text-[0.88rem] font-medium text-[#2a573f] transition-all hover:bg-[#f5fbf8]"
							>
								→ Reportar problema
							</button>
						</div>
					</article>

					{/* Botón Volver */}
					<Link
						to={backTo}
						className="inline-flex justify-center rounded-lg border border-[#cde2d5] bg-[#f2faf5] px-4 py-2.5 text-[0.88rem] font-semibold text-[#2a573f] transition-all hover:bg-[#ecf7f0] text-center"
					>
						Volver al listado
					</Link>
				</aside>
			</section>
		</div>
		</section>
	);
}