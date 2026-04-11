import React from "react";

export default function AdminSettings() {
	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Configuracion</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Ajustes generales de la plataforma.</p>
			</header>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<div className="grid gap-4 sm:grid-cols-2">
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Nombre del sistema</span>
						<input className="rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" defaultValue="OMJ Curico" />
					</label>
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Email de contacto</span>
						<input className="rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" defaultValue="contacto@omj.cl" />
					</label>
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Modo de notificaciones</span>
						<select className="rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" defaultValue="activo">
							<option value="activo">Activo</option>
							<option value="solo-criticas">Solo criticas</option>
						</select>
					</label>
					<label className="grid gap-1.5">
						<span className="text-[0.85rem] font-semibold text-[var(--text)]">Frecuencia de reportes</span>
						<select className="rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" defaultValue="semanal">
							<option value="diario">Diario</option>
							<option value="semanal">Semanal</option>
							<option value="mensual">Mensual</option>
						</select>
					</label>
				</div>

				<button type="button" className="mt-6 inline-flex rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[#0a7f3d]">
					Guardar cambios
				</button>
			</section>
		</section>
	);
}
