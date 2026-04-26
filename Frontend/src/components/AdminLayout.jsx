import React from "react";
import { Activity, BarChart3, Bell, CalendarDays, CheckCircle2, Circle, DoorOpen, LayoutDashboard, LogOut, Menu, UserRound, Users, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

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

const mainLinks = [
	{ to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
	{ to: "/admin/usuarios", label: "Usuarios", icon: "users" },
	{ to: "/admin/aprobaciones", label: "Aprobaciones", icon: "check" },
	{ to: "/admin/calendario", label: "Calendario", icon: "calendar" },
	{ to: "/admin/actividades", label: "Actividades", icon: "activity" },
	{ to: "/admin/reportes", label: "Reportes", icon: "report" },
	{ to: "/admin/notificaciones", label: "Notificaciones", icon: "bell" },
	{ to: "/admin/configuracion", label: "Salas", icon: "rooms" }
];

function SidebarIcon({ name, className = "h-4 w-4" }) {
	if (name === "dashboard") {
		return <LayoutDashboard aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
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
	if (name === "activity") {
		return <Activity aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
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
	return <Circle aria-hidden="true" focusable="false" className={className} strokeWidth={1.8} />;
}

export default function AdminLayout() {
	const token = localStorage.getItem("token");
	const user = decodeToken(token);
	const location = useLocation();
	const navigate = useNavigate();
	const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

	const displayName = user?.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : "Admin Usuario";
	const displayEmail = user?.mail || user?.email || "";

	React.useEffect(() => {
		setMobileNavOpen(false);
	}, [location.pathname]);

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

	const navLinkClass = ({ isActive }) =>
		[
			"flex items-center gap-2 rounded-sm px-3 py-2 text-[0.92rem] font-semibold text-[#355447] [transition:background-color_150ms_ease,color_120ms_ease] hover:bg-[#edf2ef] hover:text-[#162a1e] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(5,166,61,0.15)]",
			isActive ? "bg-[var(--primary-active)] !text-[var(--primary-strong)]" : ""
		].join(" ");

	return (
		<div className="grid min-h-screen grid-cols-[232px_minmax(0,1fr)] bg-[var(--bg-neutral)] animate-[revealUp_0.7s_ease_both] max-[980px]:grid-cols-1 max-[980px]:relative">
			<button
				type="button"
				className="fixed left-3 top-3 z-40 hidden h-9 w-9 items-center justify-center rounded-sm border border-[#d8e6dd] bg-white text-[#2f463a] shadow-[0_8px_20px_-16px_rgba(10,27,16,0.45)] max-[980px]:inline-flex"
				onClick={() => setMobileNavOpen(previous => !previous)}
				aria-expanded={mobileNavOpen}
				aria-label={mobileNavOpen ? "Cerrar menu de administracion" : "Abrir menu de administracion"}
			>
				{mobileNavOpen ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
			</button>

			{mobileNavOpen && <button type="button" className="fixed inset-0 z-30 hidden bg-[#10261a]/20 max-[980px]:block" onClick={closeMobileNav} aria-label="Cerrar menu" />}

			<aside className={`${mobileNavOpen ? "max-[980px]:translate-x-0" : "max-[980px]:-translate-x-[110%]"} border-r border-[#e0e5e2] bg-[#f7f8f7] px-3 pb-4 pt-3 min-[981px]:sticky min-[981px]:top-0 min-[981px]:h-screen min-[981px]:overflow-y-auto min-[981px]:flex min-[981px]:flex-col max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:z-[35] max-[980px]:h-screen max-[980px]:w-[236px] max-[980px]:overflow-y-auto max-[980px]:shadow-[0_16px_28px_-18px_rgba(10,27,16,0.5)] max-[980px]:transition-transform max-[980px]:duration-200`}>
				<div className="mb-3 flex items-center gap-2 px-2">
					<img src="/iconOMJ.jpg" alt="OMJ" className="h-7 w-7 rounded-md border border-[#d8dfda]" />
					<div className="min-w-0">
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
							<SidebarIcon name={link.icon} className="h-4 w-4" />
							<span>{link.label}</span>
							{link.label === "Aprobaciones"}
						</NavLink>
					))}
				</nav>

				<div className="mt-5 border-t border-[#e2e6e3] pt-3 min-[981px]:mt-auto">
					<p className="mb-2 px-2 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#829087]">Cuenta</p>

					<div className="grid gap-2">
						<div className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[0.9rem] font-semibold text-[#2f463a]">
							<span className="grid h-8 w-8 place-items-center text-[var(--primary-strong)]">
								<UserRound aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
							</span>
							<span className="grid min-w-0">
								<span className="truncate">{displayName}</span>
								{displayEmail && <span className="truncate text-[0.74rem] font-normal text-[#7a8881]">{displayEmail}</span>}
							</span>
						</div>

						<button
							type="button"
							onClick={handleLogout}
							className="inline-flex w-full items-center gap-2 rounded-sm border border-[var(--reject-hover)] bg-white px-2.5 py-2 text-left text-[0.84rem] font-semibold text-[var(--reject-hover)] hover:bg-[#ffefed]"
						>
							<LogOut aria-hidden="true" focusable="false" className="h-4 w-4" strokeWidth={2} />
							Cerrar sesion
						</button>
					</div>
				</div>
			</aside>

			<section className="min-w-0">
				<div className="px-4 py-5 max-[980px]:pt-14 max-[640px]:px-3.5 max-[640px]:py-4 max-[640px]:pt-14">
					<div className="mx-auto w-full max-w-7xl">
						<Outlet />
					</div>
				</div>
			</section>
		</div>
	);
}
