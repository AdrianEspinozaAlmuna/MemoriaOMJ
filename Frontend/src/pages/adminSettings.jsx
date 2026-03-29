import React from "react";

export default function AdminSettings() {
	return (
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Configuracion</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Ajustes generales de la plataforma</p>
			</header>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
				<div className="grid gap-3 sm:grid-cols-2">
					<label>
						Nombre del sistema
						<input className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" defaultValue="OMJ Curico" />
					</label>
					<label>
						Email de contacto
						<input className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" defaultValue="contacto@omj.cl" />
					</label>
					<label>
						Modo de notificaciones
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" defaultValue="activo">
							<option value="activo">Activo</option>
							<option value="solo-criticas">Solo criticas</option>
						</select>
					</label>
					<label>
						Frecuencia de reportes
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" defaultValue="semanal">
							<option value="diario">Diario</option>
							<option value="semanal">Semanal</option>
							<option value="mensual">Mensual</option>
						</select>
					</label>
				</div>

				<button type="button" className="btn btn-primary mt-4">
					Guardar cambios
				</button>
			</section>
		</section>
	);
}
