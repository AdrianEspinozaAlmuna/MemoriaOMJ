import React from "react";
import "../styles/adminPages.css";

const summary = [
	{ label: "Total Usuarios", value: 247 },
	{ label: "Actividades Activas", value: 18 },
	{ label: "Pendientes Aprobacion", value: 5 },
	{ label: "Asistencia Promedio", value: "82%" }
];

const pendingActivities = [
	{ title: "Taller de Guitarra para Principiantes", subtitle: "Por Ana Martinez - Taller" },
	{ title: "Torneo de Ajedrez", subtitle: "Por Pedro Soto - Deporte" },
	{ title: "Cine Foro: Peliculas Latinoamericanas", subtitle: "Por Laura Diaz - Cultural" }
];

const recentUsers = [
	{ initials: "CT", name: "Camila Torres", email: "camila@email.cl", group: "Grupo A" },
	{ initials: "DP", name: "Diego Perez", email: "diego@email.cl", group: "Grupo B" },
	{ initials: "VR", name: "Valentina Rojas", email: "vale@email.cl", group: "Grupo C" }
];

function MetricIcon({ index }) {
	if (index === 0) {
		return <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" />;
	}

	if (index === 1) {
		return <path d="M3 12h4l2-5 4 10 2-5h6" />;
	}

	if (index === 2) {
		return <path d="M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
	}

	return <path d="m5 16 4-4 3 3 7-7M15 8h4v4" />;
}

function QuickIcon({ type }) {
	if (type === "users") {
		return <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" />;
	}

	if (type === "calendar") {
		return <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />;
	}

	return <path d="M5 20h14M7 16V8m5 8V4m5 12v-6" />;
}

export default function AdminDashboard() {
	return (
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Panel de Administracion</h1>
				<p>Gestiona usuarios, actividades y revisa estadisticas</p>
			</header>

			<section className="admin-grid-cards">
				{summary.map((card, index) => (
					<article key={card.label} className="admin-metric-card">
						<div className="admin-metric-top">
							<p>{card.label}</p>
							<span className="admin-metric-icon">
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<MetricIcon index={index} />
								</svg>
							</span>
						</div>
						<strong>{card.value}</strong>
					</article>
				))}
			</section>

			<section className="admin-layout-2">
				<article className="admin-panel">
					<h2>Actividades Pendientes</h2>
					<p className="admin-panel-subtitle">Requieren tu aprobacion</p>
					<div className="admin-list">
						{pendingActivities.map(activity => (
							<div key={activity.title} className="admin-list-item">
								<div>
									<strong>{activity.title}</strong>
									<p>{activity.subtitle}</p>
								</div>
								<button type="button" className="admin-btn-inline">
									Ver
								</button>
							</div>
						))}
					</div>
					<button type="button" className="admin-btn-ghost-wide">
						Ver todas las pendientes
					</button>
				</article>

				<article className="admin-panel">
					<h2>Usuarios Recientes</h2>
					<p className="admin-panel-subtitle">Ultimos registros</p>
					<div className="admin-list">
						{recentUsers.map(user => (
							<div key={user.email} className="admin-list-item">
								<div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
									<span className="admin-user-avatar">{user.initials}</span>
									<div>
										<strong>{user.name}</strong>
										<p>{user.email}</p>
									</div>
								</div>
								<span className="admin-chip">{user.group}</span>
							</div>
						))}
					</div>
					<button type="button" className="admin-btn-ghost-wide">
						Ver todos los usuarios
					</button>
				</article>
			</section>

			<section className="admin-quick-grid">
				<article className="admin-quick-card">
					<div className="admin-quick-icon">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<QuickIcon type="users" />
						</svg>
					</div>
					<div>
						<strong>Gestion de Usuarios</strong>
						<p>Ver y editar</p>
					</div>
				</article>
				<article className="admin-quick-card">
					<div className="admin-quick-icon is-green">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<QuickIcon type="calendar" />
						</svg>
					</div>
					<div>
						<strong>Calendario</strong>
						<p>Ver y modificar</p>
					</div>
				</article>
				<article className="admin-quick-card">
					<div className="admin-quick-icon is-purple">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<QuickIcon type="report" />
						</svg>
					</div>
					<div>
						<strong>Reportes</strong>
						<p>Estadisticas y datos</p>
					</div>
				</article>
			</section>
		</section>
	);
}
