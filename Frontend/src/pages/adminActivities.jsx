import React, { useMemo, useState } from "react";
import ActivityCard from "../components/ActivityCard";

const ITEMS_PER_PAGE = 15;

const activityTemplates = [
	{
		title: "Taller de Fotografia Urbana",
		description: "Sesion practica para mejorar composicion, retrato y edicion basica en terreno.",
		category: "Arte",
		place: "Casa Cultural",
		time: "17:30",
		capacity: 22,
		baseEnrolled: 11,
		manager: "Ana Martinez",
		image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80"
	},
	{
		title: "Laboratorio de Empleabilidad",
		description: "Preparacion de CV, entrevistas y herramientas digitales para postulacion laboral.",
		category: "Formacion",
		place: "Laboratorio OMJ",
		time: "10:00",
		capacity: 28,
		baseEnrolled: 16,
		manager: "Pedro Soto",
		image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
	},
	{
		title: "Entrenamiento Funcional",
		description: "Rutina grupal de acondicionamiento fisico para distintos niveles.",
		category: "Deporte",
		place: "Cancha Multiuso",
		time: "18:15",
		capacity: 30,
		baseEnrolled: 19,
		manager: "Valentina Rojas",
		image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
	},
	{
		title: "Club de Ingles Conversacional",
		description: "Practica guiada para fortalecer fluidez y confianza al hablar ingles.",
		category: "Idiomas",
		place: "Aula 3",
		time: "16:00",
		capacity: 20,
		baseEnrolled: 10,
		manager: "Sofia Munoz",
		image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
	},
	{
		title: "Ciclo de Cine Comunitario",
		description: "Proyecciones tematicas y conversatorio abierto para jovenes participantes.",
		category: "Cultural",
		place: "Auditorio Central",
		time: "19:00",
		capacity: 45,
		baseEnrolled: 27,
		manager: "Lucas Ramirez",
		image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"
	},
	{
		title: "Taller de Finanzas Personales",
		description: "Planificacion de presupuesto, ahorro y metas para jovenes emprendedores.",
		category: "Formacion",
		place: "Sala de Innovacion",
		time: "15:30",
		capacity: 26,
		baseEnrolled: 13,
		manager: "Matias Silva",
		image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80"
	}
];

const allActivities = Array.from({ length: 33 }, (_, index) => {
	const base = activityTemplates[index % activityTemplates.length];
	const month = 4 + Math.floor(index / 11);
	const day = ((index * 2) % 27) + 1;

	return {
		id: `admin-activity-${index + 1}`,
		title: `${base.title} ${index + 1}`,
		description: base.description,
		category: base.category,
		place: base.place,
		date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
		time: base.time,
		capacity: base.capacity,
		enrolled: Math.min(base.capacity, base.baseEnrolled + (index % 8)),
		manager: base.manager,
		state: "Disponible",
		image: base.image
	};
});

export default function AdminActivities() {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.max(1, Math.ceil(allActivities.length / ITEMS_PER_PAGE));
	const safePage = Math.min(currentPage, totalPages);

	const pageItems = useMemo(() => {
		const start = (safePage - 1) * ITEMS_PER_PAGE;
		return allActivities.slice(start, start + ITEMS_PER_PAGE);
	}, [safePage]);

	const showingStart = (safePage - 1) * ITEMS_PER_PAGE + 1;
	const showingEnd = Math.min(safePage * ITEMS_PER_PAGE, allActivities.length);

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Actividades disponibles</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Listado completo de actividades publicadas en formato de cards.</p>
			</header>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Catalogo general</h2>
					<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Mostrando {showingStart}-{showingEnd} de {allActivities.length}</p>
				</div>

				<div className="grid gap-3.5">
					{pageItems.map(activity => (
						<ActivityCard key={activity.id} activity={activity} actionLabel="Gestionar" to={`/admin/actividad/${activity.id}`} />
					))}
				</div>

				<div className="flex items-center justify-between gap-3 pt-5 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
					<span>Pagina {safePage} de {totalPages}</span>
					<div className="inline-flex items-center gap-1.5">
						<button
							type="button"
							className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]"
							disabled={safePage === 1}
							onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
						>
							Anterior
						</button>
						<button type="button" className="rounded-sm px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]">
							{safePage}
						</button>
						<button
							type="button"
							className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]"
							disabled={safePage >= totalPages}
							onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}
						>
							Siguiente
						</button>
					</div>
				</div>
			</section>
		</section>
	);
}
