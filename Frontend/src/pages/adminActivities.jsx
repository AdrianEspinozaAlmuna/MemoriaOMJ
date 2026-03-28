import React from "react";
import "../styles/adminPages.css";

const activities = [
	{ title: "Taller de Hip-Hop Basico", category: "Arte", enrolled: 28, date: "2026-04-04", status: "Activa" },
	{ title: "Clases de Salsa Cubana", category: "Baile", enrolled: 32, date: "2026-04-10", status: "Activa" },
	{ title: "Bootcamp de Empleabilidad", category: "Formacion", enrolled: 19, date: "2026-04-14", status: "Cupos bajos" }
];

export default function AdminActivities() {
	return (
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Actividades</h1>
				<p>Gestion general de actividades publicadas</p>
			</header>

			<section className="admin-panel">
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Actividad</th>
								<th>Categoria</th>
								<th>Inscritos</th>
								<th>Fecha</th>
								<th>Estado</th>
							</tr>
						</thead>
						<tbody>
							{activities.map(item => (
								<tr key={item.title}>
									<td>{item.title}</td>
									<td>{item.category}</td>
									<td>{item.enrolled}</td>
									<td>{item.date}</td>
									<td>
										<span className={`admin-status ${item.status === "Activa" ? "ok" : "warn"}`}>{item.status}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</section>
	);
}
