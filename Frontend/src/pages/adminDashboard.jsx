import React from "react";

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

function MetricIcon({ index }) {
	if (index === 0) {
		return <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" />;
	}

	if (index === 1) {
		return <path d="M3 12h4l2-5 4 10 2-5h6" />;
	}

	if (index === 2) {
		return <path d="M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
	}

	return <path d="m5 16 4-4 3 3 7-7M15 8h4v4" />;
}

function QuickIcon({ type }) {
	if (type === "users") {
		return <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.76 0-5 1.57-5 3.5A1.5 1.5 0 0 0 4.5 20h7m1.5 0H20a1.5 1.5 0 0 0 1.5-1.5C21.5 16.57 19.26 15 16.5 15H13" />;
	}

	if (type === "calendar") {
		return <path d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />;
	}

	return <path d="M5 20h14M7 16V8m5 8V4m5 12v-6" />;
}

export default function AdminDashboard() {
	return (
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Panel de Administracion</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Gestiona usuarios, actividades y revisa estadisticas</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summary.map((card, index) => (
					<article key={card.label} className="grid gap-2 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
						<div className="flex items-center justify-between gap-2">
							<p className="m-0 text-[0.9rem] text-[#6d8275]">{card.label}</p>
							<span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#e7f5ec] text-[#168845]">
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-[1.15rem] w-[1.15rem] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
									<MetricIcon index={index} />
								</svg>
							</span>
						</div>
						<strong className="text-[2rem] font-bold leading-none text-[#20372b]">{card.value}</strong>
					</article>
				))}
			</section>

			<section className="grid gap-3.5 xl:grid-cols-[1.05fr_1fr]">
				<article className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
					<h2 className="m-0 text-[1.08rem] font-bold text-[#23392d]">Actividades Pendientes</h2>
					<p className="mb-3 mt-0.5 text-[0.92rem] text-[#6f8277]">Requieren tu aprobacion</p>
					<div className="grid gap-2">
						{pendingActivities.map(activity => (
							<div key={activity.title} className="flex items-center justify-between gap-3 rounded-[10px] border border-[#dce9e1] bg-white px-3 py-3">
								<div>
									<strong className="text-[0.98rem] text-[#2d4639]">{activity.title}</strong>
									<p className="mt-0.5 text-[0.88rem] text-[#708277]">{activity.subtitle}</p>
								</div>
								<button type="button" className="cursor-pointer rounded-lg border border-[#c9ddd0] bg-[#f3fbf6] px-2.5 py-1.5 text-[0.86rem] font-semibold text-[#1f5137]">
									Ver
								</button>
							</div>
						))}
					</div>
					<button type="button" className="mt-2.5 w-full cursor-pointer rounded-[10px] border border-[#cde2d5] bg-[#f2faf5] px-3 py-2.5 text-[0.9rem] font-semibold text-[#2a573f]">
						Ver todas las pendientes
					</button>
				</article>

				<article className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
					<h2 className="m-0 text-[1.08rem] font-bold text-[#23392d]">Usuarios Recientes</h2>
					<p className="mb-3 mt-0.5 text-[0.92rem] text-[#6f8277]">Ultimos registros</p>
					<div className="grid gap-2">
						{recentUsers.map(user => (
							<div key={user.email} className="flex items-center justify-between gap-3 rounded-[10px] border border-[#dce9e1] bg-white px-3 py-3">
								<div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
									<span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#138b47,#0f7f40)] text-[0.73rem] font-bold text-[#f8fafc]">{user.initials}</span>
									<div>
										<strong className="text-[0.98rem] text-[#2d4639]">{user.name}</strong>
										<p className="mt-0.5 text-[0.88rem] text-[#708277]">{user.email}</p>
									</div>
								</div>
								<span className="rounded-md bg-[#eef8f1] px-2 py-1 text-[0.78rem] font-semibold text-[#2e5a45]">{user.group}</span>
							</div>
						))}
					</div>
					<button type="button" className="mt-2.5 w-full cursor-pointer rounded-[10px] border border-[#cde2d5] bg-[#f2faf5] px-3 py-2.5 text-[0.9rem] font-semibold text-[#2a573f]">
						Ver todos los usuarios
					</button>
				</article>
			</section>

			<section className="grid gap-3.5 xl:grid-cols-3">
				<article className="flex items-center gap-3 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white px-4 py-3.5 shadow-[var(--panel-shadow)]">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#e6f4ea] text-[#178845]">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-[1.2rem] w-[1.2rem] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
							<QuickIcon type="users" />
						</svg>
					</div>
					<div>
						<strong className="block text-[1.02rem] text-[#263c31]">Gestion de Usuarios</strong>
						<p className="text-[0.92rem] text-[#6d8176]">Ver y editar</p>
					</div>
				</article>
				<article className="flex items-center gap-3 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white px-4 py-3.5 shadow-[var(--panel-shadow)]">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#dff5e6] text-[#13984f]">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-[1.2rem] w-[1.2rem] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
							<QuickIcon type="calendar" />
						</svg>
					</div>
					<div>
						<strong className="block text-[1.02rem] text-[#263c31]">Calendario</strong>
						<p className="text-[0.92rem] text-[#6d8176]">Ver y modificar</p>
					</div>
				</article>
				<article className="flex items-center gap-3 rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white px-4 py-3.5 shadow-[var(--panel-shadow)]">
					<div className="grid h-[2.2rem] w-[2.6rem] place-items-center rounded-lg bg-[#ecf1ff] text-[#3665db]">
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-[1.2rem] w-[1.2rem] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]">
							<QuickIcon type="report" />
						</svg>
					</div>
					<div>
						<strong className="block text-[1.02rem] text-[#263c31]">Reportes</strong>
						<p className="text-[0.92rem] text-[#6d8176]">Estadisticas y datos</p>
					</div>
				</article>
			</section>
		</section>
	);
}
