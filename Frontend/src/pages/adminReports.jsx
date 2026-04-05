import React from "react";

export default function AdminReports() {
	return (
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Reportes</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Estadisticas generales de participacion y actividad</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm"><p className="m-0 text-[0.9rem] font-medium text-[var(--text-muted)]">Asistencia mensual</p><strong className="text-[2rem] font-bold leading-none text-[var(--text)]">84%</strong></article>
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm"><p className="m-0 text-[0.9rem] font-medium text-[var(--text-muted)]">Actividades completadas</p><strong className="text-[2rem] font-bold leading-none text-[var(--text)]">37</strong></article>
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm"><p className="m-0 text-[0.9rem] font-medium text-[var(--text-muted)]">Usuarios recurrentes</p><strong className="text-[2rem] font-bold leading-none text-[var(--text)]">126</strong></article>
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm"><p className="m-0 text-[0.9rem] font-medium text-[var(--text-muted)]">Retencion trimestral</p><strong className="text-[2rem] font-bold leading-none text-[var(--text)]">76%</strong></article>
			</section>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Resumen ejecutivo</h2>
				<p className="mb-4 mt-1 text-[0.92rem] text-[var(--text-muted)]">
					La asistencia se mantiene estable y las actividades de formacion lideran la participacion.
				</p>
				<button type="button" className="inline-flex rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.9rem] font-semibold text-white hover:bg-[#0a7f3d]">Exportar reporte</button>
			</section>
		</section>
	);
}
