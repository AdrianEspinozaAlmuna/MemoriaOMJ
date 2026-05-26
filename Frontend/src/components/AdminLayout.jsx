import React from "react";
import { ListCheck, BarChart3, Bell, CalendarDays, CheckCircle2, Circle, LayoutGrid, DoorOpen, Home, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, UserRound, Users, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAdminActivities } from "../services/userViewsService";

function decodeToken(token) {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	try {
		return JSON.parse(atob(parts[1]));
	} catch (error) {
		return null;
	}
}

function getInitials(name = "") {
	return String(name)
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() || "")
		.join("") || "A";
}

const mainLinks = [
	{ to: "/admin/dashboard", label: "Dashboard", icon: "home" },
	{ to: "/admin/usuarios", label: "Usuarios", icon: "users" },
	{ to: "/admin/aprobaciones", label: "Aprobaciones", icon: "check" },
	{ to: "/admin/calendario", label: "Calendario", icon: "calendar" },
	{ to: "/admin/actividades", label: "Actividades", icon: "list" },
	{ to: "/admin/reportes", label: "Reportes", icon: "report" },
	{ to: "/admin/imagenes", label: "Catalogo de Tipos", icon: "LayoutGrid" },
	{ to: "/admin/salas", label: "Salas", icon: "rooms" }
];

function SidebarIcon({ name, className = "h-[18px] w-[18px]" }) {
	if (name === "home") {
		return <Home aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "users") {
		return <Users aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "check") {
		return <CheckCircle2 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "calendar") {
		return <CalendarDays aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "list") {
		return <ListCheck aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "report") {
		return <BarChart3 aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "bell") {
		return <Bell aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "rooms") {
		return <DoorOpen aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "tags") {
		return <Tags aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
	if (name === "LayoutGrid") {
		return <LayoutGrid aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
	}
}

export default function AdminLayout() {
	const token = localStorage.getItem("token");
	const user = decodeToken(token);
	const location = useLocation();
	const navigate = useNavigate();
	const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
	const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState(0);

	const displayName = user?.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : "Admin Usuario";
	const displayEmail = user?.mail || user?.email || "";
	const displayInitials = getInitials(displayName);

	React.useEffect(() => {
		async function loadPendingCount() {
			try {
				const data = await getAdminActivities({ approved: false, estado: "pendiente" });
				setPendingApprovalsCount(Array.isArray(data) ? data.length : 0);
			} catch (error) {
				console.error("Error cargando aprobaciones pendientes:", error);
			}
		}

		loadPendingCount();
	}, []);

	React.useEffect(() => {
		setMobileNavOpen(false);
	}, [location.pathname]);

	React.useEffect(() => {
		document.body.dataset.adminSidebarCollapsed = sidebarCollapsed ? "1" : "0";
	}, [sidebarCollapsed]);

	React.useEffect(() => {
		function handleResize() {
			if (window.innerWidth > 980) {
				setMobileNavOpen(false);
			}
		}

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		setMobileNavOpen(false);
		navigate("/login");
	}

	function closeMobileNav() {
		setMobileNavOpen(false);
	}

	function toggleSidebar() {
		setSidebarCollapsed(previous => !previous);
	}

	function getPageTitle() {
		const path = location.pathname.replace(/\/$/, "");
		if (path.endsWith("/admin") || path.endsWith("/admin/dashboard")) return "Dashboard";
		if (path.endsWith("/admin/usuarios")) return "Usuarios";
		if (path.endsWith("/admin/aprobaciones")) return "Aprobaciones";
		if (path.endsWith("/admin/calendario")) return "Calendario";
		if (path.endsWith("/admin/actividades")) return "Actividades";
		if (path.endsWith("/admin/reportes")) return "Reportes";
		if (path.endsWith("/admin/notificaciones")) return "Notificaciones";
		if (path.endsWith("/admin/imagenes")) return "Catalogo de tipos";
		if (path.endsWith("/admin/configuracion")) return "Salas";
		return "Panel de administrador";
	}

	const navLinkClass = ({ isActive }) =>
		[
			"flex items-center gap-2 rounded-sm py-2 text-[0.92rem] font-semibold text-[#355447] [transition:background-color_150ms_ease,color_120ms_ease] hover:bg-[#edf2ef] hover:text-[#162a1e] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,166,61,0.15)]",
			sidebarCollapsed ? "px-3 min-[981px]:justify-center min-[981px]:px-0" : "px-3",
			isActive ? "bg-[var(--primary-active)] !text-[var(--primary-strong)]" : ""
		].join(" ");

	return (
		<div className={`grid min-h-screen bg-[var(--bg)] animate-[revealUp_0.7s_ease_both] max-[980px]:grid-cols-1 max-[980px]:relative ${sidebarCollapsed ? "grid-cols-[84px_minmax(0,1fr)]" : "grid-cols-[232px_minmax(0,1fr)]"}`}>
			{mobileNavOpen && <button type="button" className="fixed inset-0 z-30 hidden bg-[#10261a]/20 max-[980px]:block" onClick={closeMobileNav} aria-label="Cerrar menu" />}

			<aside className={`${mobileNavOpen ? "max-[980px]:translate-x-0" : "max-[980px]:-translate-x-[110%]"} border-r border-[#e0e5e2] bg-[white] px-3 pb-4 pt-3 min-[981px]:sticky min-[981px]:top-0 min-[981px]:h-screen min-[981px]:overflow-y-auto min-[981px]:flex min-[981px]:flex-col max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:z-[35] max-[980px]:h-screen max-[980px]:w-[236px] max-[980px]:overflow-y-auto max-[980px]:shadow-[0_16px_28px_-18px_rgba(10,27,16,0.5)] max-[980px]:transition-transform max-[980px]:duration-200 ${sidebarCollapsed ? "min-[981px]:w-[84px] min-[981px]:px-2" : "min-[981px]:w-[232px]"}`}>
				<div className={`mb-3 flex items-center gap-2 px-2 ${sidebarCollapsed ? "min-[981px]:justify-center" : ""}`}>
					<img src="/iconOMJ.jpg" alt="OMJ" className="h-7 w-7 rounded-md border border-[#d8dfda]" />
					<div className={`min-w-0 ${sidebarCollapsed ? "min-[981px]:hidden" : ""}`}>
						<p className="m-0 truncate text-[0.84rem] font-semibold text-[#455b50]">Administracion OMJ</p>
						<p className="m-0 text-[0.75rem] text-[#7a8881]">Gestion interna</p>
					</div>
				</div>


				<nav className="grid gap-1" aria-label="Menu de administracion">
					{mainLinks.map(link => (
							<NavLink
							key={link.to}
							to={link.to}
							onClick={closeMobileNav}
							className={navLinkClass}
						>
							<span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
								<SidebarIcon name={link.icon} className="h-[18px] w-[18px] shrink-0" />
							</span>
								<span className={sidebarCollapsed ? "min-[981px]:hidden" : ""}>{link.label}</span>
								{link.to === "/admin/aprobaciones" && pendingApprovalsCount > 0 && (
									<span className={`ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e03a3a] px-1 text-[0.66rem] font-bold leading-none text-white shadow-[0_8px_16px_-10px_rgba(224,58,58,0.8)] ${sidebarCollapsed ? "min-[981px]:hidden" : ""}`}>
										{pendingApprovalsCount > 9 ? "9+" : pendingApprovalsCount}
									</span>
								)}
						</NavLink>
					))}
				</nav>

				<div className="mt-5 border-t border-[#e2e6e3] pt-3 min-[981px]:mt-auto">
					<p className="mb-2 px-2 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#829087]">Cuenta</p>

					<div className={`grid gap-2 ${sidebarCollapsed ? "min-[981px]:place-items-center" : ""}`}>
						<div className={`rounded-lg px-3 py-2.5 text-left text-[0.9rem] font-semibold text-[#2f463a] ${sidebarCollapsed ? "min-[981px]:grid min-[981px]:place-items-center min-[981px]:px-0 min-[981px]:text-center" : "inline-flex items-center gap-2"}`}>
							<span className="grid h-8 w-8 place-items-center rounded-full bg-[#eef8f2] text-[var(--primary-strong)]">
								{sidebarCollapsed ? (
									<span className="text-[0.76rem] font-bold tracking-[0.03em]">{displayInitials}</span>
								) : (
									<UserRound aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
								)}
							</span>
							<span className={`grid min-w-0 ${sidebarCollapsed ? "min-[981px]:hidden" : ""}`}>
								<span className="truncate">{displayName}</span>
								{displayEmail && <span className="truncate text-[0.74rem] font-normal text-[#7a8881]">{displayEmail}</span>}
							</span>
						</div>

						<button
							type="button"
							onClick={handleLogout}
							className={`inline-flex w-full items-center rounded-sm border border-[var(--reject-hover)] bg-white py-2 text-left text-[0.84rem] font-semibold text-[var(--reject-hover)] hover:bg-[#ffefed] ${sidebarCollapsed ? "min-[981px]:justify-center min-[981px]:gap-0 min-[981px]:px-0" : "gap-2 px-2.5"}`}
						>
							<LogOut aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
							<span className={sidebarCollapsed ? "min-[981px]:hidden" : ""}>Cerrar sesion</span>
						</button>
					</div>
				</div>
			</aside>

			<section className="min-w-0">
				<div className="sticky top-0 z-20 border-b border-[#dce7df] bg-white/95 backdrop-blur">
					<div className="mx-auto flex w-full max-w items-center justify-between gap-3 px-4 py-3">
						<div className="flex min-w-0 items-center gap-3">
							<button
								type="button"
								onClick={() => setMobileNavOpen(previous => !previous)}
								className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--text)] hover:bg-[#eef7ef] min-[981px]:hidden"
								aria-expanded={mobileNavOpen}
								aria-label={mobileNavOpen ? "Cerrar menu de administracion" : "Abrir menu de administracion"}
							>
								{mobileNavOpen ? <X className="h-5 w-5" strokeWidth={1.9} /> : <Menu className="h-5 w-5" strokeWidth={1.9} />}
							</button>
							<button type="button" onClick={toggleSidebar} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--text)] hover:bg-[#eef7ef] max-[980px]:hidden" aria-label={sidebarCollapsed ? "Abrir barra lateral" : "Cerrar barra lateral"}>
								{sidebarCollapsed ? <PanelLeftOpen className="h-6 w-6" strokeWidth={1.4} /> : <PanelLeftClose className="h-6 w-6" strokeWidth={1.4} />}
							</button>
							<div className="inline-flex min-w-0 items-center gap-2 min-[981px]:hidden">
								<img src="/iconOMJ.jpg" alt="OMJ" className="h-8 w-8 shrink-0 rounded-md border border-[#d8dfda]" />
								<p className="m-0 truncate text-[1rem] font-semibold text-[var(--text)]">Plataforma Juvenil Curico</p>
							</div>
							<div className="min-w-0 max-[980px]:hidden">
								<p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">Panel de administrador</p>
								<h1 className="m-0 truncate text-[1.05rem] font-semibold text-[var(--text)]">{getPageTitle()}</h1>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => navigate("/admin/crear-actividad")}
								className="hidden h-10 items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2.5 text-[0.86rem] font-semibold text-white hover:bg-[var(--primary-strong)] min-[981px]:inline-flex"
								aria-label="Crear actividad"
							>
								<Plus aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
								Crear actividad
							</button>
							<button
								type="button"
								onClick={() => navigate("/admin/notificaciones")}
								className="hidden h-10 items-center gap-2 rounded-sm border border-[#d7e4dc] bg-white px-4 py-2.5 text-[0.86rem] font-semibold text-[#335043] hover:bg-[#f3faf5] min-[981px]:inline-flex"
								aria-label="Ir a notificaciones"
							>
								<Bell aria-hidden="true" focusable="false" className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
								Notificaciones
							</button>
							<button
								type="button"
								onClick={handleLogout}
								className="hidden h-9 w-9 items-center justify-center rounded-sm text-[#d43c3c] hover:bg-[#fff1f1] max-[980px]:inline-flex"
								aria-label="Cerrar sesion"
							>
								<LogOut aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={1.9} />
							</button>
						</div>
					</div>
				</div>
				<div className="px-4 py-5 max-[980px]:pt-6 max-[640px]:px-3.5 max-[640px]:py-4 mt-3">
					<div className="mx-auto w-full max-w-7xl">
						<Outlet />
					</div>
				</div>
			</section>
		</div>
	);
}
