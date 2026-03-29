import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ListFilter, Tags } from "lucide-react";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
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
	const [activeActivity, setActiveActivity] = useState(null);

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
		<section className="grid gap-4">
			<header className="pb-0.5 pt-1.5 after:mt-3.5 after:block after:h-1 after:w-[min(210px,46vw)] after:rounded-full after:bg-[var(--header-accent)] after:opacity-45 after:content-['']">
				<h1 className="m-0 text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold text-[var(--text)]">Calendario de Actividades</h1>
				<p className="mt-1.5 text-[0.98rem] text-[var(--text-muted)]">Explora todas las actividades disponibles</p>
			</header>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)]">
				<h2 className="m-0 text-[1.08rem] font-bold text-[#23392d]">Filtros</h2>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<label>
						<span className="inline-flex items-center gap-1.5">
							<Tags className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
							Tipo de actividad
						</span>
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" value={selectedType} onChange={event => setSelectedType(event.target.value)}>
							{activityTypes.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</label>
					<label>
						<span className="inline-flex items-center gap-1.5">
							<ListFilter className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.9} />
							Grupo
						</span>
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" value={selectedGroup} onChange={event => setSelectedGroup(event.target.value)}>
							<option value="Todos">Todos</option>
							<option value="inscrito">Inscritos</option>
							<option value="disponible">Disponibles</option>
						</select>
					</label>
				</div>
			</section>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white p-4 shadow-[var(--panel-shadow)]">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d8e6dd] bg-[#f7fbf9] px-3.5 py-2.5">
					<strong className="text-[0.95rem] capitalize text-[var(--text)]">{monthLabel}</strong>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-[0.84rem] font-semibold text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]"
							onClick={goToPreviousMonth}
						>
							<ChevronLeft className="h-4 w-4" strokeWidth={2} />
							Mes anterior
						</button>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-[0.84rem] font-semibold text-white transition-colors hover:border-[var(--primary-strong)] hover:bg-[var(--primary-strong)]"
							onClick={goToNextMonth}
						>
							Mes siguiente
							<ChevronRight className="h-4 w-4" strokeWidth={2} />
						</button>
					</div>
				</div>
				<Calendar
					activities={filtered}
					viewMode="mensual"
					monthDate={monthDate}
					onActivityClick={setActiveActivity}
				/>
			</section>

			<Modal
				isOpen={Boolean(activeActivity)}
				title={activeActivity?.title}
				onClose={() => setActiveActivity(null)}
				footer={
					<button type="button" className="btn btn-ghost" onClick={() => setActiveActivity(null)}>
						Cerrar
					</button>
				}
			>
				{activeActivity && (
					<div>
						<p className="mt-2 text-[var(--text-muted)]">{activeActivity.description}</p>
						<p className="mt-2 text-[var(--text-muted)]"><strong>Lugar:</strong> {activeActivity.place}</p>
						<p className="mt-2 text-[var(--text-muted)]"><strong>Encargado:</strong> {activeActivity.manager}</p>
					</div>
				)}
			</Modal>
		</section>
	);
}
