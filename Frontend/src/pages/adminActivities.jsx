import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import ActivityCard from "../components/ActivityCard";
import LoadingState from "../components/LoadingState";
import { getAdminActivities } from "../services/userViewsService";

const ITEMS_PER_PAGE = 15;

export default function AdminActivities() {
	const [currentPage, setCurrentPage] = useState(1);
	const [allActivities, setAllActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	async function loadApprovedActivities() {
		setLoading(true);
		setError("");

		const activities = await getAdminActivities({ approved: true });
		const available = (Array.isArray(activities) ? activities : []).filter(
			item => item.state === "programada" || item.state === "en_curso"
		);

		setAllActivities(available);
		setError(activities?.error || "");
		setLoading(false);
	}

	async function handleRefresh() {
		setRefreshing(true);
		setError("");

		try {
			await loadApprovedActivities();
		} catch (err) {
			setError("No se pudieron recargar las actividades disponibles.");
		} finally {
			setRefreshing(false);
		}
	}

	useEffect(() => {
		let mounted = true;

		loadApprovedActivities().catch(() => {
			if (!mounted) return;
			setAllActivities([]);
			setError("No se pudieron cargar las actividades aprobadas.");
			setLoading(false);
		});

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		function handleExternalUpdate() {
			handleRefresh();
		}

		window.addEventListener("admin:approvals-changed", handleExternalUpdate);
		return () => {
			window.removeEventListener("admin:approvals-changed", handleExternalUpdate);
		};
	}, []);

	const totalPages = Math.max(1, Math.ceil(allActivities.length / ITEMS_PER_PAGE));
	const safePage = Math.min(currentPage, totalPages);

	const pageItems = useMemo(() => {
		const start = (safePage - 1) * ITEMS_PER_PAGE;
		return allActivities.slice(start, start + ITEMS_PER_PAGE);
	}, [safePage, allActivities]);

	const showingStart = (safePage - 1) * ITEMS_PER_PAGE + 1;
	const showingEnd = Math.min(safePage * ITEMS_PER_PAGE, allActivities.length);
	const showingLabel = allActivities.length === 0 ? "Mostrando 0-0 de 0" : `Mostrando ${showingStart}-${showingEnd} de ${allActivities.length}`;

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
					<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Actividades disponibles</h1>
					<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Listado completo de actividades publicadas en formato de cards.</p>
				</div>
<div className="inline-flex items-center gap-2">
				<button
					type="button"
					onClick={handleRefresh}
					disabled={loading || refreshing}
					className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
					aria-label="Actualizar actividades disponibles"
				>
					<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
					{refreshing ? "Actualizando..." : "Actualizar"}
				</button>
				<Link to="/admin/crear-actividad" className="inline-flex items-center gap-2 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.84rem] font-semibold !text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30">
					<Plus className="h-4 w-4 !text-white" strokeWidth={2} />
					Crear actividad
				</Link>
			</div>
			</header>

			<section className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
					<h2 className="m-0 text-[1rem] font-semibold text-[var(--text)]">Catalogo general</h2>
					<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">
						{loading ? "Cargando actividades..." : showingLabel}
					</p>
				</div>

				{error && (
					<article className="mb-4 rounded-xl border border-[#f0d5cf] bg-[#fff4f2] p-3.5 shadow-sm">
						<p className="m-0 text-[0.9rem] font-medium text-[#9f3b2d]">{error}</p>
					</article>
				)}

				{loading && (
					<LoadingState
						title="Cargando actividades"
						description="Estamos consultando el catálogo de actividades disponibles."
						minHeightClass="min-h-[180px]"
						className="mb-4"
					/>
				)}

				{!loading && pageItems.length === 0 && (
					<article className="mb-4 rounded-xl p-5 ">
						<p className="text-[0.92rem] text-[var(--text-muted)]">No hay actividades aprobadas disponibles por ahora.</p>
					</article>
				)}

				<div className="grid gap-3.5">
					{!loading && pageItems.map(activity => (
						<ActivityCard key={activity.id} activity={activity} actionLabel="Gestionar" to={`/admin/actividad/${activity.id}`} />
					))}
				</div>

				<div className="flex items-center justify-between gap-3 pt-5 text-[0.82rem] text-[#6f8176] max-[760px]:flex-col max-[760px]:items-start">
					<span>Pagina {safePage} de {totalPages}</span>
					<div className="inline-flex items-center gap-1.5">
						<button
							type="button"
							className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]"
							disabled={safePage === 1}
							onClick={() => setCurrentPage(previous => Math.max(1, previous - 1))}
						>
							Anterior
						</button>
						<button type="button" className="rounded-sm px-2.5 py-1 text-[0.8rem] font-semibold text-[#177945]">
							{safePage}
						</button>
						<button
							type="button"
							className="rounded-sm border border-[var(--primary-strong)] bg-white px-2.5 py-1 text-[0.8rem] font-semibold text-[#496053] disabled:cursor-not-allowed disabled:border-[#d6e0da] disabled:bg-[#f4f7f5] disabled:text-[#95a59b]"
							disabled={safePage >= totalPages}
							onClick={() => setCurrentPage(previous => Math.min(totalPages, previous + 1))}
						>
							Siguiente
						</button>
					</div>
				</div>
			</section>
		</section>
	);
}
