import React from "react";
import "../styles/adminPages.css";

export default function AdminSettings() {
	return (
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Configuracion</h1>
				<p>Ajustes generales de la plataforma</p>
			</header>

			<section className="admin-panel">
				<div className="admin-filter-grid">
					<label>
						Nombre del sistema
						<input className="admin-input" defaultValue="OMJ Curico" />
					</label>
					<label>
						Email de contacto
						<input className="admin-input" defaultValue="contacto@omj.cl" />
					</label>
					<label>
						Modo de notificaciones
						<select className="admin-select" defaultValue="activo">
							<option value="activo">Activo</option>
							<option value="solo-criticas">Solo criticas</option>
						</select>
					</label>
					<label>
						Frecuencia de reportes
						<select className="admin-select" defaultValue="semanal">
							<option value="diario">Diario</option>
							<option value="semanal">Semanal</option>
							<option value="mensual">Mensual</option>
						</select>
					</label>
				</div>

				<button type="button" className="btn btn-primary" style={{ marginTop: "1rem" }}>
					Guardar cambios
				</button>
			</section>
		</section>
	);
}
