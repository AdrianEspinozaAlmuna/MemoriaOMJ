import React from "react";
import "../styles/adminPages.css";

const users = [
	{ name: "Camila Torres", email: "camila@email.cl", rol: "Participante", group: "Grupo A", activities: 12, attendance: "92%", status: "Exitoso", type: "Asignado", signedUp: "Hace 1 ano" },
	{ name: "Diego Perez", email: "diego@email.cl", rol: "Participante", group: "Grupo B", activities: 18, attendance: "88%", status: "Pendiente", type: "Sin asignar", signedUp: "Hace 2 meses" },
	{ name: "Valentina Rojas", email: "vale@email.cl", rol: "Participante", group: "Grupo C", activities: 8, attendance: "75%", status: "Atrasado", type: "Asignado", signedUp: "Hace 8 meses" },
	{ name: "Matias Silva", email: "matias@email.cl", rol: "Participante", group: "Grupo A", activities: 25, attendance: "95%", status: "Exitoso", type: "Suscripcion", signedUp: "Hace 4 meses" },
	{ name: "Sofia Munoz", email: "sofia@email.cl", rol: "Encargado", group: "Grupo B", activities: 15, attendance: "90%", status: "Exitoso", type: "Suscripcion", signedUp: "Hace 1 ano" },
	{ name: "Lucas Ramirez", email: "lucas@email.cl", rol: "Participante", group: "Grupo C", activities: 9, attendance: "67%", status: "Pendiente", type: "Suscripcion", signedUp: "Hace 6 meses" }
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
				<div className="admin-users-controls">
					<div className="admin-search-wrap">
						<input className="admin-input" placeholder="Buscar usuarios" />
					</div>
					<div className="admin-users-filters">
						<label>
							Estado:
							<select className="admin-select">
								<option>Todos</option>
								<option>Exitoso</option>
								<option>Pendiente</option>
								<option>Atrasado</option>
							</select>
						</label>
						<label>
							Rol:
							<select className="admin-select">
								<option>Todos</option>
								<option>Participante</option>
								<option>Encargado</option>
							</select>
						</label>
					</div>
				</div>
			</section>

			<section className="admin-panel admin-users-table-panel">
				<div className="admin-users-table-head">
					<h2>Usuarios</h2>
					<p className="admin-panel-subtitle">Mostrando {users.length} registros</p>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table admin-users-table-modern">
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Estado</th>
								<th>Tipo</th>
								<th>Email</th>
								<th>Registro</th>
								<th>
									<span className="admin-table-sort">Acciones</span>
								</th>
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
												<span>{user.rol}</span>
											</div>
										</div>
									</td>
									<td>
										<span
											className={`admin-status-dot ${
												user.status === "Exitoso" ? "ok" : user.status === "Pendiente" ? "warn" : "danger"
											}`}
										>
											{user.status}
										</span>
									</td>
									<td>{user.type}</td>
									<td>{user.email}</td>
									<td>{user.signedUp}</td>
									<td>
										<button type="button" className="admin-row-menu-btn" aria-label="Mas acciones">
											⋮
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="admin-table-footer">
					<span>Mostrando 1-{users.length} de {users.length}</span>
					<div className="admin-table-pagination">
						<button type="button">Anterior</button>
						<button type="button" className="active">1</button>
						<button type="button">Siguiente</button>
					</div>
				</div>
			</section>
		</section>
	);
}
