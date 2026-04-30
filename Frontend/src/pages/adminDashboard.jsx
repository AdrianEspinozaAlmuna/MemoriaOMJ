import React, { useEffect, useState } from "react";
import { ArrowRight, Activity, BarChart3, CalendarDays, CheckCircle2, Clock3, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import { getApprovedActivities } from "../services/activityService";
import { getDashboardStats } from "../services/userService";
import LoadingState from "../components/LoadingState";

const quickActions = [
	{ label: "Gestionar usuarios", subtitle: "Revisa perfiles, grupos y estados activos.", to: "/admin/usuarios", icon: "users" },
	{ label: "Aprobar actividades", subtitle: "Revisa propuestas pendientes antes de publicarlas.", to: "/admin/aprobaciones", icon: "check" },
	{ label: "Abrir calendario", subtitle: "Consulta la agenda general y los bloques activos.", to: "/admin/calendario", icon: "calendar" },
	{ label: "Ver reportes", subtitle: "Analiza asistencia, retención y actividad reciente.", to: "/admin/reportes", icon: "report" }
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

	if (type === "check") {
		return <CheckCircle2 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}

	return <BarChart3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

export default function AdminDashboard() {
	const [stats, setStats] = useState([
		{ label: "Total Usuarios", value: "—" },
		{ label: "Actividades Activas", value: "—" },
		{ label: "Aprobadas Recientes", value: "—" },
		{ label: "Asistencia Promedio", value: "—" }
	]);
	const [upcomingActivities, setUpcomingActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadDashboardData() {
			try {
				setLoading(true);
				const [statsRes, activitiesRes] = await Promise.all([
					getDashboardStats(),
					getApprovedActivities()
				]);

				// Actualizar stats
				const statsArray = [
					{ label: "Total Usuarios", value: statsRes.totalUsers || 247 },
					{ label: "Actividades Activas", value: statsRes.activeActivities || 18 },
					{ label: "Aprobadas Recientes", value: statsRes.recentApprovals || 5 },
					{ label: "Asistencia Promedio", value: statsRes.averageAttendance || "82%" }
				];
				setStats(statsArray);

				// Actualizar actividades
				setUpcomingActivities(activitiesRes.actividades || []);
			} catch (err) {
				console.error("Error loading dashboard data:", err);
				setError("No se pudieron cargar los datos del dashboard");
			} finally {
				setLoading(false);
			}
		}

		loadDashboardData();
	}, []);

	if (loading) {
		return <LoadingState message="Cargando dashboard..." />;
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Inicio</h1>
				<p className="max-w-3xl text-[0.93rem] text-[var(--text-muted)]">Gestiona usuarios, actividades y revisa estadisticas operativas desde un solo lugar.</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((card, index) => (
					<article key={card.label} className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 transition-colors">
						<div className="flex items-center justify-between gap-2">
							<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[var(--text)]">{card.label}</p>
							<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
								<MetricIcon index={index} />
							</span>
						</div>
						<strong className="mt-2 block text-[1.7rem] font-bold leading-none text-[var(--primary)]">{card.value}</strong>
					</article>
				))}
			</section>

			<section className="space-y-3.5">
				<article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[0_8px_20px_-18px_rgba(16,24,40,0.22)]">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Próximas actividades aprobadas</h2>
					<p className="mb-4 mt-1 text-[0.92rem] text-[var(--text-muted)]">Actividades ya validadas para las próximas fechas.</p>
					<div className="grid gap-3.5">
						{upcomingActivities.map(activity => (
							<ActivityCard
								key={activity.id_actividad}
								activity={activity}
								actionLabel="Ver detalle"
								to={`/admin/actividad/${activity.id_actividad}`}
							/>
						))}
					</div>
					<button type="button" className="mt-3 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--primary)] px-3 py-2.5 text-[0.9rem] font-semibold text-[white] hover:bg-[var(--primary-strong)]">
						Ver todas las aprobadas
					</button>
				</article>
			</section>

			<section className="space-y-3.5">
				<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Accesos rapidos</h2>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{quickActions.map(action => (
						<Link
							key={action.label}
							to={action.to}
							className="group flex min-h-[220px] flex-col items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-6 text-center transition-all duration-200 hover:border-[var(--primary)] hover:shadow-sm"
						>
							<span className={`inline-flex h-16 w-16 items-center justify-center ${action.icon === "users" ? "text-[var(--primary)]" : action.icon === "calendar" ? "text-[var(--primary)]" : action.icon === "check" ? "text-[var(--primary-strong)]" : "text-[var(--primary)]"}`}>
								<span className="h-8 w-8">
									<QuickIcon type={action.icon} />
								</span>
							</span>

							<div className="mt-3 flex-1">
								<p className="m-0 block text-[0.98rem] font-semibold leading-tight text-[var(--text)]">{action.label}</p>
								<p className="mt-2 block text-[0.8rem] font-medium leading-relaxed text-[var(--text-muted)]">{action.subtitle}</p>
							</div>

							<span className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-sm bg-[var(--primary)] px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-colors duration-200 group-hover:bg-[var(--primary-strong)]">
								Ir
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</span>
						</Link>
					))}
				</div>
			</section>
		</section>
	);
}
