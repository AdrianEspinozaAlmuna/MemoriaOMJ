import React from "react";
import { Activity, BarChart3, CalendarDays, PieChart, Star, TrendingUp, Users } from "lucide-react";

const summaryCards = [
	{ label: "Asistencia mensual", value: "84%", icon: TrendingUp },
	{ label: "Actividades ejecutadas", value: "52", icon: Activity },
	{ label: "Participantes unicos", value: "318", icon: Users },
	{ label: "Valoracion promedio", value: "4.6/5", icon: Star }
];

const monthlyAttendance = [
	{ month: "Ene", value: 68 },
	{ month: "Feb", value: 72 },
	{ month: "Mar", value: 75 },
	{ month: "Abr", value: 78 },
	{ month: "May", value: 82 },
	{ month: "Jun", value: 84 }
];

const byCategory = [
	{ name: "Formacion", value: 24 },
	{ name: "Cultural", value: 18 },
	{ name: "Deporte", value: 16 },
	{ name: "Arte", value: 14 },
	{ name: "Idiomas", value: 10 }
];

const statusSplit = [
	{ name: "Aprobadas", value: 61, color: "var(--primary)" },
	{ name: "Pendientes", value: 24, color: "var(--accent)" },
	{ name: "Rechazadas", value: 15, color: "var(--reject)" }
];

const reportRows = [
	{ id: "rp-001", title: "Taller de Fotografia Urbana", category: "Arte", manager: "Ana Martinez", room: "Sala Creativa", date: "2026-04-12", startTime: "16:00", endTime: "18:00", enrolled: 18, capacity: 22 },
	{ id: "rp-002", title: "Laboratorio de Empleabilidad", category: "Formacion", manager: "Pedro Soto", room: "Lab OMJ", date: "2026-04-13", startTime: "10:00", endTime: "12:30", enrolled: 20, capacity: 28 },
	{ id: "rp-003", title: "Entrenamiento Funcional", category: "Deporte", manager: "Valentina Rojas", room: "Cancha Multiuso", date: "2026-04-14", startTime: "18:00", endTime: "19:30", enrolled: 25, capacity: 30 },
	{ id: "rp-004", title: "Club de Ingles Conversacional", category: "Idiomas", manager: "Sofia Munoz", room: "Aula 3", date: "2026-04-15", startTime: "15:30", endTime: "17:00", enrolled: 12, capacity: 20 },
	{ id: "rp-005", title: "Ciclo de Cine Comunitario", category: "Cultural", manager: "Lucas Ramirez", room: "Auditorio", date: "2026-04-16", startTime: "19:00", endTime: "21:00", enrolled: 31, capacity: 45 },
	{ id: "rp-006", title: "Taller de Finanzas Personales", category: "Formacion", manager: "Matias Silva", room: "Sala Innovacion", date: "2026-04-17", startTime: "14:30", endTime: "16:00", enrolled: 16, capacity: 26 },
	{ id: "rp-007", title: "Foro de Innovacion Juvenil", category: "Formacion", manager: "Camila Torres", room: "Salon Principal", date: "2026-04-18", startTime: "11:00", endTime: "13:00", enrolled: 27, capacity: 35 },
	{ id: "rp-008", title: "Clinica de Futbol Sala", category: "Deporte", manager: "Diego Perez", room: "Gimnasio", date: "2026-04-19", startTime: "17:00", endTime: "19:00", enrolled: 19, capacity: 24 },
	{ id: "rp-009", title: "Introduccion a Podcast", category: "Cultural", manager: "Sofia Munoz", room: "Sala Multimedia", date: "2026-04-20", startTime: "10:30", endTime: "12:00", enrolled: 14, capacity: 20 },
	{ id: "rp-010", title: "Muralismo Comunitario", category: "Arte", manager: "Lucas Ramirez", room: "Patio OMJ", date: "2026-04-21", startTime: "15:00", endTime: "18:00", enrolled: 17, capacity: 24 }
];

const weeklyActivity = [
	{ day: "Lun", value: 6 },
	{ day: "Mar", value: 9 },
	{ day: "Mie", value: 8 },
	{ day: "Jue", value: 11 },
	{ day: "Vie", value: 10 },
	{ day: "Sab", value: 7 }
];

const maxWeeklyValue = Math.max(...weeklyActivity.map(item => item.value));

function AttendancePolyline() {
	const max = Math.max(...monthlyAttendance.map(point => point.value));
	const min = Math.min(...monthlyAttendance.map(point => point.value));
	const span = Math.max(1, max - min);
	const width = 360;
	const height = 160;
	const stepX = width / (monthlyAttendance.length - 1);

	const points = monthlyAttendance
		.map((point, index) => {
			const x = index * stepX;
			const normalized = (point.value - min) / span;
			const y = height - normalized * 120 - 20;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg viewBox="0 0 360 160" className="h-[180px] w-full" role="img" aria-label="Tendencia de asistencia mensual">
			<defs>
				<linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="rgba(5,166,61,0.22)" />
					<stop offset="100%" stopColor="rgba(5,166,61,0.02)" />
				</linearGradient>
			</defs>
			<polyline points={points} fill="none" stroke="#12934f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
			<polygon points={`0,160 ${points} 360,160`} fill="url(#attendanceFill)" />
			{monthlyAttendance.map((point, index) => {
				const x = index * stepX;
				const normalized = (point.value - min) / span;
				const y = height - normalized * 120 - 20;
				return <circle key={point.month} cx={x} cy={y} r="4" fill="#0d7e41" />;
			})}
		</svg>
	);
}

function StatusDonut() {
	const gradient = `conic-gradient(${statusSplit.map((item, index) => {
		const previous = statusSplit.slice(0, index).reduce((acc, current) => acc + current.value, 0);
		return `${item.color} ${previous}% ${previous + item.value}%`;
	}).join(",")})`;

	return (
		<div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
			<div className="mx-auto h-[148px] w-[148px] rounded-full" style={{ background: gradient }}>
				<div className="mx-auto mt-[24px] grid h-[100px] w-[100px] place-items-center rounded-full bg-white text-center">
					<p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">Total</p>
					<p className="m-0 text-[1.4rem] font-bold text-[var(--text)]">100%</p>
				</div>
			</div>
			<div className="grid gap-2">
				{statusSplit.map(item => (
					<div key={item.name} className="flex items-center justify-between gap-3 rounded-md border border-[#deebe3] bg-[#fbfefc] px-3 py-2">
						<span className="inline-flex items-center gap-2 text-[0.88rem] text-[var(--text)]">
							<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
							{item.name}
						</span>
						<strong className="text-[0.9rem] text-[var(--text)]">{item.value}%</strong>
					</div>
				))}
			</div>
		</div>
	);
}

export default function AdminReports() {
	return (
		<section className="animate-[revealUp_0.7s_ease_both] grid gap-6">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Reportes</h1>
				<p className="max-w-3xl text-[0.96rem] text-[var(--text-muted)]">Monitorea rendimiento, participacion y genera reportes por actividad.</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map(card => {
					const Icon = card.icon;
					return (
						<article key={card.label} className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors">
							<div className="flex items-center justify-between gap-2">
								<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">{card.label}</p>
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
									<Icon className="h-4 w-4" strokeWidth={1.85} />
								</span>
							</div>
							<strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{card.value}</strong>
						</article>
					);
				})}
			</section>

			<section className="grid gap-4 xl:grid-cols-3">
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm xl:col-span-2">
					<div className="mb-3 flex items-center justify-between gap-3">
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Tendencia de asistencia</h2>
						<span className="inline-flex items-center gap-1.5 rounded-md bg-[#edf7f1] px-2.5 py-1 text-[0.78rem] font-semibold text-[#1e7f4c]">
							<TrendingUp className="h-3.5 w-3.5" />
							+6 pts ultimos 3 meses
						</span>
					</div>
					<AttendancePolyline />
					<div className="mt-2 grid grid-cols-6 gap-1 text-center text-[0.76rem] text-[var(--text-muted)]">
						{monthlyAttendance.map(point => (
							<span key={point.month}>{point.month}</span>
						))}
					</div>
				</article>

				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-3 flex items-center gap-2">
						<PieChart className="h-4 w-4 text-[var(--primary)]" />
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Estado de actividades</h2>
					</div>
					<StatusDonut />
				</article>
			</section>

			<section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<BarChart3 className="h-4 w-4 text-[var(--primary)]" />
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Actividades por categoria</h2>
					</div>
					<div className="grid gap-3">
						{byCategory.map(item => (
							<div key={item.name} className="grid gap-1.5">
								<div className="flex items-center justify-between text-[0.86rem]">
									<span className="text-[var(--text)]">{item.name}</span>
									<strong className="text-[var(--text)]">{item.value}</strong>
								</div>
								<div className="h-2 rounded-full bg-[#ecf4ef]">
									<div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--primary-strong))]" style={{ width: `${Math.max(14, (item.value / 24) * 100)}%` }} />
								</div>
							</div>
						))}
					</div>
				</article>

				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<CalendarDays className="h-4 w-4 text-[var(--primary)]" />
						<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Actividad semanal</h2>
					</div>
					<div className="grid gap-3">
						{weeklyActivity.map(item => (
							<div key={item.day} className="grid gap-1.5 text-[0.84rem]">
								<div className="flex items-center justify-between gap-3">
									<span className="text-[var(--text-muted)]">{item.day}</span>
									<strong className="text-right text-[var(--text)]">{item.value}</strong>
								</div>
								<div className="h-2 rounded-full bg-[#edf5f0]">
									<div className="h-2 rounded-full bg-[#1e9b57]" style={{ width: `${(item.value / maxWeeklyValue) * 100}%` }} />
								</div>
							</div>
						))}
					</div>

				</article>
			</section>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
				<div className="mb-4 flex items-baseline justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Actividades para reportar</h2>
					<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">Tabla completa para generar reportes individuales</p>
				</div>

				<div className="overflow-x-auto rounded-md">
					<table className="min-w-[1040px] w-full text-[0.89rem] max-[640px]:min-w-[980px]">
						<thead>
							<tr>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Actividad</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Categoria</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Encargado</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Sala</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Fecha</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Hora inicio-termino</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Inscritos</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Estado</th>
								<th className="border-b border-[#d8e6dd] bg-[#f5faf7] px-3 py-2 text-left text-[0.73rem] font-semibold text-[var(--text-muted)]">Accion</th>
							</tr>
						</thead>
						<tbody>
							{reportRows.map(row => (
								<tr key={row.id}>
									<td className="border-b border-[#d8e6dd] px-3 py-3 font-semibold text-[var(--text)]">{row.title}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.category}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.manager}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.room}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.date}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.startTime} - {row.endTime}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3 text-[var(--text)]">{row.enrolled}/{row.capacity}</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3">
										<span className="inline-flex rounded-md bg-[#eaf6ef] px-2 py-1 text-[0.8rem] font-semibold text-[#1a7d47]">
											Finalizada
										</span>
									</td>
									<td className="border-b border-[#d8e6dd] px-3 py-3">
										<button
											type="button"
											className="inline-flex rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3 py-1.5 text-[0.82rem] font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
										>
											Realizar reporte
										</button>
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
