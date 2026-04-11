import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, ListChecks, MapPin } from "lucide-react";

function MetaIcon({ name, className = "h-4 w-4" }) {
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

const activities = [
	{
		id: "ac-001",
		title: "Taller de Hip-Hop Basico",
		description: "Clase introductoria de ritmos urbanos para nivel inicial.",
		category: "Arte",
		enrolled: 28,
		place: "Sala Urbana",
		date: "2026-04-04",
		time: "17:00",
		status: "Activa"
	},
	{
		id: "ac-002",
		title: "Clases de Salsa Cubana",
		description: "Sesiones semanales de salsa enfocadas en tecnica y practica guiada.",
		category: "Baile",
		enrolled: 32,
		place: "Salon Cultural",
		date: "2026-04-10",
		time: "18:30",
		status: "Activa"
	},
	{
		id: "ac-003",
		title: "Bootcamp de Empleabilidad",
		description: "Taller intensivo para CV, entrevistas y empleabilidad juvenil.",
		category: "Formacion",
		enrolled: 19,
		place: "Laboratorio Digital",
		date: "2026-04-14",
		time: "10:00",
		status: "Cupos bajos"
	}
];

export default function AdminActivities() {
	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Actividades</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Gestion general de actividades publicadas.</p>
			</header>

			<section className="grid w-full gap-4 xl:grid-cols-2">
				{activities.map(item => (
					<article key={item.id} className="rounded-xl border border-[#d8e6dd] bg-white px-5 py-5 shadow-sm flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-[#f3f8f5] px-2 py-1 text-[0.75rem] font-semibold text-[#406251]">{item.category}</span>
							<span className={`rounded-md px-2 py-1 text-[0.75rem] font-semibold ${item.status === "Activa" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#fff3de] text-[#b87015]"}`}>
								{item.status}
							</span>
						</div>

						<h2 className="m-0 text-[1.15rem] font-semibold text-[var(--text)]">{item.title}</h2>
						<p className="text-[0.92rem] text-[var(--text-muted)]">{item.description}</p>

						<div className="grid gap-3 min-[761px]:grid-cols-2 text-[0.9rem]">
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<span className="grid place-items-center text-[var(--text-muted)]">
										<MetaIcon name="place" className="h-4 w-4" />
									</span>
									<span className="text-[var(--text-muted)]">Lugar: {item.place}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="grid place-items-center text-[var(--text-muted)]">
										<MetaIcon name="seats" className="h-4 w-4" />
									</span>
									<span className="text-[var(--text-muted)]">Inscritos: {item.enrolled}</span>
								</div>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<span className="grid place-items-center text-[var(--text-muted)]">
										<MetaIcon name="calendar" className="h-4 w-4" />
									</span>
									<span className="text-[var(--text-muted)]">Fecha: {item.date}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="grid place-items-center text-[var(--text-muted)]">
										<MetaIcon name="time" className="h-4 w-4" />
									</span>
									<span className="text-[var(--text-muted)]">Hora: {item.time}</span>
								</div>
							</div>
						</div>

						<div className="mt-1 flex flex-wrap items-center gap-2">
							<button type="button" className="rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.8rem] font-semibold text-[#1f5137] hover:bg-[#ebf7f0]">Editar</button>
							<Link to={`/admin/actividad/${item.id}`} className="inline-flex rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.8rem] font-semibold text-[#1f5137] hover:bg-[#ebf7f0]">
								Ver detalle
							</Link>
						</div>
					</article>
				))}
			</section>
		</section>
	);
}
