import React, { useMemo, useState } from "react";
import {
	Activity, BarChart3, CalendarDays, PieChart as PieChartIcon,
	Star, TrendingUp, Users, Download, Filter, Clock,
	BookOpen, MapPin, ChevronRight, ArrowUpRight, Layers
} from "lucide-react";
import {
	ResponsiveContainer, LineChart, Line, CartesianGrid,
	XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart
} from "recharts";

// ─────────────────────────────────────────
// Static / seed data
// ─────────────────────────────────────────
const statusSplit = [
	{ name: "Aprobadas",  value: 61, color: "#05a63d" },
	{ name: "Pendientes", value: 24, color: "#d89c28" },
	{ name: "Rechazadas", value: 15, color: "#d1695a" }
];

const reportRows = [
	{ id: "rp-001", title: "Taller de Fotografia Urbana",    category: "Arte",      manager: "Ana Martinez",     room: "Sala Creativa",    date: "2026-04-12", startTime: "16:00", endTime: "18:00", enrolled: 18, capacity: 22 },
	{ id: "rp-002", title: "Laboratorio de Empleabilidad",   category: "Formacion", manager: "Pedro Soto",       room: "Lab OMJ",          date: "2026-04-13", startTime: "10:00", endTime: "12:30", enrolled: 20, capacity: 28 },
	{ id: "rp-003", title: "Entrenamiento Funcional",        category: "Deporte",   manager: "Valentina Rojas",  room: "Cancha Multiuso",  date: "2026-04-14", startTime: "18:00", endTime: "19:30", enrolled: 25, capacity: 30 },
	{ id: "rp-004", title: "Club de Ingles Conversacional",  category: "Idiomas",   manager: "Sofia Munoz",      room: "Aula 3",           date: "2026-04-15", startTime: "15:30", endTime: "17:00", enrolled: 12, capacity: 20 },
	{ id: "rp-005", title: "Ciclo de Cine Comunitario",      category: "Cultural",  manager: "Lucas Ramirez",    room: "Auditorio",        date: "2026-04-16", startTime: "19:00", endTime: "21:00", enrolled: 31, capacity: 45 },
	{ id: "rp-006", title: "Taller de Finanzas Personales",  category: "Formacion", manager: "Matias Silva",     room: "Sala Innovacion",  date: "2026-04-17", startTime: "14:30", endTime: "16:00", enrolled: 16, capacity: 26 },
	{ id: "rp-007", title: "Foro de Innovacion Juvenil",     category: "Formacion", manager: "Camila Torres",    room: "Salon Principal",  date: "2026-04-18", startTime: "11:00", endTime: "13:00", enrolled: 27, capacity: 35 },
	{ id: "rp-008", title: "Clinica de Futbol Sala",         category: "Deporte",   manager: "Diego Perez",      room: "Gimnasio",         date: "2026-04-19", startTime: "17:00", endTime: "19:00", enrolled: 19, capacity: 24 },
	{ id: "rp-009", title: "Introduccion a Podcast",         category: "Cultural",  manager: "Sofia Munoz",      room: "Sala Multimedia",  date: "2026-04-20", startTime: "10:30", endTime: "12:00", enrolled: 14, capacity: 20 },
	{ id: "rp-010", title: "Muralismo Comunitario",          category: "Arte",      manager: "Lucas Ramirez",    room: "Patio OMJ",        date: "2026-04-21", startTime: "15:00", endTime: "18:00", enrolled: 17, capacity: 24 }
];

// ─────────────────────────────────────────
// Shared tooltip
// ─────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit = "" }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-[#d8e6dd] bg-white px-3 py-2 text-[0.78rem] shadow-sm">
			<p className="m-0 font-semibold text-[var(--text)]">{label}</p>
			<p className="m-0 text-[var(--text-muted)]">{payload[0].value}{unit}</p>
		</div>
	);
}

// ─────────────────────────────────────────
// Charts
// ─────────────────────────────────────────
function AttendanceChart({ data }) {
	return (
		<div className="h-[200px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
					<defs>
						<linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%"   stopColor="#05a63d" stopOpacity={0.15} />
							<stop offset="100%" stopColor="#05a63d" stopOpacity={0.01} />
						</linearGradient>
					</defs>
					<CartesianGrid stroke="#edf4ef" strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="month" tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
					<Tooltip content={<ChartTooltip unit=" act." />} cursor={{ stroke: "#d0e9db", strokeWidth: 1 }} />
					<Area type="monotone" dataKey="value" stroke="#05a63d" strokeWidth={2.5} fill="url(#areaGreen)" dot={{ r: 3.5, stroke: "#05a63d", strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 5 }} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

function StatusDonut({ data = statusSplit }) {
	const total = data.reduce((a, c) => a + c.value, 0);
	return (
		<div className="flex flex-col gap-4">
			<div className="mx-auto h-[150px] w-[150px] relative">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie data={data} dataKey="value" innerRadius={44} outerRadius={66} paddingAngle={3} stroke="none">
							{data.map(item => <Cell key={item.name} fill={item.color} />)}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
					<p className="m-0 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Total</p>
					<p className="m-0 text-[1.3rem] font-bold text-[var(--text)]">{total}%</p>
				</div>
			</div>
			<div className="space-y-1">
				{data.map(item => (
					<div key={item.name} className="flex items-center justify-between gap-3 rounded-md bg-[#f8fcf9] px-3 py-2">
						<span className="inline-flex items-center gap-2 text-[0.85rem] text-[var(--text)]">
							<span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
							{item.name}
						</span>
						<strong className="text-[0.88rem] tabular-nums text-[var(--text)]">{item.value}%</strong>
					</div>
				))}
			</div>
		</div>
	);
}

function CategoryBarChart({ data }) {
	return (
		<div className="h-[180px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
					<CartesianGrid stroke="#edf4ef" strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="name" tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={26} />
					<Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(5,166,61,0.05)" }} />
					<Bar dataKey="value" fill="#05a63d" radius={[6, 6, 0, 0]} maxBarSize={28} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

function WeeklyBarChart({ data }) {
	return (
		<div className="h-[180px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
					<CartesianGrid stroke="#edf4ef" strokeDasharray="3 3" vertical={false} />
					<XAxis dataKey="day" tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={26} />
					<Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(5,166,61,0.05)" }} />
					<Bar dataKey="value" fill="#1aad5c" radius={[6, 6, 0, 0]} maxBarSize={26} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

// ─────────────────────────────────────────
// Occupancy mini-bar
// ─────────────────────────────────────────
function OccupancyBar({ enrolled, capacity }) {
	const pct = Math.min(Math.round((enrolled / capacity) * 100), 100);
	const color = pct >= 90 ? "#d1695a" : pct >= 75 ? "#05a63d" : "#adbfa8";
	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 w-20 rounded-full bg-[#e4ede7]">
				<div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
			</div>
			<span className="text-[0.76rem] font-semibold tabular-nums" style={{ color }}>{pct}%</span>
		</div>
	);
}

// ─────────────────────────────────────────
// Category tag
// ─────────────────────────────────────────
const categoryColors = {
	Arte:      { bg: "#f3f0ff", text: "#5b3fc4" },
	Formacion: { bg: "#eef8f2", text: "#1f6e45" },
	Deporte:   { bg: "#fff4ed", text: "#8a4b1a" },
	Cultural:  { bg: "#eef5ff", text: "#1d4f91" },
	Idiomas:   { bg: "#fff9e6", text: "#7a5a00" }
};

function CategoryTag({ name }) {
	const style = categoryColors[name] || { bg: "#f5f5f5", text: "#555" };
	return (
		<span className="inline-block rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
			{name}
		</span>
	);
}

// ─────────────────────────────────────────
// Filter pill button
// ─────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-lg px-3.5 py-1.5 text-[0.82rem] font-semibold transition-all ${active
				? "bg-[var(--primary)] text-white shadow-sm"
				: "bg-white border border-[#d8e6dd] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
			}`}
		>
			{children}
		</button>
	);
}

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────
export default function AdminReports() {
	const [draftRange, setDraftRange]     = useState("month");
	const [draftStart, setDraftStart]     = useState("");
	const [draftEnd, setDraftEnd]         = useState("");
	const [activeFilters, setActiveFilters] = useState({ range: "month", start: "", end: "" });
	const [tableSearch, setTableSearch]   = useState("");
	const [tableCategory, setTableCategory] = useState("Todas");

	function parseDateYMD(str) {
		const parts = str.split("-");
		if (parts.length < 3) return null;
		return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
	}

	// ── Filtered by date range ──
	const filteredRows = useMemo(() => {
		const now = new Date();
		let start;
		let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
		const { range, start: cs, end: ce } = activeFilters;

		if (range === "week")        { start = new Date(); start.setDate(now.getDate() - 7); }
		else if (range === "month")  { start = new Date(); start.setDate(now.getDate() - 30); }
		else if (range === "custom") { start = cs ? new Date(cs) : new Date(0); end = ce ? new Date(ce) : end; if (ce) end.setHours(23,59,59,999); }
		else                         { start = new Date(0); }

		return reportRows.filter(r => { const d = parseDateYMD(r.date); return d && d >= start && d <= end; });
	}, [activeFilters]);

	// ── KPI metrics ──
	const totalActivities    = filteredRows.length;
	const totalEnrolled      = filteredRows.reduce((s, r) => s + (r.enrolled || 0), 0);
	const totalCapacity      = filteredRows.reduce((s, r) => s + (r.capacity || 0), 0);
	const avgEnrolled        = totalActivities ? Math.round(totalEnrolled / totalActivities) : 0;
	const avgOccupancy       = totalActivities ? Math.round((filteredRows.reduce((s, r) => s + r.enrolled / r.capacity, 0) / totalActivities) * 100) : 0;
	const percentHighOccupancy = totalActivities ? Math.round((filteredRows.filter(r => r.enrolled / r.capacity >= 0.8).length / totalActivities) * 100) : 0;
	const uniqueManagers     = new Set(filteredRows.map(r => r.manager)).size;
	const uniqueRooms        = new Set(filteredRows.map(r => r.room)).size;
	const avgDuration        = totalActivities ? Math.round(filteredRows.reduce((s, r) => {
		const [sh, sm] = r.startTime.split(":").map(Number);
		const [eh, em] = r.endTime.split(":").map(Number);
		return s + Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
	}, 0) / totalActivities) : 0;

	// ── Chart data ──
	const categoryData = useMemo(() => {
		const map = {};
		filteredRows.forEach(r => { map[r.category] = (map[r.category] || 0) + 1; });
		return Object.entries(map).map(([name, value]) => ({ name, value }));
	}, [filteredRows]);

	const weeklyData = useMemo(() => {
		const days = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
		const map  = { Dom:0, Lun:0, Mar:0, Mie:0, Jue:0, Vie:0, Sab:0 };
		filteredRows.forEach(r => { const d = parseDateYMD(r.date); if (!d) return; map[days[d.getDay()]] = (map[days[d.getDay()]] || 0) + 1; });
		return Object.entries(map).map(([day, value]) => ({ day, value }));
	}, [filteredRows]);

	const monthlyData = useMemo(() => {
		const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
		const map = {};
		filteredRows.forEach(r => { const d = parseDateYMD(r.date); if (!d) return; const k = months[d.getMonth()]; map[k] = (map[k] || 0) + (r.enrolled || 0); });
		return Object.entries(map).map(([month, value]) => ({ month, value }));
	}, [filteredRows]);

	// ── Table filtering ──
	const categories = ["Todas", ...Array.from(new Set(reportRows.map(r => r.category)))];
	const tableRows = useMemo(() => {
		return filteredRows.filter(r => {
			const matchSearch = !tableSearch || r.title.toLowerCase().includes(tableSearch.toLowerCase()) || r.manager.toLowerCase().includes(tableSearch.toLowerCase());
			const matchCat = tableCategory === "Todas" || r.category === tableCategory;
			return matchSearch && matchCat;
		});
	}, [filteredRows, tableSearch, tableCategory]);

	const kpiCards = [
		{ label: "Actividades",      value: `${totalActivities}`,   icon: Activity,    sub: "en el período" },
		{ label: "Inscritos",        value: `${totalEnrolled}`,      icon: Users,       sub: `cap. total ${totalCapacity}` },
		{ label: "Ocupación media",  value: `${avgOccupancy}%`,      icon: TrendingUp,  sub: `${percentHighOccupancy}% con ≥80%` },
		{ label: "Valoración media", value: "4.6 / 5",               icon: Star,        sub: "basado en reseñas" }
	];

	const extraCards = [
		{ label: "Promedio inscritos / act.", value: avgEnrolled,    icon: Users },
		{ label: "Duración promedio",         value: `${avgDuration} min`, icon: Clock },
		{ label: "Encargados únicos",         value: uniqueManagers, icon: BookOpen },
		{ label: "Salas utilizadas",          value: uniqueRooms,    icon: MapPin },
		{ label: "Alta ocupación (≥80%)",     value: `${percentHighOccupancy}%`, icon: ArrowUpRight },
		{ label: "Categorías activas",        value: categoryData.length, icon: Layers }
	];

	return (
		<section className="animate-[revealUp_0.7s_ease_both] grid gap-6 pb-8">

			{/* ── PAGE HEADER ── */}
			<header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1">
					<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">
						Panel de administrador
					</p>
					<h1 className="m-0 text-[clamp(1.5rem,2.4vw,2rem)] font-bold text-[var(--text)]">Reportes</h1>
					<p className="m-0 text-[0.9rem] text-[var(--text-muted)]">
						Monitorea rendimiento, participación y actividad de la plataforma.
					</p>
				</div>
			</header>

			{/* ── FILTER BAR ── */}
			<div className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-4 shadow-sm">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-1.5">
						<Filter className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" strokeWidth={2} />
						<span className="text-[0.8rem] font-semibold text-[var(--text-muted)]">Período:</span>
						<div className="ml-1 flex items-center gap-1.5">
							{[["week","Última semana"],["month","Mes actual"],["custom","Personalizado"]].map(([val, lbl]) => (
								<FilterPill key={val} active={draftRange === val} onClick={() => setDraftRange(val)}>{lbl}</FilterPill>
							))}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{draftRange === "custom" && (
							<div className="flex items-center gap-2">
								<input
									type="date"
									value={draftStart}
									onChange={e => setDraftStart(e.target.value)}
									className="rounded-lg border border-[#d8e6dd] px-2.5 py-1.5 text-[0.82rem] text-[var(--text)] bg-white outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
								/>
								<span className="text-[0.8rem] text-[var(--text-muted)]">—</span>
								<input
									type="date"
									value={draftEnd}
									onChange={e => setDraftEnd(e.target.value)}
									className="rounded-lg border border-[#d8e6dd] px-2.5 py-1.5 text-[0.82rem] text-[var(--text)] bg-white outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
								/>
							</div>
						)}
						<button
							type="button"
							className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--primary)] bg-[var(--primary)] px-4 py-1.5 text-[0.82rem] font-semibold text-white transition-all hover:bg-[var(--primary-strong)]"
							onClick={() => setActiveFilters({ range: draftRange, start: draftStart, end: draftEnd })}
						>
							<ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
							Generar reporte
						</button>
					</div>
				</div>
			</div>

			{/* ── KPI CARDS ── */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{kpiCards.map(({ label, value, icon: Icon, sub }) => (
					<article key={label} className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] px-5 py-4 shadow-sm">
						<div className="flex items-start justify-between gap-2">
							<p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</p>
							<span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef8f2] text-[var(--primary)]">
								<Icon className="h-4 w-4" strokeWidth={1.8} />
							</span>
						</div>
						<strong className="mt-2 block text-[1.9rem] font-bold leading-none tracking-tight text-[var(--primary)]">{value}</strong>
						<p className="m-0 mt-1.5 text-[0.76rem] text-[var(--text-muted)]">{sub}</p>
					</article>
				))}
			</div>

			{/* ── EXTRA STATS GRID ── */}
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				{extraCards.map(({ label, value, icon: Icon }) => (
				<article key={label} className="rounded-lg border border-[#d8e6dd] bg-white px-4 py-3.5 shadow-sm">
						<div className="flex items-center gap-2 mb-2">
							<Icon className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.8} />
							<p className="m-0 text-[0.73rem] font-semibold text-[var(--text-muted)]">{label}</p>
						</div>
						<p className="m-0 text-[1.25rem] font-bold tabular-nums text-[var(--text)]">{value}</p>
					</article>
				))}
			</div>

			{/* ── CHARTS ROW 1 ── */}
			<div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
				{/* Attendance trend */}
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
							<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Inscritos por mes</h2>
						</div>
						<span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f2] px-2.5 py-1 text-[0.73rem] font-semibold text-[#1e7f4c]">
							<ArrowUpRight className="h-3 w-3" />
							tendencia positiva
						</span>
					</div>
					<AttendanceChart data={monthlyData} />
				</article>

				{/* Status donut */}
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<PieChartIcon className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
						<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Estado de actividades</h2>
					</div>
					<StatusDonut data={statusSplit} />
				</article>
			</div>

			{/* ── CHARTS ROW 2 ── */}
			<div className="grid gap-4 xl:grid-cols-2">
				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<BarChart3 className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
						<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Actividades por categoría</h2>
					</div>
					<CategoryBarChart data={categoryData} />
				</article>

				<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-5 shadow-sm">
					<div className="mb-4 flex items-center gap-2">
						<CalendarDays className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
						<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Distribución semanal</h2>
					</div>
					<WeeklyBarChart data={weeklyData} />
				</article>
			</div>

			{/* ── ACTIVITY TABLE ── */}
			<article className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] shadow-sm overflow-hidden">
				{/* Table header */}
				<div className="flex flex-col gap-3 border-b border-[#e4ede7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Detalle por actividad</h2>
						<p className="m-0 mt-0.5 text-[0.78rem] text-[var(--text-muted)]">{tableRows.length} actividad{tableRows.length !== 1 ? "es" : ""} en el período seleccionado</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{/* Search */}
						<input
							type="text"
							value={tableSearch}
							onChange={e => setTableSearch(e.target.value)}
							placeholder="Buscar por nombre o encargado…"
							className="rounded-lg border border-[#d8e6dd] px-3 py-1.5 text-[0.82rem] text-[var(--text)] bg-white outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 w-[220px]"
						/>
						{/* Category filter */}
						<select
							value={tableCategory}
							onChange={e => setTableCategory(e.target.value)}
							className="rounded-lg border border-[#d8e6dd] px-2.5 py-1.5 text-[0.82rem] text-[var(--text)] bg-white outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
						>
							{categories.map(c => <option key={c} value={c}>{c}</option>)}
						</select>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full min-w-[720px] text-[0.84rem]">
						<thead>
							<tr className="border-b border-[#e4ede7] bg-[#f8fbf9]">
								{["Actividad","Categoría","Encargado","Sala","Fecha","Horario","Ocupación"].map(h => (
									<th key={h} className="px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{h}</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-[#edf4ef]">
							{tableRows.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-8 text-center text-[0.85rem] text-[var(--text-muted)]">
										No hay actividades para el período y filtros seleccionados.
									</td>
								</tr>
							) : tableRows.map(row => (
								<tr key={row.id} className="bg-white transition-colors hover:bg-[#f8fbf9]">
									<td className="px-4 py-3">
										<p className="m-0 font-semibold text-[var(--text)] leading-snug">{row.title}</p>
									</td>
									<td className="px-4 py-3">
										<CategoryTag name={row.category} />
									</td>
									<td className="px-4 py-3 text-[var(--text-muted)]">{row.manager}</td>
									<td className="px-4 py-3 text-[var(--text-muted)]">{row.room}</td>
									<td className="px-4 py-3 text-[var(--text-muted)] tabular-nums whitespace-nowrap">
										{row.date.split("-").reverse().join("/")}
									</td>
									<td className="px-4 py-3 text-[var(--text-muted)] tabular-nums whitespace-nowrap">
										{row.startTime} – {row.endTime}
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-col gap-1">
											<span className="text-[0.78rem] tabular-nums text-[var(--text-muted)]">{row.enrolled}/{row.capacity}</span>
											<OccupancyBar enrolled={row.enrolled} capacity={row.capacity} />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</article>

		</section>
	);
}