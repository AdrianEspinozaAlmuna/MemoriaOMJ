import React, { useEffect, useMemo, useState } from "react";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import { getCalendarData } from "../services/userViewsService";

export default function AdminCalendar() {
	const [activities, setActivities] = useState([]);
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
						Tipo de actividad
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" value={selectedType} onChange={event => setSelectedType(event.target.value)}>
							{activityTypes.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</label>
					<label>
						Grupo
						<select className="mt-1.5 w-full rounded-[10px] border border-[#cfded5] bg-white px-3 py-2.5 text-[0.92rem] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(5,166,61,0.1)]" value={selectedGroup} onChange={event => setSelectedGroup(event.target.value)}>
							<option value="Todos">Todos</option>
							<option value="inscrito">Inscritos</option>
							<option value="disponible">Disponibles</option>
						</select>
					</label>
				</div>
			</section>

			<section className="rounded-[var(--panel-radius)] border border-[var(--panel-border)] bg-white p-4 shadow-[var(--panel-shadow)]">
				<Calendar
					activities={filtered}
					viewMode="mensual"
					monthDate={new Date(2026, 10, 1)}
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
