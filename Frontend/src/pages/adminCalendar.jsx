import React, { useEffect, useMemo, useState } from "react";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import { getCalendarData } from "../services/userViewsService";
import "../styles/adminPages.css";

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
		<section className="admin-page">
			<header className="admin-page-header">
				<h1>Calendario de Actividades</h1>
				<p>Explora todas las actividades disponibles</p>
			</header>

			<section className="admin-panel">
				<h2>Filtros</h2>
				<div className="admin-filter-grid" style={{ marginTop: "0.9rem" }}>
					<label>
						Tipo de actividad
						<select className="admin-select" value={selectedType} onChange={event => setSelectedType(event.target.value)}>
							{activityTypes.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</label>
					<label>
						Grupo
						<select className="admin-select" value={selectedGroup} onChange={event => setSelectedGroup(event.target.value)}>
							<option value="Todos">Todos</option>
							<option value="inscrito">Inscritos</option>
							<option value="disponible">Disponibles</option>
						</select>
					</label>
				</div>
			</section>

			<section className="admin-calendar-wrap">
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
					<div className="calendar-modal-content">
						<p>{activeActivity.description}</p>
						<p><strong>Lugar:</strong> {activeActivity.place}</p>
						<p><strong>Encargado:</strong> {activeActivity.manager}</p>
					</div>
				)}
			</Modal>
		</section>
	);
}
