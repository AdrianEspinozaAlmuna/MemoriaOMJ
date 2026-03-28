import React from "react";
import "../styles/adminPages.css";

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
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Actividades</h1>
				<p>Gestion general de actividades publicadas</p>
			</header>

			<section className="admin-activities-list">
				{activities.map(item => (
					<article key={item.id} className="admin-activity-card">
						<div className="admin-activity-badges">
							<span className="admin-chip is-type">{item.category}</span>
							<span className={`admin-chip ${item.status === "Activa" ? "is-state-aprobada" : "is-state-pendiente"}`}>
								{item.status}
							</span>
						</div>

						<h2>{item.title}</h2>
						<p>{item.description}</p>

						<div className="admin-activity-meta-grid">
							<div className="admin-activity-meta">
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="place" /></svg>
									</span>
									<span>Lugar: {item.place}</span>
								</div>
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="seats" /></svg>
									</span>
									<span>Inscritos: {item.enrolled}</span>
								</div>
							</div>
							<div className="admin-activity-meta">
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="calendar" /></svg>
									</span>
									<span>Fecha: {item.date}</span>
								</div>
								<div className="admin-meta-item">
									<span className="admin-meta-icon" aria-hidden="true">
										<svg viewBox="0 0 24 24" focusable="false"><MetaIcon name="time" /></svg>
									</span>
									<span>Hora: {item.time}</span>
								</div>
							</div>
						</div>

						<div className="admin-activity-actions">
							<button type="button" className="admin-btn-inline">Editar</button>
							<button type="button" className="admin-btn-inline">Ver detalle</button>
						</div>
					</article>
				))}
			</section>
		</section>
	);
}
