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

import { getAdminActivities } from "../services/userViewsService";

// data will be loaded from API via getAdminActivities

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
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
					<Tooltip content={<ChartTooltip unit=" act." />} cursor={{ stroke: "#d0e9db", strokeWidth: 1 }} />
					<Area type="monotone" dataKey="value" stroke="#05a63d" strokeWidth={2.5} fill="url(#areaGreen)" dot={{ r: 3.5, stroke: "#05a63d", strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 5 }} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

function StatusDonut({ data = [] }) {
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
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={26} allowDecimals={false} />
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
					<YAxis tick={{ fill: "#8aab98", fontSize: 11 }} tickLine={false} axisLine={false} width={26} allowDecimals={false} />
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

function formatDuration(minutes) {
	const total = Math.max(0, Math.round(Number(minutes) || 0));
	if (total < 60) return `${total} min`;
	const hours = Math.floor(total / 60);
	const mins = total % 60;
	if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
	return `${hours} hr ${mins} min`;
}

function formatActivityStatus(value) {
	const raw = String(value || "").toLowerCase();
	if (raw.includes("cancel")) return { label: "Cancelada", bg: "#fff5f5", color: "#a73f3f" };
	if (raw.includes("rech")) return { label: "Rechazada", bg: "#fff5f5", color: "#a73f3f" };
	if (raw.includes("final") || raw.includes("termin") || raw.includes("complet")) return { label: "Finalizada", bg: "#eef5ff", color: "#1d4f91" };
	if (raw.includes("aprob") || raw.includes("program")) return { label: "Aprobada", bg: "#eef8f2", color: "#1f6e45" };
	if (raw.includes("pend") || raw.includes("revision")) return { label: "Pendiente", bg: "#fff9e6", color: "#7a5a00" };
	return { label: value || "Pendiente", bg: "#fff9e6", color: "#7a5a00" };
}

// ─────────────────────────────────────────
// Filter pill button
// ─────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`inline-flex min-w-[102px] items-center justify-center whitespace-nowrap rounded-sm border px-3.5 py-1.5 text-[0.82rem] font-semibold transition-all box-border ${active
				? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-none"
				: "border-[#d8e6dd] bg-white text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
	const [draftRange, setDraftRange]     = useState("");
	const [draftStart, setDraftStart]     = useState("");
	const [draftEnd, setDraftEnd]         = useState("");
	const [activeFilters, setActiveFilters] = useState({ range: "", start: "", end: "" });
	const [reportReady, setReportReady] = useState(false);
	const [tableSearch, setTableSearch]   = useState("");
	const [tableCategory, setTableCategory] = useState("Todas");
	const [activities, setActivities] = useState([]);
	const [loadingActivities, setLoadingActivities] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const [reportError, setReportError] = useState("");
	const hasGeneratedReport = reportReady;

	function parseDateYMD(str) {
		const parts = str.split("-");
		if (parts.length < 3) return null;
		return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
	}

	function getTimeFields(item) {
		const start = item.hora_inicio || item.time || item.startTime || item.hora || "";
		const end = item.hora_termino || item.endTime || item.hora_fin || "";
		return { start, end };
	}

	// fetch activities on demand (when user clicks "Generar reporte")
	async function fetchActivities() {
		setLoadingActivities(true);
		setLoadError(null);
		try {
			const data = await getAdminActivities();
			setActivities(Array.isArray(data) ? data : data || []);
		} catch (err) {
			setLoadError(err?.message || String(err));
		} finally {
			setLoadingActivities(false);
		}
	}

	function handleGenerateReport() {
		setReportError("");

		if (!draftRange) {
			setReportError("Selecciona un período antes de generar el reporte.");
			return;
		}

		if (draftRange === "custom" && (!draftStart || !draftEnd)) {
			setReportError("En período personalizado debes definir fecha de inicio y término antes de generar.");
			return;
		}

		setActiveFilters({ range: draftRange, start: draftStart, end: draftEnd });
		setReportReady(true);
		fetchActivities();
	}

	// ── Filtered by date range ──
	const filteredRows = useMemo(() => {
		if (!reportReady) return [];
		const now = new Date();
		let start;
		let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
		const { range, start: cs, end: ce } = activeFilters;

		if (range === "week") {
			start = new Date(now);
			const day = start.getDay();
			const diff = start.getDate() - (day === 0 ? 6 : day - 1);
			start.setDate(diff);
			start.setHours(0, 0, 0, 0);
		}
		else if (range === "month")  { start = new Date(now.getFullYear(), now.getMonth(), 1); }
		else if (range === "custom") { start = cs ? new Date(cs) : new Date(0); end = ce ? new Date(ce) : end; if (ce) end.setHours(23,59,59,999); }
		else                         { start = new Date(0); }

			// filter activities loaded from API
			return activities.filter(r => { const d = parseDateYMD(r.date); return d && d >= start && d <= end; });
	}, [activeFilters, activities, reportReady]);

	// ── KPI metrics ──
	const totalActivities    = filteredRows.length;
	const totalEnrolled      = filteredRows.reduce((s, r) => s + (r.enrolled || 0), 0);
	const totalCapacity      = filteredRows.reduce((s, r) => s + (r.capacity || 0), 0);
	const avgEnrolled        = totalActivities ? Math.round(totalEnrolled / totalActivities) : 0;
	const { occupancySum, occupancyCount } = filteredRows.reduce((acc, r) => {
		const cap = Number(r.capacity || r.max_participantes || 0);
		const enrolled = Number(r.enrolled || 0);
		if (cap > 0) { acc.occupancySum += enrolled / cap; acc.occupancyCount += 1; }
		return acc;
	}, { occupancySum: 0, occupancyCount: 0 });
	const avgOccupancy = occupancyCount ? Math.round((occupancySum / occupancyCount) * 100) : 0;
	const percentHighOccupancy = totalActivities ? Math.round((filteredRows.filter(r => { const cap = Number(r.capacity || r.max_participantes || 0); return cap > 0 && (Number(r.enrolled || 0) / cap) >= 0.8; }).length / totalActivities) * 100) : 0;
	const uniqueManagers     = new Set(filteredRows.map(r => r.manager)).size;
	const uniqueRooms        = new Set(filteredRows.map(r => r.place || r.room || r.location)).size;
	const avgDuration        = totalActivities ? Math.round(filteredRows.reduce((s, r) => {
		const { start, end } = getTimeFields(r);
		if (!start || !end) return s;
		const [sh, sm] = String(start).split(":").map(Number);
		const [eh, em] = String(end).split(":").map(Number);
		if (Number.isNaN(sh) || Number.isNaN(eh)) return s;
		return s + Math.max(0, (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0)));
	}, 0) / totalActivities) : 0;

	// ── Chart data ──
	const categoryData = useMemo(() => {
		const map = {};
		filteredRows.forEach(r => { map[r.category || r.type || 'Sin categoría'] = (map[r.category || r.type || 'Sin categoría'] || 0) + 1; });
		return Object.entries(map).map(([name, value]) => ({ name, value }));
	}, [filteredRows]);

	const weeklyData = useMemo(() => {
		const days = ["Lun","Mar","Mie","Jue","Vie","Sab","Dom"];
		const map  = { Lun:0, Mar:0, Mie:0, Jue:0, Vie:0, Sab:0, Dom:0 };
		filteredRows.forEach(r => { const d = parseDateYMD(r.date); if (!d) return; const index = d.getDay() === 0 ? 6 : d.getDay() - 1; map[days[index]] = (map[days[index]] || 0) + 1; });
		return Object.entries(map).map(([day, value]) => ({ day, value }));
	}, [filteredRows]);

	const monthlyData = useMemo(() => {
		const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
		const map = {};
		filteredRows.forEach(r => { const d = parseDateYMD(r.date); if (!d) return; const k = months[d.getMonth()]; map[k] = (map[k] || 0) + (r.enrolled || 0); });
		return Object.entries(map).map(([month, value]) => ({ month, value }));
	}, [filteredRows]);

	// ── Table filtering ──
	const categories = ["Todas", ...Array.from(new Set(activities.map(r => r.category || r.type || 'Sin categoría')))] ;
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
		{ label: "Duración promedio",         value: formatDuration(avgDuration), icon: Clock },
		{ label: "Encargados únicos",         value: uniqueManagers, icon: BookOpen },
		{ label: "Salas utilizadas",          value: uniqueRooms,    icon: MapPin },
		{ label: "Alta ocupación (≥80%)",     value: `${percentHighOccupancy}%`, icon: ArrowUpRight },
		{ label: "Categorías activas",        value: categoryData.length, icon: Layers }
	];

	// ── Status distribution (Aprobadas / Pendientes / Rechazadas)
	const statusSplit = useMemo(() => {
		if (!reportReady) {
			return [
				{ name: "Aprobadas", value: 0, color: "#05a63d" },
				{ name: "Pendientes", value: 0, color: "#d89c28" },
				{ name: "Rechazadas", value: 0, color: "#d1695a" }
			];
		}
		const counts = { Aprobadas: 0, Pendientes: 0, Rechazadas: 0 };
		filteredRows.forEach(r => {
			if (r.approved || String(r.state || r.status || "").toLowerCase().includes("aprob")) counts.Aprobadas += 1;
			else if (r.revision_pendiente || String(r.state || r.status || "").toLowerCase().includes("pend")) counts.Pendientes += 1;
			else if (String(r.state || r.status || "").toLowerCase().includes("rech")) counts.Rechazadas += 1;
			else counts.Pendientes += 1;
		});

		const total = counts.Aprobadas + counts.Pendientes + counts.Rechazadas;
		if (total === 0) return [
			{ name: "Aprobadas", value: 0, color: "#05a63d" },
			{ name: "Pendientes", value: 0, color: "#d89c28" },
			{ name: "Rechazadas", value: 0, color: "#d1695a" }
		];

		let a = Math.round((counts.Aprobadas / total) * 100);
		let p = Math.round((counts.Pendientes / total) * 100);
		let rj = Math.round((counts.Rechazadas / total) * 100);
		// adjust to sum 100
		const sum = a + p + rj;
		if (sum !== 100) {
			const diff = 100 - sum;
			// add difference to the largest bucket
			const maxKey = Object.entries({ a, p, rj }).sort((x, y) => y[1] - x[1])[0][0];
			if (maxKey === 'a') a += diff;
			else if (maxKey === 'p') p += diff;
			else rj += diff;
		}

		return [
			{ name: "Aprobadas", value: a, color: "#05a63d" },
			{ name: "Pendientes", value: p, color: "#d89c28" },
			{ name: "Rechazadas", value: rj, color: "#d1695a" }
		];
	}, [filteredRows, reportReady]);

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
			<div className="rounded-xl border border-[#d8e6dd] bg-[var(--panel-bg)] p-3.5 shadow-sm">
				<div className="grid gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex items-center gap-1.5">
							<Filter className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" strokeWidth={2} />
							<span className="text-[0.8rem] font-semibold text-[var(--text-muted)]">Período:</span>
							<div className="ml-1 flex items-center gap-1.5">
								{[["week","Esta semana"],["month","Este mes"],["custom","Personalizado"]].map(([val, lbl]) => (
									<FilterPill key={val} active={draftRange === val} onClick={() => setDraftRange(val)}>{lbl}</FilterPill>
								))}
							</div>
						</div>

						<div className="ml-auto flex flex-wrap items-center gap-2">
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
								className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-[0.82rem] font-semibold transition-all ${loadingActivities ? 'cursor-not-allowed border border-[var(--primary)] bg-[var(--primary)] text-white opacity-60' : 'border border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]'}`}
								onClick={handleGenerateReport}
								disabled={loadingActivities}
							>
								<ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
								{loadingActivities ? 'Generando...' : 'Generar reporte'}
							</button>
						</div>
					</div>

					{reportError && (
						<p className="m-0 rounded-sm border border-[#f0c6c6] bg-[#fff5f5] px-3 py-2 text-[0.8rem] font-medium text-[#a73f3f]">
							{reportError}
						</p>
					)}
				</div>
			</div>
				{hasGeneratedReport ? (
					<>
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
									<h2 className="m-0 text-[0.95rem] font-semibold text-[var(--text)]">Actividades por Tipo</h2>
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
											{["Actividad","Tipo","Encargado","Sala","Fecha","Horario","Estado","Ocupación"].map(h => (
												<th key={h} className="px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">{h}</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-[#edf4ef]">
										{tableRows.length === 0 ? (
											<tr>
												<td colSpan={8} className="px-4 py-8 text-center text-[0.85rem] text-[var(--text-muted)]">
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
												<td className="px-4 py-3 text-[var(--text-muted)]">{row.place || row.room || "-"}</td>
												<td className="px-4 py-3 text-[var(--text-muted)] tabular-nums whitespace-nowrap">
													{row.date ? String(row.date).split("-").reverse().join("/") : "-"}
												</td>
												<td className="px-4 py-3 text-[var(--text-muted)] tabular-nums whitespace-nowrap">
													{(() => {
														const t = getTimeFields(row);
														return `${t.start || "-"} – ${t.end || "-"}`;
													})()}
												</td>
												<td className="px-4 py-3">
													{(() => {
														const display = formatActivityStatus(row.state || row.status || row.estado);
														return (
															<span className="inline-block rounded-sm px-2 py-0.5 text-[0.72rem] font-semibold" style={{ backgroundColor: display.bg, color: display.color }}>
																{display.label}
															</span>
														);
													})()}
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
					</>
				) : null}
		</section>
	);
}