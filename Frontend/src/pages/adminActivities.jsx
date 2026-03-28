import React from "react";

function MetaIcon({ name }) {
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
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Actividades</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Gestion general de actividades publicadas</p>
			</header>

			<section className="grid w-full gap-3.5 xl:grid-cols-2">
				{activities.map(item => (
					<article key={item.id} className="grid gap-2.5 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white px-5 py-5 shadow-[var(--panel-shadow)]">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-[#f3f8f5] px-2 py-1 text-[0.78rem] font-semibold text-[#406251]">{item.category}</span>
							<span className={`rounded-md px-2 py-1 text-[0.78rem] font-semibold ${item.status === "Activa" ? "bg-[#e7f5ec] text-[#177945]" : "bg-[#fff3de] text-[#b87015]"}`}>
								{item.status}
							</span>
						</div>

						<h2 className="m-0 text-[1.2rem] font-bold text-[#20372b]">{item.title}</h2>
						<p className="text-[0.92rem] text-[#5f786a]">{item.description}</p>

						<div className="grid gap-3 min-[761px]:grid-cols-2">
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"><MetaIcon name="place" /></svg>
									</span>
									<span className="text-[0.9rem] text-[#52695c]">Lugar: {item.place}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"><MetaIcon name="seats" /></svg>
									</span>
									<span className="text-[0.9rem] text-[#52695c]">Inscritos: {item.enrolled}</span>
								</div>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"><MetaIcon name="calendar" /></svg>
									</span>
									<span className="text-[0.9rem] text-[#52695c]">Fecha: {item.date}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="grid h-[1.15rem] w-[1.15rem] place-items-center text-[#60796d]" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false" className="h-4 w-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"><MetaIcon name="time" /></svg>
									</span>
									<span className="text-[0.9rem] text-[#52695c]">Hora: {item.time}</span>
								</div>
							</div>
						</div>

						<div className="mt-1 flex flex-wrap items-center gap-2">
							<button type="button" className="cursor-pointer rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.86rem] font-semibold text-[#1f5137]">Editar</button>
							<button type="button" className="cursor-pointer rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.86rem] font-semibold text-[#1f5137]">Ver detalle</button>
						</div>
					</article>
				))}
			</section>
		</section>
	);
}
