import React from "react";
import "../styles/adminPages.css";

export default function AdminReports() {
	return (
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Reportes</h1>
				<p>Estadisticas generales de participacion y actividad</p>
			</header>

			<section className="admin-grid-cards">
				<article className="admin-metric-card"><p>Asistencia mensual</p><strong>84%</strong></article>
				<article className="admin-metric-card"><p>Actividades completadas</p><strong>37</strong></article>
				<article className="admin-metric-card"><p>Usuarios recurrentes</p><strong>126</strong></article>
				<article className="admin-metric-card"><p>Retencion trimestral</p><strong>76%</strong></article>
			</section>

			<section className="admin-panel">
				<h2>Resumen ejecutivo</h2>
				<p className="admin-panel-subtitle">
					La asistencia se mantiene estable y las actividades de formacion lideran la participacion.
				</p>
				<button type="button" className="btn btn-primary">Exportar reporte</button>
			</section>
		</section>
	);
}
