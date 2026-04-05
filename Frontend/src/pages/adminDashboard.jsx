import React from "react";
import { Activity, BarChart3, CalendarDays, Clock3, TrendingUp, Users } from "lucide-react";

const summary = [
	{ label: "Total Usuarios", value: 247 },
	{ label: "Actividades Activas", value: 18 },
	{ label: "Pendientes Aprobacion", value: 5 },
	{ label: "Asistencia Promedio", value: "82%" }
];

const pendingActivities = [
	{ title: "Taller de Guitarra para Principiantes", subtitle: "Por Ana Martinez - Taller" },
	{ title: "Torneo de Ajedrez", subtitle: "Por Pedro Soto - Deporte" },
	{ title: "Cine Foro: Peliculas Latinoamericanas", subtitle: "Por Laura Diaz - Cultural" }
];

const recentUsers = [
	{ initials: "CT", name: "Camila Torres", email: "camila@email.cl", group: "Grupo A" },
	{ initials: "DP", name: "Diego Perez", email: "diego@email.cl", group: "Grupo B" },
	{ initials: "VR", name: "Valentina Rojas", email: "vale@email.cl", group: "Grupo C" }
];

function MetricIcon({ index, className = "h-[1.15rem] w-[1.15rem]" }) {
	if (index === 0) {
		return <Users aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (index === 1) {
		return <Activity aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (index === 2) {
		return <Clock3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	return <TrendingUp aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

function QuickIcon({ type, className = "h-[1.2rem] w-[1.2rem]" }) {
	if (type === "users") {
		return <Users aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	if (type === "calendar") {
		return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	return <BarChart3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

export default function AdminDashboard() {
	return (
		<section className="space-y-8">
			<header>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Panel de Administracion</h1>
				<p className="mt-1.5 text-[0.92rem] text-[var(--text-muted)]">Gestiona usuarios, actividades y revisa estadisticas</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summary.map((card, index) => (
					<article key={card.label} className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm">
						<div className="flex items-center justify-between gap-2">
							<p className="m-0 text-[0.9rem] font-medium text-[var(--text-muted)]">{card.label}</p>
							<span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f5ec] text-[#168845]">
								<MetricIcon index={index} />
							</span>
						</div>
						<strong className="text-[2rem] font-bold leading-none text-[var(--text)]">{card.value}</strong>
					</article>
				))}
			</section>

			<section className="grid gap-3.5 xl:grid-cols-[1.05fr_1fr]">
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Actividades Pendientes</h2>
					<p className="mb-4 mt-1 text-[0.92rem] text-[var(--text-muted)]">Requieren tu aprobacion</p>
					<div className="grid gap-2">
						{pendingActivities.map(activity => (
							<div key={activity.title} className="flex items-center justify-between gap-3 rounded-lg border border-[#d8e6dd] bg-white px-3 py-3">
								<div>
									<strong className="text-[0.95rem] text-[var(--text)]">{activity.title}</strong>
									<p className="mt-0.5 text-[0.82rem] text-[var(--text-muted)]">{activity.subtitle}</p>
								</div>
								<button type="button" className="rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.8rem] font-semibold text-[#1f5137] hover:bg-[#ebf7f0]">
									Ver
								</button>
							</div>
						))}
					</div>
					<button type="button" className="mt-3 w-full rounded-lg border border-[#d8e6dd] bg-white px-3 py-2.5 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f9fbfa]">
						Ver todas las pendientes
					</button>
				</article>

				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-6 shadow-sm">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Usuarios Recientes</h2>
					<p className="mb-4 mt-1 text-[0.92rem] text-[var(--text-muted)]">Ultimos registros</p>
					<div className="grid gap-2">
						{recentUsers.map(user => (
							<div key={user.email} className="flex items-center justify-between gap-3 rounded-lg border border-[#d8e6dd] bg-white px-3 py-3">
								<div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
									<span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#138b47,#0f7f40)] text-[0.73rem] font-bold text-white">{user.initials}</span>
									<div>
										<strong className="text-[0.95rem] text-[var(--text)]">{user.name}</strong>
										<p className="mt-0.5 text-[0.82rem] text-[var(--text-muted)]">{user.email}</p>
									</div>
								</div>
								<span className="rounded-md bg-[#eef8f1] px-2 py-1 text-[0.75rem] font-semibold text-[#2e5a45]">{user.group}</span>
							</div>
						))}
					</div>
					<button type="button" className="mt-3 w-full rounded-lg border border-[#d8e6dd] bg-white px-3 py-2.5 text-[0.9rem] font-semibold text-[var(--text)] hover:bg-[#f9fbfa]">
						Ver todos los usuarios
					</button>
				</article>
			</section>

			<section className="grid gap-3.5 xl:grid-cols-3">
				<article className="flex items-center gap-3 rounded-xl border border-[#d8e6dd] bg-white px-4 py-4 shadow-sm">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#e6f4ea] text-[#178845]">
						<QuickIcon type="users" />
					</div>
					<div>
						<strong className="block text-[0.95rem] text-[var(--text)]">Gestion de Usuarios</strong>
						<p className="text-[0.85rem] text-[var(--text-muted)]">Ver y editar</p>
					</div>
				</article>
				<article className="flex items-center gap-3 rounded-xl border border-[#d8e6dd] bg-white px-4 py-4 shadow-sm">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#dff5e6] text-[#13984f]">
						<QuickIcon type="calendar" />
					</div>
					<div>
						<strong className="block text-[0.95rem] text-[var(--text)]">Calendario</strong>
						<p className="text-[0.85rem] text-[var(--text-muted)]">Ver y modificar</p>
					</div>
				</article>
				<article className="flex items-center gap-3 rounded-xl border border-[#d8e6dd] bg-white px-4 py-4 shadow-sm">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#ecf1ff] text-[#3665db]">
						<QuickIcon type="report" />
					</div>
					<div>
						<strong className="block text-[0.95rem] text-[var(--text)]">Reportes</strong>
						<p className="text-[0.85rem] text-[var(--text-muted)]">Estadisticas y datos</p>
					</div>
				</article>
			</section>
		</section>
	);
}
