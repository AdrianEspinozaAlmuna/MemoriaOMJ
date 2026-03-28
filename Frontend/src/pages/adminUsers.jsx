import React from "react";
import "../styles/adminPages.css";

const users = [
	{ name: "Camila Torres", email: "camila@email.cl", rol: "Participante", group: "Grupo A", activities: 12, attendance: "92%", status: "Activo" },
	{ name: "Diego Perez", email: "diego@email.cl", rol: "Participante", group: "Grupo B", activities: 18, attendance: "88%", status: "Activo" },
	{ name: "Valentina Rojas", email: "vale@email.cl", rol: "Participante", group: "Grupo C", activities: 8, attendance: "75%", status: "Activo" },
	{ name: "Matias Silva", email: "matias@email.cl", rol: "Participante", group: "Grupo A", activities: 25, attendance: "95%", status: "Activo" },
	{ name: "Sofia Munoz", email: "sofia@email.cl", rol: "Encargado", group: "Grupo B", activities: 15, attendance: "90%", status: "Activo" },
	{ name: "Lucas Ramirez", email: "lucas@email.cl", rol: "Participante", group: "Grupo C", activities: 9, attendance: "67%", status: "Inactivo" }
];

function initialsFromName(name) {
	return name
		.split(" ")
		.slice(0, 2)
		.map(part => part[0])
		.join("")
		.toUpperCase();
}

export default function AdminUsers() {
	return (
		<section className="admin-page">
			<header className="admin-page-header admin-toolbar">
				<div>
					<h1>Gestion de Usuarios</h1>
					<p>Administra los usuarios registrados en la plataforma</p>
				</div>
				<button type="button" className="btn btn-primary admin-btn-icon">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m3-4v4m-2-2h4" />
					</svg>
					Agregar Usuario
				</button>
			</header>

			<section className="admin-grid-cards">
				<article className="admin-metric-card"><p>Total Usuarios</p><strong>7</strong></article>
				<article className="admin-metric-card"><p>Activos</p><strong>6</strong></article>
				<article className="admin-metric-card"><p>Encargados</p><strong>2</strong></article>
				<article className="admin-metric-card"><p>Nuevos (este mes)</p><strong>12</strong></article>
			</section>

			<section className="admin-panel">
				<h2>Filtros y Busqueda</h2>
				<div className="admin-filter-row" style={{ marginTop: "0.9rem" }}>
					<input className="admin-input" placeholder="Buscar por nombre o email..." />
					<select className="admin-select"><option>Todos los roles</option></select>
					<select className="admin-select"><option>Todos los grupos</option></select>
				</div>
			</section>

			<section className="admin-panel">
				<h2>Usuarios ({users.length})</h2>
				<p className="admin-panel-subtitle">Lista de todos los usuarios registrados</p>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Usuario</th>
								<th>Rol</th>
								<th>Grupo</th>
								<th>Actividades</th>
								<th>Asistencia</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.email}>
									<td>
										<div className="admin-user-cell">
											<span className="admin-user-mini-avatar">{initialsFromName(user.name)}</span>
											<div>
												<strong>{user.name}</strong>
												<br />
												<span>{user.email}</span>
											</div>
										</div>
									</td>
									<td><span className="admin-chip">{user.rol}</span></td>
									<td>{user.group}</td>
									<td>{user.activities}</td>
									<td>{user.attendance}</td>
									<td>
										<span className={`admin-status ${user.status === "Activo" ? "ok" : "warn"}`}>{user.status}</span>
									</td>
									<td>⋮</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</section>
	);
}
