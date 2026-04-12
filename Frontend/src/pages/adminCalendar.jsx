import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ListFilter, Tags } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { getCalendarData } from "../services/userViewsService";

function getMonthLabel(date) {
	return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
}

export default function AdminCalendar() {
	const [activities, setActivities] = useState([]);
	const [monthDate, setMonthDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [selectedType, setSelectedType] = useState("Todos");
	const [selectedGroup, setSelectedGroup] = useState("Todos");
	const navigate = useNavigate();

	useEffect(() => {
		let mounted = true;
		getCalendarData().then(data => {
			if (!mounted) return;
			setActivities(data);
		});
		return () => {
			mounted = false;
		};
	}, []);

	const activityTypes = useMemo(() => {
		const unique = Array.from(new Set(activities.map(item => item.category)));
		return ["Todos", ...unique];
	}, [activities]);

	const filtered = useMemo(() => {
		return activities.filter(item => {
			const typeMatch = selectedType === "Todos" || item.category === selectedType;
			const groupMatch = selectedGroup === "Todos" || item.status === selectedGroup;
			return typeMatch && groupMatch;
		});
	}, [activities, selectedType, selectedGroup]);

	const monthLabel = useMemo(() => getMonthLabel(monthDate), [monthDate]);

	function goToPreviousMonth() {
		setMonthDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
	}

	function goToNextMonth() {
		setMonthDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
	}

	return (
		<section className="animate-[revealUp_0.7s_ease_both] space-y-8">
			<header className="space-y-2">
				<p className="m-0 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
				<h1 className="m-0 text-[clamp(1.8rem,2.5vw,2.3rem)] font-bold text-[var(--text)]">Calendario de actividades</h1>
				<p className="max-w-3xl text-[0.92rem] text-[var(--text-muted)]">Explora todas las actividades disponibles y filtra por tipo o grupo.</p>
			</header>

			<section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[0_8px_20px_-18px_rgba(16,24,40,0.22)] space-y-5">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<label className="grid gap-2">
						<span className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text)]">
							<Tags className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
							Tipo de actividad
						</span>
						<select className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={selectedType} onChange={event => setSelectedType(event.target.value)}>
							{activityTypes.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</label>
					<label className="grid gap-2">
						<span className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text)]">
							<ListFilter className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
							Grupo
						</span>
						<select className="rounded-sm border border-[#d8e6dd] bg-[var(--panel-bg)] px-2.5 py-1.5 text-[0.84rem] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#05a63d]/20" value={selectedGroup} onChange={event => setSelectedGroup(event.target.value)}>
							<option value="Todos">Todos</option>
							<option value="inscrito">Inscritos</option>
							<option value="disponible">Disponibles</option>
						</select>
					</label>
					<div className="flex items-end justify-start gap-2 lg:justify-end">
						<button type="button" className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.84rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30" onClick={goToPreviousMonth}>
							<ChevronLeft className="h-4 w-4" strokeWidth={2} />
							Mes anterior
						</button>
						<button type="button" className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-3.5 py-2 text-[0.84rem] font-semibold text-white transition-all hover:bg-[#0a7f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05a63d]/30" onClick={goToNextMonth}>
							Mes siguiente
							<ChevronRight className="h-4 w-4" strokeWidth={2} />
						</button>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--panel-border)] pt-4">
					<strong className="text-[0.95rem] font-semibold capitalize text-[var(--text)]">{monthLabel}</strong>
					<p className="text-[0.84rem] text-[var(--text-muted)]">Filtra y revisa la agenda completa del equipo administrativo.</p>
				</div>

				<Calendar
					activities={filtered}
					viewMode="mensual"
					monthDate={monthDate}
					onActivityClick={activity => navigate(`/admin/actividad/${activity.id}`)}
				/>
			</section>
		</section>
	);
}
