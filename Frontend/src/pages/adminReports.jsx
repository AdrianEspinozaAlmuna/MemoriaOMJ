import React from "react";

export default function AdminReports() {
	return (
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Reportes</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Estadisticas generales de participacion y actividad</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Asistencia mensual</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">84%</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Actividades completadas</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">37</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Usuarios recurrentes</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">126</strong></article>
				<article className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]"><p className="m-0 text-[0.9rem] text-[#6d8275]">Retencion trimestral</p><strong className="text-[2rem] font-bold leading-none text-[#20372b]">76%</strong></article>
			</section>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
				<h2 className="m-0 text-[1.08rem] font-bold text-[#23392d]">Resumen ejecutivo</h2>
				<p className="mb-3 mt-1 text-[0.92rem] text-[#6f8277]">
					La asistencia se mantiene estable y las actividades de formacion lideran la participacion.
				</p>
				<button type="button" className="btn btn-primary">Exportar reporte</button>
			</section>
		</section>
	);
}
